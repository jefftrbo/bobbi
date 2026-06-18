import React, { useState, useEffect } from 'react';
import './App.css';

// API URL configuration for development and production environments
const API_URL = process.env.NODE_ENV === 'production'
  ? '/api/contacts'
  : 'http://localhost:5001/api/contacts';

function App() {
  // State management
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state - controls visibility and content of the modal window
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContact, setModalContact] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'delete', or 'add'

  // Fetch all contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  /**
   * Fetches all contacts from the API
   * Updates the contacts state with the retrieved data
   */
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

  /**
   * Handles input changes in the modal form
   * @param {Event} e - The input change event
   */
  const handleModalInputChange = (e) => {
    setModalContact({
      ...modalContact,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Opens the modal window with contact details
   * @param {Object} contact - The contact to display in the modal (null for new contact)
   */
  const openModal = (contact) => {
    if (contact) {
      setModalContact({ ...contact });
      setModalMode('view');
    } else {
      // Open modal in add mode with empty contact
      setModalContact({ name: '', address: '' });
      setModalMode('add');
    }
    setModalOpen(true);
  };

  /**
   * Closes the modal window and resets modal state
   */
  const closeModal = () => {
    setModalOpen(false);
    setModalContact(null);
    setModalMode('view');
    setError('');
  };

  /**
   * Switches modal to edit mode
   */
  const switchToEditMode = () => {
    setModalMode('edit');
  };

  /**
   * Switches modal to delete confirmation mode
   */
  const switchToDeleteMode = () => {
    setModalMode('delete');
  };

  /**
   * Handles saving a contact from the modal (add or update)
   */
  const handleModalSave = async () => {
    if (!modalContact.name || !modalContact.address) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      
      if (modalMode === 'add') {
        // Create new contact
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modalContact.name, address: modalContact.address })
        });
        
        if (!response.ok) throw new Error('Failed to create contact');
      } else {
        // Update existing contact
        const response = await fetch(`${API_URL}/${modalContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modalContact.name, address: modalContact.address })
        });
        
        if (!response.ok) throw new Error('Failed to update contact');
      }
      
      setError('');
      fetchContacts();
      closeModal();
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles deleting a contact from the modal
   */
  const handleModalDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${modalContact.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete contact');
      
      setError('');
      fetchContacts();
      closeModal();
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Header Section */}
      <header className="App-header">
        <h1>📇 Contact Manager</h1>
        <p>Manage your contacts with ease</p>
      </header>

      <div className="container">
        {/* Contacts List Section with Scrolling */}
        <div className="contacts-section">
          <div className="contacts-header">
            <h2>Contacts ({contacts.length})</h2>
            <button
              className="btn btn-add-contact"
              onClick={() => openModal(null)}
              disabled={loading}
            >
              ➕ Add New Contact
            </button>
          </div>
          
          {loading && contacts.length === 0 ? (
            <div className="loading">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">No contacts found. Add your first contact above!</div>
          ) : (
            <div className="contacts-list-container">
              <ul className="contacts-list">
                {contacts.map((contact) => (
                  <li key={contact.id} className="contact-list-item">
                    {/* Clickable contact name that opens modal */}
                    <button 
                      className="contact-name-link"
                      onClick={() => openModal(contact)}
                      title="Click to view details"
                    >
                      {contact.name}
                    </button>
                    <span className="contact-address-preview">{contact.address}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal Window for View/Edit/Delete */}
      {modalOpen && modalContact && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'view' && '👤 Contact Details'}
                {modalMode === 'edit' && '✏️ Edit Contact'}
                {modalMode === 'delete' && '⚠️ Delete Contact'}
                {modalMode === 'add' && '➕ Add New Contact'}
              </h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close modal">
                ✕
              </button>
            </div>

            <div className="modal-body">
              {error && <div className="error-message">{error}</div>}

              {/* View Mode */}
              {modalMode === 'view' && (
                <div className="contact-details">
                  <div className="detail-row">
                    <strong>Name:</strong>
                    <span>{modalContact.name}</span>
                  </div>
                  <div className="detail-row">
                    <strong>Address:</strong>
                    <span>{modalContact.address}</span>
                  </div>
                </div>
              )}

              {/* Add Mode */}
              {modalMode === 'add' && (
                <div className="modal-form">
                  <div className="form-group">
                    <label htmlFor="modal-name">Name:</label>
                    <input
                      type="text"
                      id="modal-name"
                      name="name"
                      value={modalContact.name}
                      onChange={handleModalInputChange}
                      placeholder="Enter contact name"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="modal-address">Address:</label>
                    <input
                      type="text"
                      id="modal-address"
                      name="address"
                      value={modalContact.address}
                      onChange={handleModalInputChange}
                      placeholder="Enter contact address"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Edit Mode */}
              {modalMode === 'edit' && (
                <div className="modal-form">
                  <div className="form-group">
                    <label htmlFor="modal-name">Name:</label>
                    <input
                      type="text"
                      id="modal-name"
                      name="name"
                      value={modalContact.name}
                      onChange={handleModalInputChange}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="modal-address">Address:</label>
                    <input
                      type="text"
                      id="modal-address"
                      name="address"
                      value={modalContact.address}
                      onChange={handleModalInputChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Delete Confirmation Mode */}
              {modalMode === 'delete' && (
                <div className="delete-confirmation">
                  <p>Are you sure you want to delete this contact?</p>
                  <div className="contact-details">
                    <div className="detail-row">
                      <strong>Name:</strong>
                      <span>{modalContact.name}</span>
                    </div>
                    <div className="detail-row">
                      <strong>Address:</strong>
                      <span>{modalContact.address}</span>
                    </div>
                  </div>
                  <p className="warning-text">This action cannot be undone.</p>
                </div>
              )}
            </div>

            {/* Modal Footer with Action Buttons */}
            <div className="modal-footer">
              {modalMode === 'view' && (
                <>
                  <button 
                    className="btn btn-edit" 
                    onClick={switchToEditMode}
                    disabled={loading}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="btn btn-delete" 
                    onClick={switchToDeleteMode}
                    disabled={loading}
                  >
                    🗑️ Delete
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Close
                  </button>
                </>
              )}

              {modalMode === 'add' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={handleModalSave}
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Contact'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </>
              )}

              {modalMode === 'edit' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={handleModalSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setModalMode('view')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </>
              )}

              {modalMode === 'delete' && (
                <>
                  <button 
                    className="btn btn-delete" 
                    onClick={handleModalDelete}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setModalMode('view')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// Made with Bob - Enhanced with modal windows and responsive design
