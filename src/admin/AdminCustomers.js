import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaArrowUp, FaArrowDown, FaCheckCircle, FaTimesCircle, FaClock, FaTimes } from 'react-icons/fa';
import './AdminCustomers.css';

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    registrationDate: new Date().toISOString()
  });

  // Load customers from localStorage and orders
  useEffect(() => {
    const loadCustomers = () => {
      try {
        // Get customers from orders
        const orders = JSON.parse(localStorage.getItem('bookings') || '[]');
        const customersFromOrders = orders.map(order => ({
          id: order.customerEmail?.replace(/[^a-zA-Z0-9]/g, '') || Math.random().toString(36).substr(2, 9),
          name: order.customerName || 'Unknown Customer',
          email: order.customerEmail || 'unknown@example.com',
          phone: order.customerPhone || '+1 234-567-8900',
          address: order.shippingAddress || '123 Main St, City, State 12345',
          status: 'active',
          registrationDate: order.date || new Date().toISOString(),
          totalOrders: 1,
          totalSpent: parseFloat(order.total) || 0,
          lastOrderDate: order.date
        }));

        // Get existing customers from localStorage
        const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        
        // Merge and deduplicate customers
        const allCustomers = [...customersFromOrders, ...existingCustomers];
        const uniqueCustomers = allCustomers.reduce((acc, customer) => {
          const existingIndex = acc.findIndex(c => c.email === customer.email);
          if (existingIndex >= 0) {
            // Update existing customer with new order info
            acc[existingIndex].totalOrders = (acc[existingIndex].totalOrders || 1) + (customer.totalOrders || 0);
            acc[existingIndex].totalSpent = (acc[existingIndex].totalSpent || 0) + (customer.totalSpent || 0);
            if (new Date(customer.lastOrderDate) > new Date(acc[existingIndex].lastOrderDate)) {
              acc[existingIndex].lastOrderDate = customer.lastOrderDate;
            }
          } else {
            acc.push(customer);
          }
          return acc;
        }, []);

        setCustomers(uniqueCustomers);
        setFilteredCustomers(uniqueCustomers);
        setLoading(false);
      } catch (error) {
        console.error('Error loading customers:', error);
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...customers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'registrationDate' || sortBy === 'lastOrderDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter, sortBy, sortOrder]);

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <FaCheckCircle className="status-icon active" />;
      case 'inactive':
        return <FaTimesCircle className="status-icon inactive" />;
      case 'pending':
        return <FaClock className="status-icon pending" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10b981';
      case 'inactive':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // View customer details
  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  // Edit customer
  const editCustomer = (customer) => {
    setEditingCustomer({ ...customer });
    setShowEditModal(true);
  };

  // Update customer
  const updateCustomer = () => {
    if (!editingCustomer) return;

    try {
      const updatedCustomers = customers.map(customer => {
        if (customer.id === editingCustomer.id) {
          return editingCustomer;
        }
        return customer;
      });

      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      
      setShowEditModal(false);
      setEditingCustomer(null);
      
      setNotification({
        message: `Customer ${editingCustomer.name} updated successfully`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      setNotification({
        message: 'Failed to update customer',
        type: 'error'
      });
    }
  };

  // Delete customer
  const deleteCustomer = (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      const updatedCustomers = customers.filter(customer => customer.id !== customerId);
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      
      setNotification({
        message: 'Customer deleted successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      setNotification({
        message: 'Failed to delete customer',
        type: 'error'
      });
    }
  };

  // Add new customer
  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      setNotification({
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    try {
      const customerToAdd = {
        ...newCustomer,
        id: newCustomer.email.replace(/[^a-zA-Z0-9]/g, ''),
        totalOrders: 0,
        totalSpent: 0
      };

      const updatedCustomers = [...customers, customerToAdd];
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      
      setShowAddModal(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        status: 'active',
        registrationDate: new Date().toISOString()
      });
      
      setNotification({
        message: `Customer ${customerToAdd.name} added successfully`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      setNotification({
        message: 'Failed to add customer',
        type: 'error'
      });
    }
  };

  // Get customer statistics
  const getCustomerStats = () => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'active').length;
    const inactive = customers.filter(c => c.status === 'inactive').length;
    const pending = customers.filter(c => c.status === 'pending').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const avgOrderValue = total > 0 ? totalRevenue / customers.filter(c => c.totalOrders > 0).reduce((sum, c) => sum + c.totalOrders, 0) : 0;

    return { total, active, inactive, pending, totalRevenue, avgOrderValue };
  };

  const stats = getCustomerStats();

  if (loading) {
    return (
      <div className="admin-customers">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-customers">
      <div className="customers-header">
        <h1>Customer Management</h1>
        <p>Manage and view all customer accounts</p>
        <button className="add-customer-btn" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Add New Customer
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-icon">
            <FaTimesCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.inactive}</h3>
            <p>Inactive</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="stat-card avg-order">
          <div className="stat-icon">
            <FaCalendarAlt />
          </div>
          <div className="stat-content">
            <h3>₹{stats.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Avg Order Value</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="customers-controls">
        <div className="search-section">
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by name, email, phone, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filters-section">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Name {sortBy === 'name' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {sortBy === 'email' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th>Phone</th>
              <th>Address</th>
              <th onClick={() => handleSort('totalOrders')} className="sortable">
                Orders {sortBy === 'totalOrders' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th onClick={() => handleSort('totalSpent')} className="sortable">
                Total Spent {sortBy === 'totalSpent' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th onClick={() => handleSort('registrationDate')} className="sortable">
                Registration {sortBy === 'registrationDate' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="customer-row" onClick={() => viewCustomerDetails(customer)} style={{ cursor: 'pointer' }}>
                  <td className="customer-name">{customer.name}</td>
                  <td className="customer-email">{customer.email}</td>
                  <td className="customer-phone">{customer.phone}</td>
                  <td className="customer-address">{customer.address}</td>
                  <td className="customer-orders">{customer.totalOrders || 0}</td>
                  <td className="customer-spent">₹{(customer.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="customer-registration">{formatDate(customer.registrationDate)}</td>
                  <td className="customer-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(customer.status) }}
                    >
                      {getStatusIcon(customer.status)}
                      {customer.status}
                    </span>
                  </td>
                  <td className="customer-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="action-btn view"
                      onClick={() => viewCustomerDetails(customer)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => editCustomer(customer)}
                      title="Edit Customer"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteCustomer(customer.id)}
                      title="Delete Customer"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-customers">
                  <div className="empty-state">
                    <FaUser className="empty-icon" />
                    <h3>No customers found</h3>
                    <p>No customers match your current filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {showCustomerDetails && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content customer-details-modal">
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button
                className="close-btn"
                onClick={() => setShowCustomerDetails(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="customer-details-grid">
                <div className="detail-section">
                  <h3><FaUser /> Personal Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedCustomer.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedCustomer.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedCustomer.phone}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedCustomer.status) }}
                      >
                        {getStatusIcon(selectedCustomer.status)}
                        {selectedCustomer.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3><FaMapMarkerAlt /> Address</h3>
                  <p>{selectedCustomer.address}</p>
                </div>

                <div className="detail-section">
                  <h3><FaCalendarAlt /> Account Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Registration Date:</span>
                      <span className="value">{formatDate(selectedCustomer.registrationDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total Orders:</span>
                      <span className="value">{selectedCustomer.totalOrders || 0}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Total Spent:</span>
                      <span className="value">₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Last Order:</span>
                      <span className="value">{selectedCustomer.lastOrderDate ? formatDate(selectedCustomer.lastOrderDate) : 'No orders yet'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="modal-overlay">
          <div className="modal-content edit-customer-modal">
            <div className="modal-header">
              <h3>Edit Customer</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={editingCustomer.address}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    value={editingCustomer.status}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={updateCustomer}
              >
                Update Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content add-customer-modal">
            <div className="modal-header">
              <h3>Add New Customer</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setNewCustomer({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    status: 'active',
                    registrationDate: new Date().toISOString()
                  });
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setNewCustomer({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    status: 'active',
                    registrationDate: new Date().toISOString()
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={addCustomer}
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
