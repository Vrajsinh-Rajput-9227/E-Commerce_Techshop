import React, { useState, useEffect } from 'react';
import { FaBox, FaTruck, FaCheckCircle, FaClock, FaTimes, FaSearch, FaFilter, FaEye, FaEdit, FaDownload, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaRupeeSign, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './AdminOrders.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notification, setNotification] = useState(null);

  // Load orders from localStorage
  useEffect(() => {
    const loadOrders = () => {
      try {
        const savedOrders = JSON.parse(localStorage.getItem('bookings') || '[]');
        // Add additional admin-specific fields
        const enrichedOrders = savedOrders.map(order => ({
          ...order,
          customerName: order.customerName || 'Customer',
          customerEmail: order.customerEmail || 'customer@example.com',
          customerPhone: order.customerPhone || '+1 234-567-8900',
          shippingAddress: order.shippingAddress || '123 Main St, City, State 12345',
          paymentMethod: order.paymentMethod || 'Credit Card',
          paymentStatus: order.paymentStatus || 'Paid'
        }));
        setOrders(enrichedOrders);
        setFilteredOrders(enrichedOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error loading orders:', error);
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => new Date(order.date) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => new Date(order.date) >= monthAgo);
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'date') {
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

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter, sortBy, sortOrder]);

  // Get order status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <FaCheckCircle className="status-icon delivered" />;
      case 'shipped':
        return <FaTruck className="status-icon shipped" />;
      case 'processing':
        return <FaClock className="status-icon processing" />;
      case 'cancelled':
        return <FaTimes className="status-icon cancelled" />;
      default:
        return <FaBox className="status-icon pending" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return '#10b981';
      case 'shipped':
        return '#3b82f6';
      case 'processing':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Update order status
  const updateOrderStatus = () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const updatedOrders = orders.map(order => {
        if (order.id === selectedOrder.id) {
          return {
            ...order,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      });

      setOrders(updatedOrders);
      localStorage.setItem('bookings', JSON.stringify(updatedOrders));
      
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      setShowStatusModal(false);
      setNewStatus('');
      
      setNotification({
        message: `Order #${selectedOrder.id} status updated to ${newStatus}`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({
        message: 'Failed to update order status',
        type: 'error'
      });
    }
  };

  // Get order statistics
  const getOrderStats = () => {
    const total = orders.length;
    const processing = orders.filter(o => o.status === 'Processing').length;
    const shipped = orders.filter(o => o.status === 'Shipped').length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const cancelled = orders.filter(o => o.status === 'Cancelled').length;
    // Only count revenue from non-cancelled orders
    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => {
        const orderTotal = parseFloat(o.total) || 0;
        return sum + orderTotal;
      }, 0);

    return { total, processing, shipped, delivered, cancelled, totalRevenue };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="admin-orders">
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h1>Order Management</h1>
        <p>Manage and track all customer orders</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaBox />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card processing">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.processing}</h3>
            <p>Processing</p>
          </div>
        </div>
        <div className="stat-card shipped">
          <div className="stat-icon">
            <FaTruck />
          </div>
          <div className="stat-content">
            <h3>{stats.shipped}</h3>
            <p>Shipped</p>
          </div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats.delivered}</h3>
            <p>Delivered</p>
          </div>
        </div>
        <div className="stat-card cancelled">
          <div className="stat-icon">
            <FaTimes />
          </div>
          <div className="stat-content">
            <h3>{stats.cancelled}</h3>
            <p>Cancelled</p>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">
            <FaRupeeSign />
          </div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="orders-controls">
        <div className="search-section">
          <div className="search-input">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by order ID, customer name, email..."
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
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} className="sortable">
                Order ID {sortBy === 'id' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th onClick={() => handleSort('date')} className="sortable">
                Date {sortBy === 'date' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th>Customer</th>
              <th>Items</th>
              <th onClick={() => handleSort('total')} className="sortable">
                Total {sortBy === 'total' && (sortOrder === 'asc' ? <FaArrowUp style={{ marginLeft: '8px' }} /> : <FaArrowDown style={{ marginLeft: '8px' }} />)}
              </th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="order-row">
                  <td className="order-id">#{order.id}</td>
                  <td className="order-date">{formatDate(order.date)}</td>
                  <td className="customer-info">
                    <div className="customer-name">{order.customerName}</div>
                    <div className="customer-email">{order.customerEmail}</div>
                  </td>
                  <td className="items-count">{order.items?.length || 0} items</td>
                  <td className="order-total">₹{parseFloat(order.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="o-order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="payment-status">
                    <span className={`payment-badge ${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="order-actions">
                    <button
                      className="action-btn view"
                      onClick={() => viewOrderDetails(order)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowStatusModal(true);
                      }}
                      title="Update Status"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn download"
                      onClick={() => window.open(`/order-slip/${order.id}`, '_blank')}
                      title="Download Invoice"
                    >
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-orders">
                  <div className="empty-state">
                    <FaBox className="empty-icon" />
                    <h3>No orders found</h3>
                    <p>No orders match your current filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content order-details-modal">
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.id}</h2>
              <button
                className="close-btn"
                onClick={() => setShowOrderDetails(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="order-details-grid">
                <div className="detail-section">
                  <h3><FaUser /> Customer Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedOrder.customerName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedOrder.customerPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3><FaMapMarkerAlt /> Shipping Address</h3>
                  <p>{selectedOrder.shippingAddress}</p>
                </div>

                <div className="detail-section">
                  <h3><FaCalendarAlt /> Order Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Order Date:</span>
                      <span className="value">{formatDate(selectedOrder.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                      >
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Payment Method:</span>
                      <span className="value">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Payment Status:</span>
                      <span className={`payment-badge ${selectedOrder.paymentStatus?.toLowerCase()}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Order Items</h3>
                  <div className="order-items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <img
                          src={item.image}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                          }}
                        />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p>Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <div className="item-total">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>₹{parseFloat(selectedOrder.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>Free</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>₹{parseFloat(selectedOrder.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content status-modal">
            <div className="modal-header">
              <h3>Update Order Status</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus('');
                }}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <p>Order: <strong>#{selectedOrder.id}</strong></p>
              <p>Current Status: <strong>{selectedOrder.status}</strong></p>
              
              <div className="status-options">
                <label>
                  <input
                    type="radio"
                    value="Processing"
                    checked={newStatus === 'Processing'}
                    onChange={(e) => setNewStatus(e.target.value)}
                  />
                  <span className="status-option processing">
                    <FaClock /> Processing
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="Shipped"
                    checked={newStatus === 'Shipped'}
                    onChange={(e) => setNewStatus(e.target.value)}
                  />
                  <span className="status-option shipped">
                    <FaTruck /> Shipped
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="Delivered"
                    checked={newStatus === 'Delivered'}
                    onChange={(e) => setNewStatus(e.target.value)}
                  />
                  <span className="status-option delivered">
                    <FaCheckCircle /> Delivered
                  </span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="Cancelled"
                    checked={newStatus === 'Cancelled'}
                    onChange={(e) => setNewStatus(e.target.value)}
                  />
                  <span className="status-option cancelled">
                    <FaTimes /> Cancelled
                  </span>
                </label>
              </div>
            </div>
            
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={updateOrderStatus}
                disabled={!newStatus}
              >
                Update Status
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

export default AdminOrders;
