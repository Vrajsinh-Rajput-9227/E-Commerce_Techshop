import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// import ProductList from './component/ProductList';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Footer from './component/Footer';
import Header from './component/Header';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import CategoryPage from './pages/CategoryPage';
import FAQ from './pages/FAQ';
import Shipping from './pages/Shipping';
import Returns from './pages/Returns';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import SearchResults from './pages/SearchResults';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ChatWidget from './component/ChatWidget';
import TrackOrder from './pages/TrackOrder';
import Account from './pages/Account';
import Information from './pages/Information';
import OrderDetail from './pages/OrderDetail';
import OrderSlip from './pages/OrderSlip';
// import BookingHistory from './pages/BookingHistory';
import UserOrderHistory from './pages/UserOrderHistory';
// Admin imports
import { AdminLayout, AdminDashboard, AdminLogin, AdminProducts, AdminOrders, AdminPayments, AdminCustomers, AdminInventory, AdminMessages, AdminNotifications, AdminSettings, AdminAnalytics } from './admin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Admin Routes - Show AdminHeader only */}
            <Route path="/admin" element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            } />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/products" element={
              <AdminLayout>
                <AdminProducts />
              </AdminLayout>
            } />
            <Route path="/admin/orders" element={
              <AdminLayout>
                <AdminOrders />
              </AdminLayout>
            } />
            <Route path="/admin/users" element={
              <AdminLayout>
                <AdminCustomers />
              </AdminLayout>
            } />
            <Route path="/admin/customers" element={
              <AdminLayout>
                <AdminCustomers />
              </AdminLayout>
            } />
            <Route path="/admin/inventory" element={
              <AdminLayout>
                <AdminInventory />
              </AdminLayout>
            } />
            <Route path="/admin/analytics" element={
              <AdminLayout>
                <AdminAnalytics />
              </AdminLayout>
            } />
            <Route path="/admin/payments" element={
              <AdminLayout>
                <AdminPayments />
              </AdminLayout>
            } />
            <Route path="/admin/settings" element={
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            } />
            <Route path="/admin/profile" element={
              <AdminLayout>
                <div>Admin Profile - Coming Soon</div>
              </AdminLayout>
            } />
            <Route path="/admin/messages" element={
              <AdminLayout>
                <AdminMessages />
              </AdminLayout>
            } />
            <Route path="/admin/notifications" element={
              <AdminLayout>
                <AdminNotifications />
              </AdminLayout>
            } />
            
            {/* Client Routes - Show Header, Footer, ChatWidget */}
            <Route path="/*" element={
              <>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/category/:category" element={<CategoryPage />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/returns" element={<Returns />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/track-order" element={<TrackOrder />} />
                    <Route path="/order/:orderId" element={<OrderDetail />} />
                    <Route path="/order-slip/:orderId" element={<OrderSlip />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/account/information" element={<Information />} />
                    <Route path="/account/orders" element={<UserOrderHistory />} />
                    {/* <Route path="/bookings" element={<BookingHistory />} /> */}
                  </Routes>
                </main>
                <Footer />
                <ChatWidget />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;