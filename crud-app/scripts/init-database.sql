-- ============================================================================
-- CRUD Contact Manager - Database Initialization Script
-- Version: v3.2.2
-- Description: Complete database schema with all tables, indexes, and triggers
-- ============================================================================

-- Create contacts table with full-text search support
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    search_vector tsvector
);

-- Create groups table for organizing contacts
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for many-to-many relationship between contacts and groups
CREATE TABLE IF NOT EXISTS contact_groups (
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, group_id)
);

-- Create audit log table for tracking all changes
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50),
    record_id INTEGER,
    action VARCHAR(10),
    old_data JSONB,
    new_data JSONB,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for faster name-based searches on contacts
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);

-- GIN index for full-text search on contacts
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts USING GIN(search_vector);

-- Index for audit log queries by table and record
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically update the search_vector for full-text search
CREATE OR REPLACE FUNCTION contacts_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.address, ''));
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at on contacts table
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at 
    BEFORE UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on groups table
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update search_vector on contacts table
DROP TRIGGER IF EXISTS contacts_search_vector_trigger ON contacts;
CREATE TRIGGER contacts_search_vector_trigger 
    BEFORE INSERT OR UPDATE ON contacts 
    FOR EACH ROW 
    EXECUTE FUNCTION contacts_search_vector_update();

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Display all tables
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Display all indexes
SELECT 'Indexes created:' as status;
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

-- Display all triggers
SELECT 'Triggers created:' as status;
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY event_object_table, trigger_name;

SELECT 'Database initialization complete!' as status;

-- Made with Bob
