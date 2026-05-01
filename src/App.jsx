import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppStoreProvider } from './context/AppStore.jsx';
import { AppLayout } from './components/Layout.jsx';
import { AccountPage } from './pages/AccountPage.jsx';
import { LoginPage, SignupPage } from './pages/AuthPages.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { CollectionPage } from './pages/CollectionPage.jsx';
import { ProductPage } from './pages/ProductPage.jsx';

export default function App() {
  return (
    <AppStoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<CollectionPage gender="home" />} />
            <Route path="/men" element={<CollectionPage gender="men" />} />
            <Route path="/women" element={<CollectionPage gender="women" />} />
            <Route path="/product/:productId" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppStoreProvider>
  );
}
