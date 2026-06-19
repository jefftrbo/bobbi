const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'contacts_db',
  user: process.env.DB_USER || 'contacts_user',
  password: process.env.DB_PASSWORD || 'contacts_secure_pass',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// ============================================================================
// CONTACTS ENDPOINTS
// ============================================================================

// GET all contacts with optional search and filtering
app.get('/api/contacts', async (req, res) => {
  try {
    const { search, group_id, from_date, to_date, sort = 'id', order = 'ASC' } = req.query;
    
    let query = `
      SELECT c.id, c.name, c.address, c.created_at, c.updated_at,
             COALESCE(
               (SELECT json_agg(json_build_object('id', g2.id, 'name', g2.name))
                FROM contact_groups cg2
                JOIN groups g2 ON cg2.group_id = g2.id
                WHERE cg2.contact_id = c.id), '[]'
             ) as groups
      FROM contacts c
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    // Full-text search
    if (search) {
      query += ` AND c.search_vector @@ plainto_tsquery('english', $${paramCount})`;
      params.push(search);
      paramCount++;
    }
    
    // Filter by group
    if (group_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM contact_groups cg3
        WHERE cg3.contact_id = c.id AND cg3.group_id = $${paramCount}
      )`;
      params.push(parseInt(group_id));
      paramCount++;
    }
    
    // Filter by date range
    if (from_date) {
      query += ` AND c.created_at >= $${paramCount}`;
      params.push(from_date);
      paramCount++;
    }
    
    if (to_date) {
      query += ` AND c.created_at <= $${paramCount}`;
      params.push(to_date);
      paramCount++;
    }
    
    // Sorting
    const validSorts = ['id', 'name', 'created_at', 'updated_at'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSorts.includes(sort) ? sort : 'id';
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';
    
    query += ` ORDER BY c.${sortField} ${sortOrder}`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// GET single contact by ID with groups
app.get('/api/contacts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(`
      SELECT c.id, c.name, c.address, c.created_at, c.updated_at,
             COALESCE(json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) 
               FILTER (WHERE g.id IS NOT NULL), '[]') as groups
      FROM contacts c
      LEFT JOIN contact_groups cg ON c.id = cg.contact_id
      LEFT JOIN groups g ON cg.group_id = g.id
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.address, c.created_at, c.updated_at
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// POST create new contact
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, address, group_ids = [] } = req.body;
    
    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert contact
      const contactResult = await client.query(
        'INSERT INTO contacts (name, address) VALUES ($1, $2) RETURNING id, name, address, created_at, updated_at',
        [name, address]
      );
      
      const contact = contactResult.rows[0];
      
      // Add to groups if specified
      if (group_ids.length > 0) {
        for (const groupId of group_ids) {
          await client.query(
            'INSERT INTO contact_groups (contact_id, group_id) VALUES ($1, $2)',
            [contact.id, groupId]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Fetch contact with groups
      const result = await pool.query(`
        SELECT c.id, c.name, c.address, c.created_at, c.updated_at,
               COALESCE(json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) 
                 FILTER (WHERE g.id IS NOT NULL), '[]') as groups
        FROM contacts c
        LEFT JOIN contact_groups cg ON c.id = cg.contact_id
        LEFT JOIN groups g ON cg.group_id = g.id
        WHERE c.id = $1
        GROUP BY c.id
      `, [contact.id]);
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT update contact
app.put('/api/contacts/:id', async (req, res) => {
  try {
    const { name, address, group_ids } = req.body;
    const id = parseInt(req.params.id);
    
    if (!name || !address) {
      return res.status(400).json({ error: 'Name and address are required' });
    }
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update contact
      const result = await client.query(
        'UPDATE contacts SET name = $1, address = $2 WHERE id = $3 RETURNING id, name, address, created_at, updated_at',
        [name, address, id]
      );
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Contact not found' });
      }
      
      // Update groups if specified
      if (group_ids !== undefined) {
        // Remove existing groups
        await client.query('DELETE FROM contact_groups WHERE contact_id = $1', [id]);
        
        // Add new groups
        if (group_ids.length > 0) {
          for (const groupId of group_ids) {
            await client.query(
              'INSERT INTO contact_groups (contact_id, group_id) VALUES ($1, $2)',
              [id, groupId]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      
      // Fetch updated contact with groups
      const updatedResult = await pool.query(`
        SELECT c.id, c.name, c.address, c.created_at, c.updated_at,
               COALESCE(json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) 
                 FILTER (WHERE g.id IS NOT NULL), '[]') as groups
        FROM contacts c
        LEFT JOIN contact_groups cg ON c.id = cg.contact_id
        LEFT JOIN groups g ON cg.group_id = g.id
        WHERE c.id = $1
        GROUP BY c.id
      `, [id]);
      
      res.json(updatedResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// ============================================================================
// GROUPS ENDPOINTS
// ============================================================================

// GET all groups
app.get('/api/groups', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT g.id, g.name, g.description, g.created_at, g.updated_at,
             COUNT(cg.contact_id) as contact_count
      FROM groups g
      LEFT JOIN contact_groups cg ON g.id = cg.group_id
      GROUP BY g.id
      ORDER BY g.name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// GET single group by ID
app.get('/api/groups/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(`
      SELECT g.id, g.name, g.description, g.created_at, g.updated_at,
             COUNT(cg.contact_id) as contact_count
      FROM groups g
      LEFT JOIN contact_groups cg ON g.id = cg.group_id
      WHERE g.id = $1
      GROUP BY g.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// POST create new group
app.post('/api/groups', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO groups (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at, updated_at',
      [name, description || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Group name already exists' });
    }
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// PUT update group
app.put('/api/groups/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const id = parseInt(req.params.id);
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const result = await pool.query(
      'UPDATE groups SET name = $1, description = $2 WHERE id = $3 RETURNING id, name, description, created_at, updated_at',
      [name, description || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Group name already exists' });
    }
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// DELETE group
app.delete('/api/groups/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      'DELETE FROM groups WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// ============================================================================
// AUDIT LOG ENDPOINTS
// ============================================================================

// GET audit log with optional filtering
app.get('/api/audit', async (req, res) => {
  try {
    const { table_name, record_id, action, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM audit_log WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (table_name) {
      query += ` AND table_name = $${paramCount}`;
      params.push(table_name);
      paramCount++;
    }
    
    if (record_id) {
      query += ` AND record_id = $${paramCount}`;
      params.push(parseInt(record_id));
      paramCount++;
    }
    
    if (action) {
      query += ` AND action = $${paramCount}`;
      params.push(action.toUpperCase());
      paramCount++;
    }
    
    query += ` ORDER BY changed_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// GET audit log for specific contact
app.get('/api/contacts/:id/history', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      `SELECT * FROM audit_log 
       WHERE table_name = 'contacts' AND record_id = $1 
       ORDER BY changed_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contact history:', error);
    res.status(500).json({ error: 'Failed to fetch contact history' });
  }
});

// ============================================================================
// BACKUP/RESTORE ENDPOINTS
// ============================================================================

// GET export all contacts as JSON
app.get('/api/export/contacts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.name, c.address, c.created_at, c.updated_at,
             COALESCE(json_agg(DISTINCT g.name) FILTER (WHERE g.name IS NOT NULL), '[]') as groups
      FROM contacts c
      LEFT JOIN contact_groups cg ON c.id = cg.contact_id
      LEFT JOIN groups g ON cg.group_id = g.id
      GROUP BY c.id
      ORDER BY c.id ASC
    `);
    
    const exportData = {
      exported_at: new Date().toISOString(),
      version: '3.1',
      contact_count: result.rows.length,
      contacts: result.rows
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="contacts-export-${Date.now()}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Error exporting contacts:', error);
    res.status(500).json({ error: 'Failed to export contacts' });
  }
});

// POST import contacts from JSON
app.post('/api/import/contacts', async (req, res) => {
  try {
    const { contacts, merge = false } = req.body;
    
    if (!Array.isArray(contacts)) {
      return res.status(400).json({ error: 'Contacts must be an array' });
    }
    
    const client = await pool.connect();
    let imported = 0;
    let skipped = 0;
    let errors = [];
    
    try {
      await client.query('BEGIN');
      
      for (const contact of contacts) {
        try {
          if (!contact.name || !contact.address) {
            skipped++;
            errors.push({ contact, reason: 'Missing name or address' });
            continue;
          }
          
          if (merge && contact.id) {
            // Try to update existing contact
            const updateResult = await client.query(
              'UPDATE contacts SET name = $1, address = $2 WHERE id = $3 RETURNING id',
              [contact.name, contact.address, contact.id]
            );
            
            if (updateResult.rows.length > 0) {
              imported++;
              continue;
            }
          }
          
          // Insert new contact
          await client.query(
            'INSERT INTO contacts (name, address) VALUES ($1, $2)',
            [contact.name, contact.address]
          );
          imported++;
        } catch (err) {
          skipped++;
          errors.push({ contact, reason: err.message });
        }
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: 'Import completed',
        imported,
        skipped,
        total: contacts.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importing contacts:', error);
    res.status(500).json({ error: 'Failed to import contacts' });
  }
});

// ============================================================================
// STATISTICS ENDPOINT
// ============================================================================

// GET statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM contacts) as total_contacts,
        (SELECT COUNT(*) FROM groups) as total_groups,
        (SELECT COUNT(*) FROM audit_log) as total_audit_entries,
        (SELECT COUNT(*) FROM contacts WHERE created_at >= NOW() - INTERVAL '7 days') as contacts_last_week,
        (SELECT COUNT(*) FROM contacts WHERE created_at >= NOW() - INTERVAL '30 days') as contacts_last_month
    `);
    
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('v3.2.2 Features: Full-text search, Groups, Audit trail, Advanced filtering, Backup/Restore, Enhanced UI/UX');
});

// Made with Bob - v3.2.2 Edition with Professional Dark Mode & Simplified Color Palette
