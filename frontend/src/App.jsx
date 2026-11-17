import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, AdminRoute, ScrollToTop } from './routes/guards';
import Loader from './components/Loader/Loader';

// Layouts
import MainLayout from './layouts/MainLayout/MainLayout';
import AccountLayout from './layouts/AccountLayout/AccountLayout';

// Storefront pages
import Home from './pages/Home/Home';
import Shop from './pages/Shop/Shop';
import Category from './pages/Category/Category';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import TrackOrder from './pages/TrackOrder/TrackOrder';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import FAQ from './pages/FAQ/FAQ';
import Policy from './pages/Policy/Policy';
import CustomOrder from './pages/CustomOrder/CustomOrder';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import Profile from './pages/Account/Profile/Profile';
import Addresses from './pages/Account/Addresses/Addresses';
import MyOrders from './pages/Account/MyOrders/MyOrders';
import MyOrderDetails from './pages/Account/MyOrderDetails/MyOrderDetails';
import NotFound from './pages/NotFound/NotFound';

// Admin (code-split so customers never download the admin bundle)
const AdminLayout = lazy(() => import('./layouts/AdminLayout/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin/AdminLogin'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard/Dashboard'));
const Orders = lazy(() => import('./pages/admin/Orders/Orders'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail/OrderDetail'));
const Products = lazy(() => import('./pages/admin/Products/Products'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm/ProductForm'));
const Categories = lazy(() => import('./pages/admin/Categories/Categories'));
const Inventory = lazy(() => import('./pages/admin/Inventory/Inventory'));
const Customers = lazy(() => import('./pages/admin/Customers/Customers'));
const Reviews = lazy(() => import('./pages/admin/Reviews/Reviews'));
const Coupons = lazy(() => import('./pages/admin/Coupons/Coupons'));
const Enquiries = lazy(() => import('./pages/admin/Enquiries/Enquiries'));
const ContentManager = lazy(() => import('./pages/admin/ContentManager/ContentManager'));
const Reports = lazy(() => import('./pages/admin/Reports/Reports'));
const Notifications = lazy(() => import('./pages/admin/Notifications/Notifications'));
const Staff = lazy(() => import('./pages/admin/Staff/Staff'));
const Settings = lazy(() => import('./pages/admin/Settings/Settings'));
const AuditLog = lazy(() => import('./pages/admin/AuditLog/AuditLog'));

const guard = (permission, el) => <AdminRoute permission={permission}>{el}</AdminRoute>;

const App = () => (
  <>
    <ScrollToTop />
    <Suspense fallback={<Loader fullPage />}>
      <Routes>
        {/* ---------- Customer website ---------- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/custom-order" element={<CustomOrder />} />
          <Route path="/policies/:slug" element={<Policy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Profile />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<MyOrderDetails />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ---------- Admin panel ---------- */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={guard('dashboard', <Dashboard />)} />
          <Route path="orders" element={guard('orders', <Orders />)} />
          <Route path="orders/:id" element={guard('orders', <OrderDetail />)} />
          <Route path="products" element={guard('products', <Products />)} />
          <Route path="products/new" element={guard('products', <ProductForm />)} />
          <Route path="products/:id/edit" element={guard('products', <ProductForm />)} />
          <Route path="categories" element={guard('categories', <Categories />)} />
          <Route path="inventory" element={guard('inventory', <Inventory />)} />
          <Route path="customers" element={guard('customers', <Customers />)} />
          <Route path="reviews" element={guard('reviews', <Reviews />)} />
          <Route path="coupons" element={guard('coupons', <Coupons />)} />
          <Route path="enquiries" element={guard('enquiries', <Enquiries />)} />
          <Route path="content" element={guard('content', <ContentManager />)} />
          <Route path="reports" element={guard('reports', <Reports />)} />
          <Route path="notifications" element={guard('notifications', <Notifications />)} />
          <Route path="staff" element={guard('staff', <Staff />)} />
          <Route path="settings" element={guard('settings', <Settings />)} />
          <Route path="audit-log" element={guard('audit', <AuditLog />)} />
        </Route>
      </Routes>
    </Suspense>
  </>
);

export default App;
