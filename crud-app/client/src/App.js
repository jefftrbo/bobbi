import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.NODE_ENV === 'production'
  ? '/api/contacts'
  : 'http://localhost:5001/api/contacts';

function App() {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ name: '', address: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all contacts
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setContacts(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch contacts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Update existing contact
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to update contact');
        
        setEditingId(null);
      } else {
        // Create new contact
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to create contact');
      }
      
      setFormData({ name: '', address: '' });
      setError('');
      fetchContacts();
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setFormData({ name: contact.name, address: contact.address });
    setEditingId(contact.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete contact');
      
      setError('');
      fetchContacts();
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', address: '' });
    setEditingId(null);
    setError('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📇 Contact Manager</h1>
        <p>Manage your contacts with ease</p>
      </header>

      <div className="container">
        {/* Form Section */}
        <div className="form-section">
          <h2>{editingId ? 'Edit Contact' : 'Add New Contact'}</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address:</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter address"
                disabled={loading}
              />
            </div>
            
            <div className="button-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing...' : editingId ? 'Update Contact' : 'Add Contact'}
              </button>
              
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Contacts List Section */}
        <div className="contacts-section">
          <h2>Contacts ({contacts.length})</h2>
          
          {loading && contacts.length === 0 ? (
            <div className="loading">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">No contacts found. Add your first contact above!</div>
          ) : (
            <div className="contacts-grid">
              {contacts.map((contact) => (
                <div key={contact.id} className="contact-card">
                  <div className="contact-info">
                    <h3>{contact.name}</h3>
                    <p>{contact.address}</p>
                  </div>
                  <div className="contact-actions">
                    <button 
                      className="btn btn-edit" 
                      onClick={() => handleEdit(contact)}
                      disabled={loading}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-delete" 
                      onClick={() => handleDelete(contact.id)}
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

// Made with Bob
