import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../context/AppStore.jsx';
import { FavoriteButton, ProductFigure } from '../components/ui.jsx';

export function AccountPage() {
  const navigate = useNavigate();
  const {
    currentUser,
    customer,
    displayName,
    favorites,
    formatDualPrice,
    formatOrderDate,
    formatUsd,
    isFavorite,
    logout,
    orders,
    session,
    toggleFavorite,
    updateProfile
  } = useAppStore();

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    setProfile({
      firstName: currentUser?.firstName || displayName || '',
      lastName: currentUser?.lastName || '',
      birthDate: currentUser?.birthDate || '',
      gender: currentUser?.gender || '',
      email: session.email || '',
      phone: customer.phone || session.phone || currentUser?.phone || ''
    });
  }, [currentUser, customer.phone, displayName, session.email, session.phone]);

  if (!session.email) {
    return (
      <main className="account-shell">
        <section className="account-overview guest-account">
          <div>
            <span>ACCOUNT ACCESS</span>
            <h1>Sign in first</h1>
            <p>Create an account or sign in to see your favorites, your order history, and your saved profile details.</p>
          </div>
          <div className="account-actions">
            <Link className="primary" to="/login">Sign In</Link>
            <Link className="secondary" to="/signup">Create Account</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="account-shell">
      <section className="account-overview">
        <div>
          <span>MY ACCOUNT</span>
          <h1>{session.name || displayName}</h1>
          <p>{session.email}</p>
          <small className="account-meta">{favorites.length} favorite perfume{favorites.length === 1 ? '' : 's'} | {orders.length} order{orders.length === 1 ? '' : 's'}</small>
        </div>
        <div className="account-actions">
          <Link className="secondary" to="/checkout">Go To Checkout</Link>
          <Link className="secondary" to="/">Keep Shopping</Link>
          <button className="primary" type="button" onClick={async () => { await logout(); navigate('/login'); }}>Log Out</button>
        </div>
      </section>

      <section className="account-grid">
        <article className="account-card">
          <div className="account-section-head">
            <div>
              <span>YOUR LIST</span>
              <h2>My Favorites</h2>
            </div>
            <strong>{favorites.length}</strong>
          </div>
          {favorites.length ? (
            <div className="favorite-list">
              {favorites.map((product) => (
                <article key={product.id} className="account-product">
                  <Link className="mini-item-media" to={`/product/${product.id}`} aria-label={`Open ${product.title}`}>
                    <ProductFigure product={product} variant="mini" />
                  </Link>
                  <div className="account-product-copy">
                    <h3>{product.title}</h3>
                    <p>{formatDualPrice(product.price)}</p>
                  </div>
                  <div className="account-product-actions">
                    <Link className="secondary account-view-btn" to={`/product/${product.id}`}>View</Link>
                    <FavoriteButton
                      active={isFavorite(product.id)}
                      className="favorite-btn--account"
                      onClick={async () => { await toggleFavorite(product.id); }}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-panel">No favorites yet. Tap the heart on any perfume and it will appear here.</div>
          )}
        </article>

        <article className="account-card">
          <div className="account-section-head">
            <div>
              <span>YOUR HISTORY</span>
              <h2>Order History</h2>
            </div>
            <strong>{orders.length}</strong>
          </div>
          {orders.length ? (
            <div className="history-list">
              {orders.map((order, index) => (
                <article key={order.id} className="history-card">
                  <div className="history-card-head">
                    <div>
                      <span>ORDER {orders.length - index}</span>
                      <h3>{formatOrderDate(order.createdAt)}</h3>
                      <p className="history-payment">{order.payment?.label || 'Cash on Delivery'}{order.payment?.detail ? ` | ${order.payment.detail}` : ''}</p>
                    </div>
                    <strong>{formatDualPrice(order.total)}</strong>
                  </div>
                  <div className="history-items">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.id}`} className="history-row">
                        <span>{item.title} x{item.qty}</span>
                        <span>{formatUsd(Number(item.price) * Number(item.qty || 1))}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-panel">Your orders will appear here after you complete checkout while signed in.</div>
          )}
        </article>

        <article className="account-card account-card--wide">
          <div className="account-section-head">
            <div>
              <span>PROFILE</span>
              <h2>Saved Details</h2>
            </div>
          </div>
          <form className="checkout-form profile-form" onSubmit={async (event) => {
            event.preventDefault();
            await updateProfile(profile);
          }}>
            <div className="field-grid">
              <label className="form-field">
                <span>First Name</span>
                <input type="text" value={profile.firstName} onChange={(event) => setProfile((prev) => ({ ...prev, firstName: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Last Name</span>
                <input type="text" value={profile.lastName} onChange={(event) => setProfile((prev) => ({ ...prev, lastName: event.target.value }))} />
              </label>
            </div>
            <div className="field-grid">
              <label className="form-field">
                <span>Date of Birth</span>
                <input type="date" value={profile.birthDate} onChange={(event) => setProfile((prev) => ({ ...prev, birthDate: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Gender</span>
                <select value={profile.gender} onChange={(event) => setProfile((prev) => ({ ...prev, gender: event.target.value }))}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>
            </div>
            <div className="field-grid">
              <label className="form-field">
                <span>Email</span>
                <input type="email" value={profile.email} readOnly />
              </label>
              <label className="form-field">
                <span>Phone</span>
                <input type="tel" value={profile.phone} onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Add your phone number" />
              </label>
            </div>
            <div className="actions checkout-actions">
              <button className="primary" type="submit">Save Profile</button>
            </div>
            <p className="checkout-status">Your profile stays ready across favorites, checkout, and your account area.</p>
          </form>
        </article>
      </section>
    </main>
  );
}
