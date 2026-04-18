import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaDownload, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBox } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const OrderSlip = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('OrderSlip: Component mounted');
    console.log('OrderSlip: orderId from params:', orderId);
    console.log('OrderSlip: Current URL:', window.location.pathname);
    
    const loadOrderData = () => {
      try {
        console.log('OrderSlip: Loading order data...');
        const savedOrders = JSON.parse(localStorage.getItem('bookings') || '[]');
        console.log('OrderSlip: Found orders in localStorage:', savedOrders.length, savedOrders);
        const order = savedOrders.find(o => o.id === orderId);
        console.log('OrderSlip: Order found for ID', orderId, ':', order);
        
        if (order) {
          const enrichedOrder = {
            ...order,
            orderNumber: `ORD-${order.id.slice(-9).toUpperCase()}`,
            invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            customerName: user?.name || 'Customer',
            customerEmail: user?.email || 'customer@example.com',
            customerPhone: user?.phone || '+1 234-567-8900',
            billingAddress: user?.address || '123 Main St, City, State 12345',
            shippingAddress: user?.address || '123 Main St, City, State 12345',
            orderDate: new Date(order.date).toLocaleDateString(),
            orderTime: new Date(order.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            estimatedDelivery: new Date(new Date(order.date).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            paymentMethod: 'Credit Card',
            paymentStatus: 'Paid',
            subtotal: order.total || 0,
            // tax: Math.round((order.total || 0) * 0.18),
            shipping: order.total > 500 ? 0 : 50,
            grandTotal: (order.total || 0) + Math.round((order.total || 0) * 0.18) + (order.total > 500 ? 0 : 50)
          };
          console.log('OrderSlip: Enriched order data:', enrichedOrder);
          setOrderData(enrichedOrder);
          setError('');
        } else {
          console.log('OrderSlip: No order found for ID:', orderId);
          setError('Order not found. Please check your order ID and try again.');
          setOrderData(null);
        }
      } catch (err) {
        console.error('OrderSlip: Error loading order data:', err);
        setError('Error loading order data. Please try again.');
      }
      setLoading(false);
    };

    if (orderId) {
      loadOrderData();
    } else {
      console.log('OrderSlip: No orderId provided');
      setError('No order ID provided. Please access order slip from order details page.');
      setLoading(false);
    }
  }, [orderId, user]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('order-slip-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Slip - ${orderData?.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .total-section { text-align: right; margin-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Order Slip...</h2>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f4f6', 
          borderTop: '4px solid #3b82f6', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite',
          margin: '20px auto'
        }}></div>
        <p>Checking for order data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/account')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '20px',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <FaArrowLeft /> Back to Account
        </button>
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          color: '#dc2626', 
          padding: '20px', 
          borderRadius: '8px' 
        }}>
          {error}
        </div>
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => {
              const testOrder = {
                id: 'test-order-' + Date.now(),
                date: new Date().toISOString(),
                status: 'Processing',
                total: 1299,
                items: [{name: 'Test Product', price: 1299, quantity: 1}]
              };
              const orders = JSON.parse(localStorage.getItem('bookings') || '[]');
              orders.push(testOrder);
              localStorage.setItem('bookings', JSON.stringify(orders));
              window.location.reload();
            }}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Create Test Order
          </button>
          <Link 
            to="/account" 
            style={{ 
              display: 'inline-block', 
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px', 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        borderRadius: '10px' 
      }}>
        <button 
          onClick={() => navigate('/account')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 255, 255, 0.2)', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
        >
          <FaArrowLeft /> Back to Account
        </button>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Order Slip</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePrint} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(255, 255, 255, 0.2)', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
          >
            <FaPrint /> Print
          </button>
          <button 
            onClick={handleDownload} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(255, 255, 255, 0.2)', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '6px', 
              cursor: 'pointer' 
            }}
          >
            <FaDownload /> Download
          </button>
        </div>
      </div>

      <div id="order-slip-content" style={{ background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '30px', borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '2.5rem', borderBottom: '3px solid #3b82f6', paddingBottom: '10px' }}>
                INVOICE
              </h2>
              <div style={{ color: '#374151' }}>
                <h3 style={{ margin: '0 0 15px 0' }}>Your Company Name</h3>
                <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaMapMarkerAlt /> 123 Business Street, Commercial Area
                </p>
                <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaPhone /> +1 (555) 123-4567
                </p>
                <p style={{ margin: '5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaEnvelope /> info@yourcompany.com
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '8px 0', color: '#374151' }}><strong>Invoice Number:</strong> {orderData.invoiceNumber}</p>
              <p style={{ margin: '8px 0', color: '#374151' }}><strong>Order Number:</strong> {orderData.orderNumber}</p>
              <p style={{ margin: '8px 0', color: '#374151' }}><strong>Order Date:</strong> {orderData.orderDate}</p>
              <p style={{ margin: '8px 0', color: '#374151' }}><strong>Order Time:</strong> {orderData.orderTime}</p>
              <p style={{ margin: '8px 0', color: '#374151' }}>
                <strong>Payment Status:</strong> 
                <span style={{ color: '#10b981', fontWeight: '600', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>
                  {orderData.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div style={{ padding: '30px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#1f2937', borderBottom: '2px solid #3b82f6', paddingBottom: '5px' }}>
                Bill To
              </h3>
              <div style={{ color: '#374151' }}>
                <p style={{ margin: '8px 0' }}><strong>{orderData.customerName}</strong></p>
                <p style={{ margin: '8px 0' }}>{orderData.billingAddress}</p>
                <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaPhone /> {orderData.customerPhone}
                </p>
                <p style={{ margin: '8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaEnvelope /> {orderData.customerEmail}
                </p>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#1f2937', borderBottom: '2px solid #3b82f6', paddingBottom: '5px' }}>
                Ship To
              </h3>
              <div style={{ color: '#374151' }}>
                <p style={{ margin: '8px 0' }}><strong>{orderData.customerName}</strong></p>
                <p style={{ margin: '8px 0' }}>{orderData.shippingAddress}</p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Estimated Delivery:</strong> {orderData.estimatedDelivery}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ padding: '30px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Order Items</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '15px', border: '1px solid #e5e7eb', textAlign: 'left', color: '#1f2937', fontWeight: '600' }}>Item Description</th>
                <th style={{ padding: '15px', border: '1px solid #e5e7eb', textAlign: 'left', color: '#1f2937', fontWeight: '600' }}>Quantity</th>
                <th style={{ padding: '15px', border: '1px solid #e5e7eb', textAlign: 'left', color: '#1f2937', fontWeight: '600' }}>Unit Price</th>
                <th style={{ padding: '15px', border: '1px solid #e5e7eb', textAlign: 'left', color: '#1f2937', fontWeight: '600' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderData.items && orderData.items.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: '15px', border: '1px solid #e5e7eb', color: '#374151' }}>
                    <div>
                      <strong>{item.name}</strong>
                      {item.size && <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '12px' }}>Size: {item.size}</p>}
                      {item.color && <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '12px' }}>Color: {item.color}</p>}
                    </div>
                  </td>
                  <td style={{ padding: '15px', border: '1px solid #e5e7eb', color: '#374151' }}>{item.quantity}</td>
                  <td style={{ padding: '15px', border: '1px solid #e5e7eb', color: '#374151' }}>₹{Number(item.price || 0).toFixed(2)}</td>
                  <td style={{ padding: '15px', border: '1px solid #e5e7eb', color: '#374151' }}>₹{Number((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Summary */}
        <div style={{ padding: '30px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#1f2937' }}>Payment Information</h4>
              <p style={{ margin: '5px 0', color: '#374151' }}><strong>Payment Method:</strong> {orderData.paymentMethod}</p>
              <p style={{ margin: '5px 0', color: '#374151' }}>
                <strong>Payment Status:</strong> 
                <span style={{ color: '#10b981', fontWeight: '600', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px' }}>
                  {orderData.paymentStatus}
                </span>
              </p>
            </div>
            <div style={{ textAlign: 'right', minWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#374151' }}>
                <span>Subtotal:</span>
                <span>₹{Number(orderData.subtotal || 0).toFixed(2)}</span>
              </div>
              {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#374151' }}>
                <span>Tax (18% GST):</span>
                <span>₹{Number(orderData.tax || 0).toFixed(2)}</span>
              </div> */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#374151' }}>
                <span>Shipping:</span>
                <span>{orderData.shipping === 0 ? 'FREE' : `₹${Number(orderData.shipping || 0).toFixed(2)}`}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: '10px', 
                marginTop: '15px', 
                borderTop: '2px solid #1f2937', 
                fontSize: '18px', 
                color: '#1f2937',
                fontWeight: 'bold'
              }}>
                <span>Total Amount:</span>
                <span>₹{Number(orderData.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '30px', background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>Thank you for your order!</h4>
            <p style={{ margin: '5px 0', color: '#374151' }}>If you have any questions about your order, please contact our customer service.</p>
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
              <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}><strong>Email:</strong> support@yourcompany.com</p>
              <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}><strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
            <h5 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '14px' }}>Terms & Conditions</h5>
            <ul style={{ margin: '0', paddingLeft: '20px', color: '#6b7280', fontSize: '12px', lineHeight: '1.5' }}>
              <li>Goods once sold will not be taken back or exchanged</li>
              <li>Payment is due within 30 days of invoice date</li>
              <li>Interest will be charged on overdue accounts at 2% per month</li>
              <li>All disputes subject to [City] jurisdiction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSlip;
