import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../context/AppStore.jsx';

export function LoginPage() {
  const navigate = useNavigate();
  const { cartItems, login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login(email, password);
    if (!result.ok) return;
    navigate(cartItems.length ? '/checkout' : '/account');
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <span>ACCOUNT ACCESS</span>
        <h1>WELCOME BACK</h1>
        <p>Log in to continue your order and keep your delivery details ready.</p>
      </section>

      <section className="auth-card">
        <h2>Sign In</h2>
        <p className="auth-note">Enter your email and password to open your account.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input type="email" required autoComplete="email" placeholder="name@email.com" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input type="password" required minLength="6" autoComplete="current-password" placeholder="Your password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <div className="actions auth-actions">
            <button className="primary" type="submit">Sign In</button>
          </div>
        </form>
        <p className="auth-switch">If you don't have an account? <Link to="/signup">Make it now</Link>.</p>
      </section>
    </main>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAppStore();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    email: '',
    password: ''
  });

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await signup(form);
    if (!result.ok) return;
    navigate('/login');
  };

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <span>CREATE ACCOUNT</span>
        <h1>SIGN UP</h1>
        <p>Save your contact details once and make every checkout faster.</p>
      </section>

      <section className="auth-card">
        <h2>Make New Account</h2>
        <p className="auth-note">Enter your basic information to create your account.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-grid">
            <label className="form-field">
              <span>First Name</span>
              <input type="text" required autoComplete="given-name" placeholder="Your first name" value={form.firstName} onChange={(event) => handleChange('firstName', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Last Name</span>
              <input type="text" required autoComplete="family-name" placeholder="Your last name" value={form.lastName} onChange={(event) => handleChange('lastName', event.target.value)} />
            </label>
          </div>
          <div className="field-grid">
            <label className="form-field">
              <span>Date of Birth</span>
              <input type="date" required autoComplete="bday" value={form.birthDate} onChange={(event) => handleChange('birthDate', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Gender</span>
              <select required value={form.gender} onChange={(event) => handleChange('gender', event.target.value)}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
          </div>
          <div className="field-grid">
            <label className="form-field">
              <span>Email</span>
              <input type="email" required autoComplete="email" placeholder="name@email.com" value={form.email} onChange={(event) => handleChange('email', event.target.value)} />
            </label>
            <label className="form-field">
              <span>Password</span>
              <input type="password" required minLength="6" autoComplete="new-password" placeholder="Create password" value={form.password} onChange={(event) => handleChange('password', event.target.value)} />
            </label>
          </div>
          <div className="actions auth-actions">
            <button className="primary" type="submit">Create Account</button>
          </div>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in now</Link>.</p>
      </section>
    </main>
  );
}
