import React, { useState, useEffect } from 'react';
import './App.css';

// API URL configuration for development and production environments
const API_BASE = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:5000/api';

function App() {
  // State management
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  
  // Modal state - controls visibility and content of the modal window
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContact, setModalContact] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'delete', or 'add'
  const [selectedGroups, setSelectedGroups] = useState([]);
  
  // Groups management modal
  const [groupsModalOpen, setGroupsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // Fetch all contacts and groups on component mount
  useEffect(() => {
    fetchContacts();
    fetchGroups();
  }, []);

  // Fetch contacts when filters change
  useEffect(() => {
    fetchContacts();
  }, [searchTerm, selectedGroupFilter, sortBy, sortOrder]);

  /**
   * Fetches all contacts from the API with filters
   */
  const fetchContacts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedGroupFilter) params.append('group_id', selectedGroupFilter);
      if (sortBy) params.append('sort', sortBy);
      if (sortOrder) params.append('order', sortOrder);
      
      const url = `${API_BASE}/contacts${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
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
   * Fetches all groups from the API
   */
  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE}/groups`);
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  /**
   * Handles input changes in the modal form
   */
  const handleModalInputChange = (e) => {
    setModalContact({
      ...modalContact,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handles group selection changes
   */
  const handleGroupToggle = (groupId) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  /**
   * Opens the modal window with contact details
   */
  const openModal = (contact) => {
    if (contact) {
      setModalContact({ ...contact });
      setModalMode('view');
      // Set selected groups from contact
      setSelectedGroups(contact.groups ? contact.groups.map(g => g.id) : []);
    } else {
      // Open modal in add mode with empty contact
      setModalContact({ name: '', address: '' });
      setModalMode('add');
      setSelectedGroups([]);
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
    setSelectedGroups([]);
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
      
      const payload = {
        name: modalContact.name,
        address: modalContact.address,
        group_ids: selectedGroups
      };
      
      if (modalMode === 'add') {
        // Create new contact
        const response = await fetch(`${API_BASE}/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error('Failed to create contact');
      } else {
        // Update existing contact
        const response = await fetch(`${API_BASE}/contacts/${modalContact.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
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
      const response = await fetch(`${API_BASE}/contacts/${modalContact.id}`, {
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

  /**
   * Opens groups management modal
   */
  const openGroupsModal = () => {
    setGroupsModalOpen(true);
    setEditingGroup(null);
  };

  /**
   * Closes groups management modal
   */
  const closeGroupsModal = () => {
    setGroupsModalOpen(false);
    setEditingGroup(null);
  };

  /**
   * Handles creating or updating a group
   */
  const handleSaveGroup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const description = formData.get('description');

    try {
      if (editingGroup) {
        // Update existing group
        const response = await fetch(`${API_BASE}/groups/${editingGroup.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        });
        if (!response.ok) throw new Error('Failed to update group');
      } else {
        // Create new group
        const response = await fetch(`${API_BASE}/groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description })
        });
        if (!response.ok) throw new Error('Failed to create group');
      }
      
      fetchGroups();
      setEditingGroup(null);
      e.target.reset();
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * Handles deleting a group
   */
  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? Contacts will not be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/groups/${groupId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete group');
      
      fetchGroups();
      fetchContacts();
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * Clears all filters
   */
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGroupFilter('');
    setSortBy('name');
    setSortOrder('ASC');
  };

  return (
    <div className="App">
      {/* Header Section */}
      <header className="App-header">
        <h1>📇 Contact Manager v3.1</h1>
        <p>Search, organize, and manage your contacts</p>
      </header>

      <div className="container">
        {/* Search and Filter Bar */}
        <div className="filter-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Groups</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.contact_count})
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Sort by Name</option>
              <option value="created_at">Sort by Date Added</option>
              <option value="updated_at">Sort by Last Updated</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="filter-select"
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>

            {(searchTerm || selectedGroupFilter || sortBy !== 'name' || sortOrder !== 'ASC') && (
              <button onClick={clearFilters} className="btn-clear-filters">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-bar">
          <button
            className="btn btn-add-contact"
            onClick={() => openModal(null)}
            disabled={loading}
          >
            ➕ Add Contact
          </button>
          <button
            className="btn btn-manage-groups"
            onClick={openGroupsModal}
          >
            📁 Manage Groups
          </button>
        </div>

        {/* Contacts List Section */}
        <div className="contacts-section">
          <div className="contacts-header">
            <h2>
              Contacts ({contacts.length})
              {searchTerm && ` - Search: "${searchTerm}"`}
              {selectedGroupFilter && ` - Group: ${groups.find(g => g.id === parseInt(selectedGroupFilter))?.name}`}
            </h2>
          </div>
          
          {loading && contacts.length === 0 ? (
            <div className="loading">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              {searchTerm || selectedGroupFilter 
                ? 'No contacts found matching your filters.' 
                : 'No contacts found. Add your first contact above!'}
            </div>
          ) : (
            <div className="contacts-list-container">
              <ul className="contacts-list">
                {contacts.map((contact) => (
                  <li key={contact.id} className="contact-list-item">
                    <button 
                      className="contact-name-link"
                      onClick={() => openModal(contact)}
                      title="Click to view details"
                    >
                      {contact.name}
                    </button>
                    <span className="contact-address-preview">{contact.address}</span>
                    {contact.groups && contact.groups.length > 0 && (
                      <div className="contact-groups-preview">
                        {contact.groups.map(group => (
                          <span key={group.id} className="group-badge">
                            {group.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal Window */}
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
                  {modalContact.groups && modalContact.groups.length > 0 && (
                    <div className="detail-row">
                      <strong>Groups:</strong>
                      <div className="groups-display">
                        {modalContact.groups.map(group => (
                          <span key={group.id} className="group-badge">
                            {group.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {modalContact.created_at && (
                    <div className="detail-row">
                      <strong>Created:</strong>
                      <span>{new Date(modalContact.created_at).toLocaleString()}</span>
                    </div>
                  )}
                  {modalContact.updated_at && (
                    <div className="detail-row">
                      <strong>Updated:</strong>
                      <span>{new Date(modalContact.updated_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Add/Edit Mode */}
              {(modalMode === 'add' || modalMode === 'edit') && (
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
                      autoFocus={modalMode === 'add'}
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
                  <div className="form-group">
                    <label>Groups:</label>
                    <div className="groups-selector">
                      {groups.map(group => (
                        <label key={group.id} className="group-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.id)}
                            onChange={() => handleGroupToggle(group.id)}
                            disabled={loading}
                          />
                          <span>{group.name}</span>
                        </label>
                      ))}
                    </div>
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

      {/* Groups Management Modal */}
      {groupsModalOpen && (
        <div className="modal-overlay" onClick={closeGroupsModal}>
          <div className="modal-content modal-groups" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📁 Manage Groups</h2>
              <button className="modal-close" onClick={closeGroupsModal}>✕</button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSaveGroup} className="group-form">
                <h3>{editingGroup ? 'Edit Group' : 'Add New Group'}</h3>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Group name"
                    defaultValue={editingGroup?.name || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="description"
                    placeholder="Description (optional)"
                    defaultValue={editingGroup?.description || ''}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingGroup ? 'Update' : 'Create'} Group
                  </button>
                  {editingGroup && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setEditingGroup(null)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="groups-list">
                <h3>Existing Groups</h3>
                {groups.length === 0 ? (
                  <p>No groups yet. Create one above!</p>
                ) : (
                  <ul>
                    {groups.map(group => (
                      <li key={group.id} className="group-item">
                        <div className="group-info">
                          <strong>{group.name}</strong>
                          <span className="group-description">{group.description}</span>
                          <span className="group-count">{group.contact_count} contacts</span>
                        </div>
                        <div className="group-actions">
                          <button
                            className="btn-icon"
                            onClick={() => setEditingGroup(group)}
                            title="Edit group"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDeleteGroup(group.id)}
                            title="Delete group"
                          >
                            🗑️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeGroupsModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

// Made with Bob - v3.1 Edition with Search, Groups, and Filtering
