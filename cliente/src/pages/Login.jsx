import { useMemo, useState } from 'react';

const API_URL = 'http://localhost:4001';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');

  const [loginForm, setLoginForm] = useState({
    email: 'jorge@example.com',
    password: '4209',
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    sex: 'male',
    height_cm: '',
    weight_kg: '',
    goalType: 'deficit',
    goalTarget: '',
    goalRate: '0.5',
    activity_level: '',
    experiencia: 'principiante',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isSignupValid = useMemo(() => {
    const {
      name,
      email,
      password,
      age,
      height_cm,
      weight_kg,
      goalTarget,
      goalRate,
      activity_level,
    } = signupForm;
    return (
      name.trim() &&
      email.trim() &&
      password.trim() &&
      age.trim() &&
      height_cm &&
      weight_kg &&
      goalTarget &&
      goalRate &&
      activity_level.trim()
    );
  }, [signupForm]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
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

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isSignupValid) return;
    setError(null);
    setSuccess(null);
    setLoading(true);

    const payload = {
      name: signupForm.name.trim(),
      email: signupForm.email.trim(),
      password: signupForm.password,
      age: signupForm.age,
      sex: signupForm.sex,
      height_cm: Number(signupForm.height_cm),
      weight_kg: signupForm.weight_kg,
      goal: {
        type: signupForm.goalType,
        target_weight_kg: Number(signupForm.goalTarget),
        rate_per_week_kg: Number(signupForm.goalRate),
      },
      activity_level: signupForm.activity_level,
      experiencia: signupForm.experiencia,
    };

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t?.error || `Error ${res.status}`);
      }
      const data = await res.json();
      setSuccess('Usuario registrado correctamente');
      onLogin?.(data.token, data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const tabButton = (tab, label) => (
    <button
      key={tab}
      className={`flex-1 py-2 text-sm font-medium rounded-xl transition ${
        mode === tab
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
      }`}
      onClick={() => {
        setMode(tab);
        setError(null);
        setSuccess(null);
      }}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur p-6 shadow-sm">
        <div className="mb-6 text-center space-y-1">
          <div className="text-2xl font-semibold tracking-tight">Gym4ULSA</div>
          <div className="text-sm text-gray-500">Accede o crea tu cuenta</div>
        </div>

        <div className="flex gap-3 mb-6">
          {tabButton('login', 'Iniciar sesión')}
          {tabButton('signup', 'Registrar usuario')}
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs mb-1 text-gray-600">Email</label>
              <input
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-gray-600">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
            <button
              className="w-full px-3 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Procesando…' : 'Ingresar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1 text-gray-600">Nombre</label>
                <input
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.name}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">Email</label>
                <input
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">Password</label>
                <input
                  type="password"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">Edad</label>
                <input
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.age}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, age: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">Sexo</label>
                <select
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.sex}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, sex: e.target.value }))
                  }
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">Altura (cm)</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.height_cm}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, height_cm: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">Peso (kg)</label>
                <input
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.weight_kg}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, weight_kg: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">Nivel de actividad</label>
                <input
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.activity_level}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, activity_level: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">Experiencia</label>
                <select
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.experiencia}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, experiencia: e.target.value }))
                  }
                >
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">Objetivo</label>
                <select
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.goalType}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, goalType: e.target.value }))
                  }
                >
                  <option value="deficit">Déficit</option>
                  <option value="volumen">Volumen</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">Peso objetivo (kg)</label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.goalTarget}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, goalTarget: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs mb-1 text-gray-600">
                  Cambio semanal (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  value={signupForm.goalRate}
                  onChange={(e) =>
                    setSignupForm((f) => ({ ...f, goalRate: e.target.value }))
                  }
                />
              </div>
            </div>
            <button
              className="w-full px-3 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition disabled:opacity-50"
              disabled={loading || !isSignupValid}
            >
              {loading ? 'Procesando…' : 'Registrar usuario'}
            </button>
          </form>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-4 text-center">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 mt-4 text-center">{success}</p>
        )}
      </div>
    </div>
  );
}
