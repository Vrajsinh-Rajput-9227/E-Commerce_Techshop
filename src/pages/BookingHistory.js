// src/pages/BookingHistory.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './BookingHistory.css';

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading bookings from localStorage
    const loadBookings = () => {
      try {
        const savedBookings = localStorage.getItem('bookings');
        if (savedBookings) {
          setBookings(JSON.parse(savedBookings));
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  if (loading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  return (
    <div className="booking-history">
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You don't have any bookings yet.</p>
          <Link to="/products" className="browse-products-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking, index) => (
            <div key={index} className="booking-card">
              <div className="booking-header">
                <h3>Order #{booking.id}</h3>
                <span className={`status ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-details">
                <div className="booking-date">
                  <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
                </div>
                <div className="booking-total">
                  <strong>Total:</strong> ${booking.total.toFixed(2)}
                </div>
              </div>
              <div className="booking-items">
                {booking.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="booking-item">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="item-image"
                    />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingHistory;