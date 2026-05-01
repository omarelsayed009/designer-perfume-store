import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../context/AppStore.jsx';

function formatCardNumberValue(value) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatCardExpiryValue(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function PaymentOptions({ form, setForm }) {
  return (
    <>
      <fieldset className="payment-methods">
        <legend>Payment Method</legend>
        <div className="payment-options">
          {[
            { value: 'cash', title: 'Cash on Delivery', copy: 'Pay in cash when your perfume arrives.' },
            { value: 'visa', title: 'Visa / Card', copy: 'Enter your card details in the secure form below.' },
            { value: 'paypal', title: 'PayPal', copy: 'Use your PayPal account email for checkout.' }
          ].map((option) => (
            <label key={option.value} className={`payment-option ${form.paymentMethod === option.value ? 'active' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={form.paymentMethod === option.value}
                onChange={(event) => setForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
              />
              <div>
                <strong>{option.title}</strong>
                <p>{option.copy}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <section className="payment-panel" hidden={form.paymentMethod !== 'cash'}>
        <p className="payment-note">Cash on delivery selected. Our courier will collect the payment when your order reaches you.</p>
      </section>

      <section className="payment-panel" hidden={form.paymentMethod !== 'visa'}>
        <div className="field-grid">
          <label className="form-field">
            <span>Name on Card</span>
            <input
              type="text"
              name="cardName"
              autoComplete="cc-name"
              placeholder="Name printed on the card"
              value={form.cardName}
              onChange={(event) => setForm((prev) => ({ ...prev, cardName: event.target.value }))}
            />
          </label>
          <label className="form-field">
            <span>Card Number</span>
            <input
              type="text"
              name="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={form.cardNumber}
              onChange={(event) => setForm((prev) => ({ ...prev, cardNumber: formatCardNumberValue(event.target.value) }))}
            />
          </label>
        </div>
        <div className="field-grid">
          <label className="form-field">
            <span>Expiry</span>
            <input
              type="text"
              name="cardExpiry"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={form.cardExpiry}
              onChange={(event) => setForm((prev) => ({ ...prev, cardExpiry: formatCardExpiryValue(event.target.value) }))}
            />
          </label>
          <label className="form-field">
            <span>CVV</span>
            <input
              type="password"
              name="cardCvv"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="123"
              value={form.cardCvv}
              onChange={(event) => setForm((prev) => ({ ...prev, cardCvv: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
            />
          </label>
        </div>
        <p className="payment-note">Card details are validated only in this front-end demo and are not saved on this device.</p>
      </section>

      <section className="payment-panel" hidden={form.paymentMethod !== 'paypal'}>
        <label className="form-field">
          <span>PayPal Email</span>
          <input
            type="email"
            name="paypalEmail"
            autoComplete="email"
            placeholder="paypal@email.com"
            value={form.paypalEmail}
            onChange={(event) => setForm((prev) => ({ ...prev, paypalEmail: event.target.value }))}
          />
        </label>
        <p className="payment-note">This PayPal option is a front-end flow selection. No live PayPal transfer is triggered here.</p>
      </section>
    </>
  );
}

export function CheckoutPage() {
  const {
    cartItems,
    changeCartQuantity,
    removeFromCart,
    formatDualPrice,
    formatUsd,
    getCheckoutDefaults,
    placeOrder
  } = useAppStore();

  const defaults = getCheckoutDefaults();
  const [form, setForm] = useState(() => ({
    ...defaults,
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    paypalEmail: ''
  }));
  const [status, setStatus] = useState('Your saved details will stay ready for the next order.');
  const [successOrder, setSuccessOrder] = useState(null);
  const {
    address: defaultAddress,
    city: defaultCity,
    email: defaultEmail,
    fullName: defaultFullName,
    notes: defaultNotes,
    paymentMethod: defaultPaymentMethod,
    phone: defaultPhone,
    whatsapp: defaultWhatsapp
  } = defaults;

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ...defaults,
      paymentMethod: defaults.paymentMethod || prev.paymentMethod || 'cash'
    }));
  }, [defaultAddress, defaultCity, defaultEmail, defaultFullName, defaultNotes, defaultPaymentMethod, defaultPhone, defaultWhatsapp]);

  const total = useMemo(() => cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty || 1), 0), [cartItems]);
  const totalQty = cartItems.reduce((sum, item) => sum + Number(item.qty || 1), 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!cartItems.length) return;

    const result = await placeOrder(form);
    if (!result.ok) return;

    setStatus(result.status);
    setSuccessOrder(result);
    setForm((prev) => ({
      ...prev,
      cardName: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      paypalEmail: ''
    }));
  };

  return (
    <main className="checkout-layout" id="checkoutLayout">
      <section className="checkout-panel">
        <h1>Checkout</h1>
        <p className="checkout-subtitle">Review your perfumes before you confirm the order.</p>
        <div id="checkoutItems" className="checkout-list">
          {cartItems.map((item) => (
            <article key={item.id} className="checkout-item">
              <Link className="checkout-item-media" to={`/product/${item.id}`} aria-label={`Open ${item.title}`}>
                <div className="product-figure product-figure--checkout">
                  <img className="product-glow-image" draggable="false" src={item.thumbnail} alt="" aria-hidden="true" />
                  <img className="product-art" draggable="false" src={item.thumbnail} alt={item.title} />
                </div>
              </Link>
              <div className="checkout-item-copy">
                <h4>{item.title}</h4>
                <p>{formatUsd(item.price)} each</p>
                <div className="qty-control qty-control--checkout">
                  <button className="qty-btn" type="button" aria-label="Decrease quantity" onClick={() => changeCartQuantity(item.id, -1)}>-</button>
                  <span>{item.qty}</span>
                  <button className="qty-btn" type="button" aria-label="Increase quantity" onClick={() => changeCartQuantity(item.id, 1)}>+</button>
                </div>
              </div>
              <strong>{formatUsd(item.price * item.qty)}</strong>
              <button className="link-btn" type="button" onClick={() => removeFromCart(item.id)}>Remove</button>
            </article>
          ))}
        </div>
        {!cartItems.length && <p id="checkoutEmpty" className="empty-state">Your cart is empty.</p>}
        <div className="checkout-summary">
          <strong>Total</strong>
          <strong id="checkoutTotal">{formatUsd(total)}</strong>
        </div>
        <p className="checkout-meta">
          {cartItems.length ? `${totalQty} item${totalQty === 1 ? '' : 's'} ready for delivery.` : 'Choose a few perfumes to unlock the checkout flow.'}
        </p>
        <div className="actions checkout-actions">
          <Link className="secondary" to="/">Continue Shopping</Link>
        </div>
      </section>

      <section className="checkout-panel checkout-panel--form">
        <h2>Your Details</h2>
        <p className="checkout-subtitle">Fill in your contact details so our courier can reach you.</p>
        <form id="checkoutForm" className="checkout-form" onSubmit={handleSubmit}>
          <div className="field-grid">
            <label className="form-field">
              <span>Full Name</span>
              <input type="text" required autoComplete="name" placeholder="Your full name" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input type="email" required autoComplete="email" placeholder="name@email.com" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
            </label>
          </div>
          <div className="field-grid">
            <label className="form-field">
              <span>Phone</span>
              <input type="tel" required inputMode="tel" autoComplete="tel" placeholder="Your phone number" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
            </label>
            <label className="form-field">
              <span>WhatsApp</span>
              <input type="tel" required inputMode="tel" autoComplete="tel" placeholder="WhatsApp number" value={form.whatsapp} onChange={(event) => setForm((prev) => ({ ...prev, whatsapp: event.target.value }))} />
            </label>
          </div>
          <div className="field-grid">
            <label className="form-field">
              <span>City</span>
              <input type="text" required autoComplete="address-level2" placeholder="Your city" value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
            </label>
            <label className="form-field">
              <span>Address</span>
              <input type="text" required autoComplete="street-address" placeholder="Street and building" value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
            </label>
          </div>
          <label className="form-field">
            <span>Notes</span>
            <textarea placeholder="Landmark, preferred call time, or delivery notes" value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} />
          </label>

          <PaymentOptions form={form} setForm={setForm} />

          <div className="actions checkout-actions checkout-actions--submit">
            <button id="placeOrderBtn" className="primary" type="submit" disabled={!cartItems.length}>Place Order</button>
          </div>
          <p id="checkoutStatus" className="checkout-status" aria-live="polite">{status}</p>
        </form>

        {successOrder && (
          <section id="checkoutSuccess" className="checkout-success">
            <div className="checkout-success-head">
              <span>ORDER CONFIRMED</span>
              <h3>{successOrder.signedIn ? 'Saved in your account history' : 'Saved on this device'}</h3>
            </div>
            <p>
              Your perfume order is ready.
              {' '}
              {successOrder.signedIn
                ? 'You can now review it anytime from your account page.'
                : 'Create or sign in to an account next time to keep order history under your profile.'}
            </p>
            <div className="checkout-success-items">
              {successOrder.order.items.map((item) => (
                <div key={item.id} className="history-row">
                  <span>{item.title} x{item.qty}</span>
                  <span>{formatUsd(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-success-total">
              <strong>Total</strong>
              <strong>{formatDualPrice(successOrder.order.total)}</strong>
            </div>
            <div className="checkout-success-total checkout-success-total--method">
              <strong>Payment</strong>
              <strong>
                {successOrder.order.payment.label}
                {successOrder.order.payment.detail ? ` | ${successOrder.order.payment.detail}` : ''}
              </strong>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
