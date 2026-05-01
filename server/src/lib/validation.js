import { createHttpError } from './errors.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9 +()\-]{8,}$/;

function requiredText(value, fieldName) {
  if (!String(value || '').trim()) {
    throw createHttpError(400, `${fieldName} is required`);
  }
  return String(value).trim();
}

function normalizeOptionalText(value) {
  return String(value || '').trim();
}

function normalizeEmail(value) {
  const email = requiredText(value, 'Email').toLowerCase();
  if (!emailPattern.test(email)) {
    throw createHttpError(400, 'Please enter a valid email address');
  }
  return email;
}

function parseBirthDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw createHttpError(400, 'Please enter a valid birth date');
  }
  return parsed;
}

function validatePhone(value, label) {
  const phone = requiredText(value, label);
  if (!phonePattern.test(phone)) {
    throw createHttpError(400, `Please enter a valid ${label.toLowerCase()}`);
  }
  return phone;
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

function getPaymentMethodLabel(method) {
  if (method === 'visa') return 'Visa / Card';
  if (method === 'paypal') return 'PayPal';
  return 'Cash on Delivery';
}

function validatePayment(details) {
  const paymentMethod = details.paymentMethod || 'cash';

  if (paymentMethod === 'visa') {
    if (!normalizeOptionalText(details.cardName)) throw createHttpError(400, 'Please enter the name on the card');
    if (!passesLuhn(details.cardNumber)) throw createHttpError(400, 'Please enter a valid card number');
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(details.cardExpiry || ''))) throw createHttpError(400, 'Please enter a valid card expiry like MM/YY');
    if (!/^\d{3,4}$/.test(String(details.cardCvv || '').trim())) throw createHttpError(400, 'Please enter a valid CVV');
  }

  if (paymentMethod === 'paypal') {
    const paypalEmail = normalizeOptionalText(details.paypalEmail).toLowerCase();
    if (!emailPattern.test(paypalEmail)) {
      throw createHttpError(400, 'Please enter a valid PayPal email');
    }
  }

  const cardSuffix = String(details.cardNumber || '').replace(/\D/g, '').slice(-4);

  return {
    method: paymentMethod,
    label: getPaymentMethodLabel(paymentMethod),
    detail: paymentMethod === 'visa' && cardSuffix ? `Ending in ${cardSuffix}` : ''
  };
}

export function validateSignupPayload(body) {
  const password = String(body.password || '');
  if (password.length < 6) {
    throw createHttpError(400, 'Password must be at least 6 characters');
  }

  return {
    firstName: requiredText(body.firstName, 'First name'),
    lastName: requiredText(body.lastName, 'Last name'),
    birthDate: parseBirthDate(body.birthDate),
    gender: normalizeOptionalText(body.gender),
    email: normalizeEmail(body.email),
    password
  };
}

export function validateLoginPayload(body) {
  return {
    email: normalizeEmail(body.email),
    password: requiredText(body.password, 'Password')
  };
}

export function validateProfilePayload(body) {
  return {
    firstName: requiredText(body.firstName, 'First name'),
    lastName: requiredText(body.lastName, 'Last name'),
    birthDate: parseBirthDate(body.birthDate),
    gender: normalizeOptionalText(body.gender),
    phone: normalizeOptionalText(body.phone)
  };
}

export function validateOrderPayload(body) {
  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) {
    throw createHttpError(400, 'Your cart is empty');
  }

  const normalizedItems = items.map((item) => {
    const id = Number(item.id);
    const qty = Number(item.qty);

    if (!Number.isInteger(id) || id <= 0) {
      throw createHttpError(400, 'Invalid product in cart');
    }

    if (!Number.isInteger(qty) || qty <= 0) {
      throw createHttpError(400, 'Invalid quantity in cart');
    }

    return { id, qty };
  });

  const fullName = requiredText(body.fullName, 'Full name');
  const email = normalizeEmail(body.email);
  const phone = validatePhone(body.phone, 'Phone number');
  const whatsapp = validatePhone(body.whatsapp, 'WhatsApp number');
  const city = requiredText(body.city, 'City');
  const address = requiredText(body.address, 'Address');
  const notes = normalizeOptionalText(body.notes);
  const payment = validatePayment(body);

  return {
    customer: {
      fullName,
      email,
      phone,
      whatsapp,
      city,
      address,
      notes
    },
    payment,
    items: normalizedItems
  };
}
