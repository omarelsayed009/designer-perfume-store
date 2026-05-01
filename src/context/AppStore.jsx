import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { HOME_LIMIT, MEN_LIMIT, WOMEN_LIMIT, fallbackProducts, loadCatalog, normalizeProduct } from '../data/catalog.js';
import * as api from '../lib/api.js';

const USER_KEY = 'designerUser';
const SESSION_KEY = 'designerSession';
const CUSTOMER_KEY = 'designerCustomer';
const FAVORITES_KEY = 'designerFavorites';
const ORDER_HISTORY_KEY = 'designerOrderHistory';
const CART_KEY = 'designerCart';
const THEME_KEY = 'designerTheme';

const AppStoreContext = createContext(null);

function readStorage(key, fallbackValue) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function useStoredState(key, initialValue) {
  const [state, setState] = useState(() => readStorage(key, initialValue));

  useEffect(() => {
    writeStorage(key, state);
  }, [key, state]);

  return [state, setState];
}

function formatUsd(value) {
  return `$${(Number(value) || 0).toFixed(2)}`;
}

function formatDualPrice(price) {
  const value = Number(price) || 0;
  return `LE ${Math.round(value * 50)} / ${formatUsd(value)}`;
}

function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function getPaymentMethodLabel(method) {
  if (method === 'visa') return 'Visa / Card';
  if (method === 'paypal') return 'PayPal';
  return 'Cash on Delivery';
}

function getMaskedCardSuffix(value) {
  return String(value || '').replace(/\D/g, '').slice(-4);
}

function getPaymentSummary(details) {
  const method = details.paymentMethod || 'cash';
  return {
    method,
    label: getPaymentMethodLabel(method),
    detail: method === 'visa' && getMaskedCardSuffix(details.cardNumber) ? `Ending in ${getMaskedCardSuffix(details.cardNumber)}` : ''
  };
}

function passesLuhn(value) {
  const digits = String(value || '').replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return digits.length >= 13 && digits.length <= 19 && sum % 10 === 0;
}

function validateCheckoutDetails(details) {
  const phonePattern = /^[0-9 +()\-]{8,}$/;
  if (!phonePattern.test(details.phone || '')) return 'Please enter a valid phone number';
  if (!phonePattern.test(details.whatsapp || '')) return 'Please enter a valid WhatsApp number';
  if ((details.city || '').trim().length < 2) return 'Please enter your city';
  if ((details.address || '').trim().length < 5) return 'Please enter a fuller address';
  return '';
}

function validatePaymentDetails(details) {
  const method = details.paymentMethod || 'cash';

  if (method === 'visa') {
    if (!(details.cardName || '').trim()) return 'Please enter the name on the card';
    if (!passesLuhn(details.cardNumber)) return 'Please enter a valid card number';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(details.cardExpiry || '')) return 'Please enter a valid card expiry like MM/YY';
    if (!/^\d{3,4}$/.test((details.cardCvv || '').trim())) return 'Please enter a valid CVV';
  }

  if (method === 'paypal' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((details.paypalEmail || '').trim())) {
    return 'Please enter a valid PayPal email';
  }

  return '';
}

function sanitizeCustomer(details) {
  return {
    fullName: details.fullName,
    email: details.email,
    phone: details.phone,
    whatsapp: details.whatsapp,
    city: details.city,
    address: details.address,
    notes: details.notes,
    paymentMethod: details.paymentMethod || 'cash'
  };
}

function summarizeProduct(product) {
  return {
    id: Number(product.id),
    title: product.title,
    price: Number(product.price) || 0,
    description: product.description || '',
    thumbnail: product.thumbnail || '',
    gender: product.gender || '',
    rating: Number(product.rating) || 0,
    stock: Number(product.stock) || 0,
    bestSellerScore: Number(product.bestSellerScore) || 0
  };
}

function createOrderRecord(items, payment) {
  const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty || 1), 0);
  return {
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    total: Number(total.toFixed(2)),
    payment,
    items: items.map((item) => ({
      ...summarizeProduct(item),
      qty: Number(item.qty) || 1
    }))
  };
}

async function loadProductsFromFallback() {
  return loadCatalog();
}

export function AppStoreProvider({ children }) {
  const [users, setUsers] = useStoredState(USER_KEY, []);
  const [sessionState, setSessionState] = useStoredState(SESSION_KEY, {});
  const [customer, setCustomer] = useStoredState(CUSTOMER_KEY, {});
  const [favoritesByUser, setFavoritesByUser] = useStoredState(FAVORITES_KEY, {});
  const [ordersByUser, setOrdersByUser] = useStoredState(ORDER_HISTORY_KEY, {});
  const [cartItems, setCartItems] = useStoredState(CART_KEY, []);
  const [theme, setTheme] = useStoredState(THEME_KEY, 'light');
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [toast, setToast] = useState('');
  const [backendOnline, setBackendOnline] = useState(false);
  const [serverUser, setServerUser] = useState(null);
  const [serverFavorites, setServerFavorites] = useState([]);
  const [serverOrders, setServerOrders] = useState([]);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 1450);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setLoadingProducts(true);

      let online = false;

      try {
        await api.ping();
        online = true;
      } catch {
        online = false;
      }

      if (!mounted) return;
      setBackendOnline(online);

      if (online) {
        try {
          const [productsResult, sessionResult] = await Promise.all([
            api.fetchProducts(),
            api.fetchSession()
          ]);

          if (!mounted) return;
          setAllProducts(productsResult.products?.length ? productsResult.products : await loadProductsFromFallback());
          setServerUser(sessionResult.user || null);
        } catch {
          if (!mounted) return;
          setBackendOnline(false);
          setServerUser(null);
          setAllProducts(await loadProductsFromFallback());
        }
      } else {
        setAllProducts(await loadProductsFromFallback());
      }

      if (mounted) {
        setLoadingProducts(false);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAccountCollections() {
      if (!backendOnline) return;

      if (!serverUser) {
        setServerFavorites([]);
        setServerOrders([]);
        return;
      }

      try {
        const [favoritesResult, ordersResult] = await Promise.all([
          api.fetchFavorites(),
          api.fetchOrders()
        ]);

        if (!mounted) return;
        setServerFavorites(favoritesResult.favorites || []);
        setServerOrders(ordersResult.orders || []);
      } catch {
        if (!mounted) return;
      }
    }

    loadAccountCollections();

    return () => {
      mounted = false;
    };
  }, [backendOnline, serverUser]);

  const findUserByEmail = (email) => users.find((user) => user.email === email) || null;

  const localSession = useMemo(() => {
    if (!sessionState?.email) return {};
    return findUserByEmail(sessionState.email) ? sessionState : {};
  }, [sessionState, users]);

  useEffect(() => {
    if (!backendOnline && sessionState?.email && !localSession.email) {
      setSessionState({});
    }
  }, [backendOnline, localSession, sessionState, setSessionState]);

  const currentUser = backendOnline ? serverUser : (localSession.email ? findUserByEmail(localSession.email) : null);
  const session = backendOnline
    ? (serverUser ? {
      name: [serverUser.firstName, serverUser.lastName].filter(Boolean).join(' ').trim(),
      email: serverUser.email,
      phone: serverUser.phone || ''
    } : {})
    : localSession;

  const favorites = backendOnline ? serverFavorites : (session.email ? favoritesByUser[session.email] || [] : []);
  const orders = backendOnline ? serverOrders : (session.email ? ordersByUser[session.email] || [] : []);

  const displayName = (() => {
    const rawName = session.name || '';
    const firstWord = rawName.trim().split(/\s+/)[0] || '';
    if (firstWord) return firstWord;
    if (session.email) return session.email.split('@')[0];
    return 'Account';
  })();

  const showToast = (message) => setToast(message);
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const getPageLimit = (gender) => {
    if (gender === 'men') return MEN_LIMIT;
    if (gender === 'women') return WOMEN_LIMIT;
    return HOME_LIMIT;
  };

  const getProductsForView = (gender, query = '') => {
    const normalizedSearch = query.trim().toLowerCase();
    const filtered = allProducts
      .filter((product) => {
        const genderMatch = gender === 'home' ? true : product.gender === gender;
        const searchMatch = !normalizedSearch || product.title.toLowerCase().includes(normalizedSearch);
        return genderMatch && searchMatch;
      })
      .sort((a, b) => b.bestSellerScore - a.bestSellerScore);

    return {
      filtered,
      featured: filtered.slice(0, getPageLimit(gender))
    };
  };

  const getProductById = (id) => {
    const numericId = Number(id);
    const pools = [
      allProducts,
      cartItems,
      favorites,
      orders.flatMap((order) => order.items || []),
      fallbackProducts.map((product, index) => normalizeProduct(product, index))
    ];

    for (const pool of pools) {
      const found = pool.find((product) => Number(product.id) === numericId);
      if (found) return found;
    }

    return null;
  };

  const getRecommendations = (product) => {
    if (!product) return [];
    const sameGender = allProducts.filter((item) => item.id !== product.id && item.gender === product.gender);
    const fallbackItems = allProducts.filter((item) => item.id !== product.id);
    return [...sameGender, ...fallbackItems]
      .filter((item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index)
      .slice(0, 4);
  };

  const isFavorite = (productId) => favorites.some((item) => Number(item.id) === Number(productId));

  const signup = async (payload) => {
    if (backendOnline) {
      try {
        const result = await api.signup(payload);
        showToast(result.message || 'Account created successfully');
        return { ok: true };
      } catch (error) {
        showToast(error.message);
        return { ok: false };
      }
    }

    const email = payload.email.trim().toLowerCase();
    if (findUserByEmail(email)) {
      showToast('This email already has an account');
      return { ok: false };
    }

    if ((payload.password || '').length < 6) {
      showToast('Password must be at least 6 characters');
      return { ok: false };
    }

    const nextUser = {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      birthDate: payload.birthDate,
      gender: payload.gender,
      email,
      password: payload.password,
      phone: payload.phone || ''
    };

    setUsers((prev) => [...prev, nextUser]);
    showToast('Account created successfully');
    return { ok: true };
  };

  const login = async (email, password) => {
    if (backendOnline) {
      try {
        const result = await api.login({ email, password });
        setServerUser(result.user);
        setCustomer((prev) => ({
          ...prev,
          fullName: result.user.name,
          email: result.user.email,
          phone: result.user.phone || prev.phone || ''
        }));
        showToast(result.message || 'Logged in successfully');
        return { ok: true };
      } catch (error) {
        showToast(error.message);
        return { ok: false };
      }
    }

    const normalizedEmail = email.trim().toLowerCase();
    const savedUser = findUserByEmail(normalizedEmail);

    if (!savedUser || savedUser.password !== password) {
      showToast('Wrong email or password');
      return { ok: false };
    }

    const fullName = [savedUser.firstName, savedUser.lastName].filter(Boolean).join(' ').trim();
    setSessionState({
      name: fullName,
      email: savedUser.email,
      phone: savedUser.phone || ''
    });
    setCustomer((prev) => ({
      ...prev,
      fullName,
      email: savedUser.email,
      phone: savedUser.phone || prev.phone || ''
    }));
    showToast('Logged in successfully');
    return { ok: true };
  };

  const logout = async () => {
    if (backendOnline) {
      try {
        await api.logout();
      } catch {
        // Keep the UI responsive even if the backend disappears while logging out.
      }
      setServerUser(null);
      setServerFavorites([]);
      setServerOrders([]);
      showToast('Logged out successfully');
      return;
    }

    setSessionState({});
    showToast('Logged out successfully');
  };

  const updateProfile = async (payload) => {
    if (backendOnline) {
      try {
        const result = await api.updateProfile(payload);
        setServerUser(result.user);
        setCustomer((prev) => ({
          ...prev,
          fullName: result.user.name,
          email: result.user.email,
          phone: result.user.phone || '',
          paymentMethod: prev.paymentMethod || 'cash'
        }));
        showToast(result.message || 'Profile updated');
        return { ok: true };
      } catch (error) {
        showToast(error.message);
        return { ok: false };
      }
    }

    if (!session.email) return { ok: false };

    const firstName = payload.firstName.trim();
    const lastName = payload.lastName.trim();
    if (!firstName || !lastName) {
      showToast('Please enter your first and last name');
      return { ok: false };
    }

    const fullName = [firstName, lastName].join(' ').trim();
    setUsers((prev) => prev.map((user) => (user.email === session.email ? {
      ...user,
      firstName,
      lastName,
      birthDate: payload.birthDate,
      gender: payload.gender,
      phone: payload.phone || ''
    } : user)));
    setCustomer((prev) => ({
      ...prev,
      fullName,
      email: session.email,
      phone: payload.phone || '',
      paymentMethod: prev.paymentMethod || 'cash'
    }));
    setSessionState((prev) => ({
      ...prev,
      name: fullName,
      phone: payload.phone || ''
    }));
    showToast('Profile updated');
    return { ok: true };
  };

  const toggleFavorite = async (productId) => {
    if (!session.email) {
      showToast('Sign in first to save favorites');
      return { ok: false, requiresLogin: true };
    }

    const product = getProductById(productId);
    if (!product) return { ok: false };

    const currentlyFavorite = isFavorite(productId);

    if (backendOnline) {
      try {
        if (currentlyFavorite) {
          await api.removeFavorite(productId);
          setServerFavorites((prev) => prev.filter((item) => Number(item.id) !== Number(productId)));
          showToast('Removed from favorites');
        } else {
          await api.addFavorite(productId);
          setServerFavorites((prev) => [summarizeProduct(product), ...prev.filter((item) => Number(item.id) !== Number(productId))]);
          showToast('Added to favorites');
        }

        return { ok: true };
      } catch (error) {
        showToast(error.message);
        return { ok: false };
      }
    }

    setFavoritesByUser((prev) => {
      const current = prev[session.email] || [];
      const exists = current.some((item) => Number(item.id) === Number(productId));
      const next = exists
        ? current.filter((item) => Number(item.id) !== Number(productId))
        : [summarizeProduct(product), ...current.filter((item) => Number(item.id) !== Number(productId))];

      return {
        ...prev,
        [session.email]: next
      };
    });
    showToast(currentlyFavorite ? 'Removed from favorites' : 'Added to favorites');
    return { ok: true };
  };

  const addToCart = (product) => {
    if (!product) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => Number(item.id) === Number(product.id));
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }

      return [...prev, { ...summarizeProduct(product), qty: 1 }];
    });
    showToast(`${product.title} added to cart`);
  };

  const changeCartQuantity = (productId, delta) => {
    setCartItems((prev) => prev
      .map((item) => (item.id === productId ? { ...item, qty: item.qty + delta } : item))
      .filter((item) => item.qty > 0));
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const getCheckoutDefaults = () => ({
    fullName: session.name || customer.fullName || [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim() || '',
    email: session.email || customer.email || currentUser?.email || '',
    phone: session.phone || customer.phone || currentUser?.phone || '',
    whatsapp: customer.whatsapp || session.phone || '',
    city: customer.city || '',
    address: customer.address || '',
    notes: customer.notes || '',
    paymentMethod: customer.paymentMethod || 'cash'
  });

  const placeOrder = async (details) => {
    const detailsError = validateCheckoutDetails(details);
    if (detailsError) {
      showToast(detailsError);
      return { ok: false };
    }

    const paymentError = validatePaymentDetails(details);
    if (paymentError) {
      showToast(paymentError);
      return { ok: false };
    }

    setCustomer(sanitizeCustomer(details));

    if (backendOnline) {
      try {
        const result = await api.placeOrder({
          ...details,
          items: cartItems.map((item) => ({
            id: item.id,
            qty: item.qty
          }))
        });

        if (result.signedIn && result.order) {
          setServerOrders((prev) => [result.order, ...prev]);
        }

        setCartItems([]);
        showToast(result.message || 'Order placed successfully');
        return {
          ok: true,
          order: result.order,
          signedIn: result.signedIn,
          status: result.status
        };
      } catch (error) {
        showToast(error.message);
        return { ok: false };
      }
    }

    const paymentSummary = getPaymentSummary(details);
    const order = createOrderRecord(cartItems, paymentSummary);

    if (session.email) {
      setOrdersByUser((prev) => ({
        ...prev,
        [session.email]: [order, ...(prev[session.email] || [])]
      }));
      setSessionState((prev) => ({
        ...prev,
        name: details.fullName || prev.name,
        phone: details.phone || prev.phone || ''
      }));
      showToast('Order placed and saved');
    } else {
      showToast('Order placed successfully');
    }

    setCartItems([]);
    return {
      ok: true,
      order,
      signedIn: Boolean(session.email),
      status: session.email
        ? `${details.fullName}, your order is saved in your account history with ${paymentSummary.label}.`
        : `${details.fullName}, your order has been saved on this device with ${paymentSummary.label}.`
    };
  };

  const value = {
    allProducts,
    backendOnline,
    cartItems,
    customer,
    currentUser,
    displayName,
    favorites,
    loadingProducts,
    orders,
    session,
    theme,
    toast,
    formatDualPrice,
    formatOrderDate,
    formatUsd,
    getCheckoutDefaults,
    getPageLimit,
    getProductById,
    getProductsForView,
    getRecommendations,
    isFavorite,
    login,
    logout,
    placeOrder,
    showToast,
    signup,
    toggleFavorite,
    toggleTheme,
    updateProfile,
    addToCart,
    changeCartQuantity,
    removeFromCart
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) throw new Error('useAppStore must be used within AppStoreProvider');
  return context;
}
