import { useState } from 'react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('jorge@example.com');
  const [password, setPassword] = useState('4209');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `Error ${res.status}`);
      }
      const data = await res.json();
      onLogin?.(data.token, data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold tracking-tight">Gym4ULSA</div>
          <div className="text-sm text-gray-500">Accede a tu cuenta</div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs mb-1 text-gray-600">Email</label>
            <input className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1 text-gray-600">Password</label>
            <input type="password" className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          <button className="w-full px-3 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
      </div>
    </div>
  );
}
