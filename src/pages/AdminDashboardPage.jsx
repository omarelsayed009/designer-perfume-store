import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../context/AppStore.jsx';

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function formatStatusLabel(status) {
  return String(status || 'pending')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function statusClassName(status) {
  return `status-pill status-pill--${String(status || 'pending').toLowerCase()}`;
}

function StatCard({ label, value, note }) {
  return (
    <article className="admin-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function AdminDashboardPage() {
  const {
    adminLoading,
    adminOrders,
    adminOverview,
    adminProducts,
    backendOnline,
    currentUser,
    formatDualPrice,
    formatOrderDate,
    formatUsd,
    isAdmin,
    loadAdminDashboard,
    session,
    updateAdminOrderStatus
  } = useAppStore();

  useEffect(() => {
    if (backendOnline && isAdmin) {
      void loadAdminDashboard();
    }
  }, [backendOnline, isAdmin]);

  if (!backendOnline) {
    return (
      <main className="account-shell admin-shell">
        <section className="account-overview guest-account">
          <div>
            <span>ADMIN ACCESS</span>
            <h1>Backend Required</h1>
            <p>The admin dashboard reads live orders, customers, and inventory from the API, so start the backend first.</p>
          </div>
          <div className="account-actions">
            <Link className="primary" to="/">Back To Store</Link>
          </div>
        </section>
      </main>
    );
  }

  if (!session.email) {
    return (
      <main className="account-shell admin-shell">
        <section className="account-overview guest-account">
          <div>
            <span>ADMIN ACCESS</span>
            <h1>Sign in as admin</h1>
            <p>Use the configured admin account to unlock live order controls and stock visibility.</p>
          </div>
          <div className="account-actions">
            <Link className="primary" to="/login">Sign In</Link>
            <Link className="secondary" to="/">Back To Store</Link>
          </div>
        </section>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="account-shell admin-shell">
        <section className="account-overview guest-account">
          <div>
            <span>ADMIN ACCESS</span>
            <h1>Access denied</h1>
            <p>This area is limited to admin accounts. You are currently signed in as a customer account.</p>
          </div>
          <div className="account-actions">
            <Link className="primary" to="/account">Go To My Account</Link>
            <Link className="secondary" to="/">Back To Store</Link>
          </div>
        </section>
      </main>
    );
  }

  const stats = adminOverview?.stats || {
    products: 0,
    customers: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  };
  const statusBreakdown = adminOverview?.statusBreakdown || [];
  const recentCustomers = adminOverview?.recentCustomers || [];
  const lowStockProducts = adminOverview?.lowStockProducts || [];
  const adminName = currentUser?.name || [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ').trim() || 'Admin';

  return (
    <main className="account-shell admin-shell">
      <section className="account-overview admin-overview">
        <div>
          <span>ADMIN CONTROL</span>
          <h1>{adminName}</h1>
          <p>{currentUser?.email}</p>
          <small className="account-meta">Monitor orders, customers, and inventory health from one live dashboard.</small>
        </div>
        <div className="account-actions">
          <button className="secondary" type="button" onClick={() => void loadAdminDashboard()} disabled={adminLoading}>Refresh Data</button>
          <Link className="secondary" to="/account">My Account</Link>
          <Link className="primary" to="/">Open Storefront</Link>
        </div>
      </section>

      <section className="admin-stats-grid">
        <StatCard label="Orders" value={stats.orders} note={`${stats.pendingOrders} still waiting`} />
        <StatCard label="Revenue" value={formatDualPrice(stats.revenue)} note="Non-cancelled orders" />
        <StatCard label="Customers" value={stats.customers} note="Registered shopper accounts" />
        <StatCard label="Products" value={stats.products} note={`${stats.lowStockProducts} low-stock alerts`} />
      </section>

      <section className="account-grid admin-grid">
        <article className="account-card">
          <div className="account-section-head">
            <div>
              <span>ORDER STATUS</span>
              <h2>Pipeline Snapshot</h2>
            </div>
          </div>
          <div className="admin-status-grid">
            {statusBreakdown.map((entry) => (
              <div key={entry.status} className="admin-status-card">
                <span className={statusClassName(entry.status)}>{formatStatusLabel(entry.status)}</span>
                <strong>{entry.count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="account-card">
          <div className="account-section-head">
            <div>
              <span>CUSTOMERS</span>
              <h2>Recent Signups</h2>
            </div>
          </div>
          {recentCustomers.length ? (
            <div className="admin-customer-list">
              {recentCustomers.map((customer) => (
                <article key={customer.id} className="admin-customer-row">
                  <div>
                    <strong>{customer.name || customer.email}</strong>
                    <p>{customer.email}</p>
                    <small>Joined {formatOrderDate(customer.joinedAt)}</small>
                  </div>
                  <div className="admin-customer-meta">
                    <span>{customer.ordersCount} orders</span>
                    <span>{customer.favoritesCount} favorites</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-panel">Customer accounts will appear here after the first signups.</div>
          )}
        </article>

        <article className="account-card account-card--wide">
          <div className="account-section-head">
            <div>
              <span>INVENTORY</span>
              <h2>Low Stock Alerts</h2>
            </div>
          </div>
          {lowStockProducts.length ? (
            <div className="admin-product-list admin-product-list--alerts">
              {lowStockProducts.map((product) => (
                <article key={product.id} className="admin-product-row">
                  <div>
                    <strong>{product.title}</strong>
                    <p>{formatDualPrice(product.price)}</p>
                  </div>
                  <div className="admin-product-meta">
                    <span className="status-pill status-pill--low-stock">Stock {product.stock}</span>
                    <span>Updated {formatOrderDate(product.updatedAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-panel">No low-stock products right now. Inventory levels look healthy.</div>
          )}
        </article>

        <article className="account-card account-card--wide">
          <div className="account-section-head">
            <div>
              <span>CATALOG</span>
              <h2>Inventory Snapshot</h2>
            </div>
          </div>
          {adminProducts.length ? (
            <div className="admin-product-list">
              {adminProducts.map((product) => (
                <article key={product.id} className="admin-product-row">
                  <div>
                    <strong>{product.title}</strong>
                    <p>{formatUsd(product.price)} each</p>
                  </div>
                  <div className="admin-product-meta">
                    <span>{product.gender}</span>
                    <span>Stock {product.stock}</span>
                    <span>Rate {Number(product.rating || 0).toFixed(1)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-panel">Product inventory will appear here after the dashboard loads.</div>
          )}
        </article>

        <article className="account-card account-card--wide">
          <div className="account-section-head">
            <div>
              <span>ORDER MANAGEMENT</span>
              <h2>All Orders</h2>
            </div>
          </div>
          {adminOrders.length ? (
            <div className="admin-order-list">
              {adminOrders.map((order) => (
                <article key={order.id} className="admin-order-card">
                  <div className="admin-order-head">
                    <div>
                      <span>#{order.reference}</span>
                      <h3>{order.customer.fullName}</h3>
                      <p className="history-payment">
                        {order.customer.email}
                        {' | '}
                        {order.customer.phone}
                        {' | '}
                        {formatOrderDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="admin-order-summary">
                      <strong>{formatDualPrice(order.total)}</strong>
                      <small>{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</small>
                    </div>
                  </div>

                  <div className="admin-order-actions">
                    <span className={statusClassName(order.status)}>{formatStatusLabel(order.status)}</span>
                    <label className="admin-status-field">
                      <span>Update status</span>
                      <select
                        className="status-select"
                        value={order.status}
                        disabled={adminLoading}
                        onChange={async (event) => {
                          await updateAdminOrderStatus(order.id, event.target.value);
                        }}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>{formatStatusLabel(status)}</option>
                        ))}
                      </select>
                    </label>
                    <div className="admin-order-account">
                      <span>{order.accountUser ? 'Signed-in order' : 'Guest order'}</span>
                      {order.accountUser?.email ? <small>{order.accountUser.email}</small> : null}
                    </div>
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
            <div className="empty-panel">Orders will appear here as soon as customers start checking out.</div>
          )}
        </article>
      </section>
    </main>
  );
}
