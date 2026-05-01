import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../context/AppStore.jsx';
import { AccountIcon, ProductFigure } from './ui.jsx';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm0-1.8a7.8 7.8 0 1 1 0 15.6 7.8 7.8 0 0 1 0-15.6Zm7.83 14.56 3.02 3.02-1.27 1.27-3.02-3.02 1.27-1.27Z" />
    </svg>
  );
}

function ThemeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.75a9.25 9.25 0 1 0 9.25 9.25A9.23 9.23 0 0 0 12 2.75Zm0 16.7V4.55a7.45 7.45 0 0 1 0 14.9Z" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-copy">
        <strong>DESIGNER</strong>
        <p>Stay in touch for orders, launches, and perfume support.</p>
      </div>
      <div className="social-links">
        <a className="social-link" href="https://www.instagram.com/designer.store" target="_blank" rel="noreferrer" aria-label="Instagram">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.8A5.2 5.2 0 1 1 6.8 13 5.2 5.2 0 0 1 12 7.8Zm0 2A3.2 3.2 0 1 0 15.2 13 3.2 3.2 0 0 0 12 9.8Zm5.75-3.35a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2Z" /></svg>
          <span>Instagram</span>
        </a>
        <a className="social-link" href="https://wa.me/201000000000" target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.05 4.94A9.93 9.93 0 0 0 12.02 2a10 10 0 0 0-8.68 15l-1.3 4.74 4.86-1.28A10 10 0 1 0 19.05 4.94ZM12.02 20a8 8 0 0 1-4.08-1.12l-.29-.17-2.89.76.77-2.81-.19-.29A8 8 0 1 1 12.02 20Zm4.39-5.98c-.24-.12-1.43-.7-1.65-.78s-.38-.12-.55.12-.63.78-.77.94-.28.18-.52.06a6.56 6.56 0 0 1-1.93-1.19 7.3 7.3 0 0 1-1.35-1.68c-.14-.24 0-.36.1-.48s.24-.28.36-.42a1.6 1.6 0 0 0 .24-.4.44.44 0 0 0 0-.42c-.06-.12-.55-1.33-.75-1.82s-.39-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.72 2.72 0 0 0-.85 2A4.7 4.7 0 0 0 8 12.44a10.77 10.77 0 0 0 4.13 3.65c2.45 1.05 2.45.7 2.89.65a2.43 2.43 0 0 0 1.59-1.12 2 2 0 0 0 .14-1.12c-.06-.1-.22-.16-.46-.28Z" /></svg>
          <span>WhatsApp</span>
        </a>
        <a className="social-link" href="https://www.facebook.com/designer.store" target="_blank" rel="noreferrer" aria-label="Facebook">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 22v-8.2h2.77l.42-3.2H13.5V8.56c0-.93.26-1.56 1.6-1.56h1.7V4.13A22.6 22.6 0 0 0 14.32 4c-2.46 0-4.14 1.5-4.14 4.24v2.36H7.4v3.2h2.78V22Z" /></svg>
          <span>Facebook</span>
        </a>
      </div>
    </footer>
  );
}

function CartDrawer({ open, onClose }) {
  const { cartItems, formatUsd, removeFromCart, changeCartQuantity } = useAppStore();
  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty || 1), 0);

  return (
    <aside className={`cart-drawer ${open ? 'open' : ''}`} id="cartDrawer">
      <div className="drawer-head">
        <h3>Shopping Cart</h3>
        <button type="button" aria-label="Close cart" onClick={onClose}>x</button>
      </div>
      <div id="cartItems">
        {cartItems.length ? cartItems.map((item) => (
          <article key={item.id} className="mini-item">
            <Link className="mini-item-media" to={`/product/${item.id}`} onClick={onClose} aria-label={`Open ${item.title}`}>
              <ProductFigure product={item} variant="mini" />
            </Link>
            <div className="mini-item-copy">
              <h4>{item.title}</h4>
              <p>{formatUsd(item.price)} each</p>
              <div className="qty-control">
                <button className="qty-btn" type="button" aria-label="Decrease quantity" onClick={() => changeCartQuantity(item.id, -1)}>-</button>
                <span>{item.qty}</span>
                <button className="qty-btn" type="button" aria-label="Increase quantity" onClick={() => changeCartQuantity(item.id, 1)}>+</button>
              </div>
            </div>
            <div className="mini-item-side">
              <strong>{formatUsd(item.price * item.qty)}</strong>
              <button className="link-btn" type="button" onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          </article>
        )) : (
          <div className="drawer-empty">
            <h4>Your cart is empty</h4>
            <p>Add perfumes from the collection and they will appear here instantly.</p>
            <Link className="secondary" to="/" onClick={onClose}>Start Browsing</Link>
          </div>
        )}
      </div>
      <div className="drawer-total">
        <span>Total</span>
        <strong>{formatUsd(total)}</strong>
      </div>
      <div className="drawer-actions">
        <Link className="checkout-link" to="/checkout" onClick={onClose}>CHECKOUT</Link>
      </div>
    </aside>
  );
}

function MobileMenu({ open, onClose, onSearch, query }) {
  const { cartItems, displayName, session } = useAppStore();
  const location = useLocation();
  const [value, setValue] = useState(query);

  useEffect(() => {
    setValue(query);
  }, [query]);

  return (
    <aside className={`mobile-menu ${open ? 'open' : ''}`} id="mobileMenu">
      <div className="mobile-menu-head">
        <strong>DESIGNER</strong>
        <button id="menuClose" className="icon-btn" type="button" aria-label="Close menu" onClick={onClose}>Close</button>
      </div>
      <form className="mobile-search" onSubmit={(event) => {
        event.preventDefault();
        onSearch(value, location.pathname);
        onClose();
      }}>
        <label className="mobile-search-label" htmlFor="mobileSearchInput">Search Perfume</label>
        <div className="mobile-search-row">
          <input id="mobileSearchInput" type="text" placeholder="Search perfume name" value={value} onChange={(event) => setValue(event.target.value)} />
          <button className="primary" type="submit">Search</button>
        </div>
      </form>
      <nav className="mobile-menu-nav">
        <NavLink to="/" onClick={onClose}>Home</NavLink>
        <NavLink to="/men" onClick={onClose}>Men</NavLink>
        <NavLink to="/women" onClick={onClose}>Women</NavLink>
      </nav>
      <div className="mobile-menu-actions">
        <Link className="icon-btn" to="/checkout" onClick={onClose}>Checkout <span data-cart-count>{cartItems.reduce((sum, item) => sum + item.qty, 0)}</span></Link>
        <Link className="icon-btn account-link" to={session.email ? '/account' : '/login'} onClick={onClose} aria-label="Account">
          <AccountIcon />
          <span>{session.email ? displayName : 'Account'}</span>
        </Link>
      </div>
    </aside>
  );
}

function Header({ query, onSearch, onOpenCart, onOpenMenu }) {
  const { cartItems, displayName, session, toggleTheme } = useAppStore();
  const location = useLocation();
  const [value, setValue] = useState(query);

  useEffect(() => {
    setValue(query);
  }, [query]);

  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu-btn" type="button" aria-label="Open menu" onClick={onOpenMenu}>Menu</button>
      <nav className="left-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/men">Men</NavLink>
        <NavLink to="/women">Women</NavLink>
      </nav>
      <Link className="brand" to="/">DESIGNER</Link>
      <div className="right-nav">
        <form className="search-box" onSubmit={(event) => {
          event.preventDefault();
          onSearch(value, location.pathname);
        }}>
          <button type="submit" id="searchBtn" className="icon-btn icon-only-btn" aria-label="Search">
            <SearchIcon />
          </button>
          <input id="searchInput" type="text" placeholder="Search perfume name" value={value} onChange={(event) => setValue(event.target.value)} />
          <button
            id="clearBtn"
            type="button"
            className="icon-btn"
            aria-label="Clear search"
            onClick={() => {
              setValue('');
              onSearch('', location.pathname);
            }}
          >
            Clear
          </button>
        </form>
        <button id="cartOpen" className="icon-btn" type="button" onClick={onOpenCart}>
          Cart <span id="cartCount">{cartItems.reduce((sum, item) => sum + item.qty, 0)}</span>
        </button>
        <Link className="icon-btn account-link" to={session.email ? '/account' : '/login'} aria-label="Account">
          <AccountIcon />
          <span>{session.email ? displayName : 'Account'}</span>
        </Link>
        <button className="icon-btn icon-only-btn" id="themeBtn" type="button" aria-label="Toggle theme" onClick={toggleTheme}>
          <ThemeIcon />
        </button>
      </div>
    </header>
  );
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('search') || '';
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast } = useAppStore();

  useEffect(() => {
    setCartOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.body.classList.toggle('panel-open', cartOpen || menuOpen);
  }, [cartOpen, menuOpen]);

  const handleSearch = (value, pathname = location.pathname) => {
    const trimmed = value.trim();
    const isCollectionPage = ['/', '/men', '/women'].includes(pathname);
    const targetPath = isCollectionPage ? pathname : '/';

    navigate({
      pathname: targetPath,
      search: trimmed ? `?search=${encodeURIComponent(trimmed)}` : ''
    });
  };

  return (
    <>
      <div className="grain" />
      <button className={`screen-overlay ${cartOpen || menuOpen ? 'show' : ''}`} type="button" aria-label="Close panels" onClick={() => { setCartOpen(false); setMenuOpen(false); }} />
      <Header query={query} onSearch={handleSearch} onOpenCart={() => setCartOpen(true)} onOpenMenu={() => setMenuOpen(true)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={handleSearch} query={query} />
      <Outlet />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Footer />
      <div id="toast" className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
