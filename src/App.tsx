import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Layouts
import AdminLayout from './layouts/AdminLayout';
import StoreLayout from './layouts/StoreLayout';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductEditPage from './pages/admin/ProductEditPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import CustomersPage from './pages/admin/CustomersPage';
import HomepageEditorPage from './pages/admin/HomepageEditorPage';
import MediaLibraryPage from './pages/admin/MediaLibraryPage';
import DiscountsPage from './pages/admin/DiscountsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Store Pages
import HomePage from './pages/store/HomePage';
import CategoryPage from './pages/store/CategoryPage';
import ProductDetailPage from './pages/store/ProductDetailPage';
import CartPage from './pages/store/CartPage';
import CheckoutPage from './pages/store/CheckoutPage';
import OrderSuccessPage from './pages/store/OrderSuccessPage';
import AboutPage from './pages/store/AboutPage';
import ContactPage from './pages/store/ContactPage';

// Legal Pages
import TermsPage from './pages/store/legal/TermsPage';
import PrivacyPage from './pages/store/legal/PrivacyPage';
import ShippingPolicyPage from './pages/store/legal/ShippingPolicyPage';
import RefundPolicyPage from './pages/store/legal/RefundPolicyPage';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* Admin Login (public) */}
          <Route path="/admin" element={<LoginPage />} />

          {/* Admin Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/products/new" element={<ProductEditPage />} />
            <Route path="/admin/products/:id" element={<ProductEditPage />} />
            <Route path="/admin/categories" element={<CategoriesPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />
            <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
            <Route path="/admin/customers" element={<CustomersPage />} />
            <Route path="/admin/homepage" element={<HomepageEditorPage />} />
            <Route path="/admin/media" element={<MediaLibraryPage />} />
            <Route path="/admin/discounts" element={<DiscountsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>

          {/* Store Routes */}
          <Route element={<StoreLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<CategoryPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Legal Routes */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />

            <Route path="/wishlist" element={<div className="flex flex-col items-center justify-center py-20 text-center px-4"><span className="text-4xl mb-3">❤️</span><h2 className="font-display text-xl font-semibold text-charcoal mb-2">Wishlist</h2><p className="text-sm text-gray-500">Coming soon!</p></div>} />
            <Route path="/profile" element={<div className="flex flex-col items-center justify-center py-20 text-center px-4"><span className="text-4xl mb-3">👤</span><h2 className="font-display text-xl font-semibold text-charcoal mb-2">Profile</h2><p className="text-sm text-gray-500">Coming soon!</p></div>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
