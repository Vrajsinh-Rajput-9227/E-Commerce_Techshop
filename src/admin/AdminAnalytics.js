import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaShoppingCart, FaUsers, FaBox, FaDollarSign, FaChartLine, FaChartPie, FaCalendarAlt, FaDownload } from 'react-icons/fa';
import './AdminAnalytics.css';

function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 45678,
      totalOrders: 234,
      totalCustomers: 1234,
      conversionRate: 3.2
    },
    salesData: [
      { date: 'Mon', sales: 4000, orders: 24 },
      { date: 'Tue', sales: 3000, orders: 18 },
      { date: 'Wed', sales: 5000, orders: 32 },
      { date: 'Thu', sales: 2780, orders: 15 },
      { date: 'Fri', sales: 6890, orders: 42 },
      { date: 'Sat', sales: 7390, orders: 48 },
      { date: 'Sun', sales: 5490, orders: 35 }
    ],
    categoryData: [
      { name: 'Electronics', value: 35, color: '#8884d8' },
      { name: 'Clothing', value: 25, color: '#82ca9d' },
      { name: 'Home & Garden', value: 20, color: '#ffc658' },
      { name: 'Sports', value: 12, color: '#ff7c7c' },
      { name: 'Books', value: 8, color: '#8dd1e1' }
    ],
    topProducts: [
      { name: 'Laptop Pro', sales: 145, revenue: 145000 },
      { name: 'Wireless Headphones', sales: 89, revenue: 17800 },
      { name: 'Smart Watch', sales: 67, revenue: 20100 },
      { name: 'Running Shoes', sales: 54, revenue: 8100 },
      { name: 'Coffee Maker', sales: 43, revenue: 6450 }
    ],
    customerMetrics: [
      { month: 'Jan', newCustomers: 120, returningCustomers: 340 },
      { month: 'Feb', newCustomers: 145, returningCustomers: 380 },
      { month: 'Mar', newCustomers: 167, returningCustomers: 420 },
      { month: 'Apr', newCustomers: 189, returningCustomers: 460 },
      { month: 'May', newCustomers: 210, returningCustomers: 510 },
      { month: 'Jun', newCustomers: 234, returningCustomers: 580 }
    ]
  });

  const handleExportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      ...analyticsData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="analytics-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button onClick={handleExportReport} className="export-btn">
            <FaDownload /> Export Report
          </button>
        </div>
      </div>

      <div className="overview-cards">
        <div className="overview-card">
          <div className="card-icon revenue">
            <FaDollarSign />
          </div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="card-value">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
            <span className="card-change positive">+12.5%</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon orders">
            <FaShoppingCart />
          </div>
          <div className="card-content">
            <h3>Total Orders</h3>
            <p className="card-value">{analyticsData.overview.totalOrders}</p>
            <span className="card-change positive">+8.2%</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon customers">
            <FaUsers />
          </div>
          <div className="card-content">
            <h3>Total Customers</h3>
            <p className="card-value">{analyticsData.overview.totalCustomers}</p>
            <span className="card-change positive">+15.3%</span>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon conversion">
            <FaChartLine />
          </div>
          <div className="card-content">
            <h3>Conversion Rate</h3>
            <p className="card-value">{analyticsData.overview.conversionRate}%</p>
            <span className="card-change negative">-2.1%</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="right" dataKey="orders" fill="#82ca9d" name="Orders" />
              <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#8884d8" name="Sales ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tables-grid">
        <div className="table-container">
          <h3>Top Products</h3>
          <div className="table-wrapper">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.sales}</td>
                    <td>{formatCurrency(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-container">
          <h3>Customer Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.customerMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="newCustomers" fill="#8884d8" name="New Customers" />
              <Bar dataKey="returningCustomers" fill="#82ca9d" name="Returning Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="additional-metrics">
        <div className="metric-card">
          <h3>Average Order Value</h3>
          <p className="metric-value">{formatCurrency(195)}</p>
          <span className="metric-change positive">+5.2%</span>
        </div>
        <div className="metric-card">
          <h3>Customer Lifetime Value</h3>
          <p className="metric-value">{formatCurrency(1250)}</p>
          <span className="metric-change positive">+8.7%</span>
        </div>
        <div className="metric-card">
          <h3>Cart Abandonment Rate</h3>
          <p className="metric-value">68.2%</p>
          <span className="metric-change negative">+3.1%</span>
        </div>
        <div className="metric-card">
          <h3>Page Views</h3>
          <p className="metric-value">45.2K</p>
          <span className="metric-change positive">+12.8%</span>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
