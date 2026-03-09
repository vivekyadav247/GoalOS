import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, setAuthSession } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authApi.register(form);
      setAuthSession({ token: data.token, user: data.user });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create account</h1>
      <p className="mt-2 text-sm text-slate-500">Start your planning workspace in seconds.</p>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
        <input
          className="input-base"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="input-base"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          className="input-base"
          type="password"
          name="password"
          placeholder="Password"
          minLength={6}
          value={form.password}
          onChange={handleChange}
          required
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;

