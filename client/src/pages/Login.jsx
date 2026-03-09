import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, setAuthSession } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const data = await authApi.login(form);
      setAuthSession({ token: data.token, user: data.user });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-500">Log in to continue managing your goals.</p>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
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
          value={form.password}
          onChange={handleChange}
          required
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-500">
        New to GoalOS?{' '}
        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
          Create account
        </Link>
      </p>
    </div>
  );
};

export default Login;

