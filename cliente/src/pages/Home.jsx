import { useCallback, useEffect, useState } from 'react';

export default function Home({ token, user }) {
  const [dump, setDump] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const url = 'http://localhost:4001/api/db/dump';
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((json) => setDump(json))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  // Helpers & indexing
  const users = dump?.users || [];
  const meals = dump?.meals || [];
  const foods = dump?.foods || [];
  const supplements = dump?.supplements || [];
  const nutritionSettings = dump?.nutrition_settings || [];
  const trainingRoutines = dump?.training_routines || [];
  const trainingExercises = dump?.training_exercises || [];
  const userSupplements = dump?.user_supplements || [];
  const userRoutines = dump?.user_routines || [];

  const foodsById = Object.fromEntries(foods.map(f => [f.id, f]));
  const routinesById = Object.fromEntries(trainingRoutines.map(r => [String(r.id), r]));
  const supplementsById = Object.fromEntries(supplements.map(s => [String(s.id), s]));

  // Current user document from DB by id or email
  const current = users.find(u => u._id === user?.id) || users.find(u => u.email === user?.email);
  const currentId = current?._id;

  // User-scoped data
  const myMeals = meals.filter(m => m.user_id === currentId);
  const mySuppLink = userSupplements.find(us => us.user_id === currentId);
  const mySupps = (mySuppLink?.supplement_ids || []).map(id => supplementsById[String(id)]).filter(Boolean);
  const myURLink = userRoutines.find(ur => ur.user_id === currentId);
  const myRoutines = (myURLink?.routine_ids || []).map(id => routinesById[String(id)]).filter(Boolean);
  const myNutri = nutritionSettings; // global settings in sample; show first

  const Card = ({ title, subtitle, children, right }) => (
    <section className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 p-5 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );

  const Pill = ({ children }) => (
    <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">{children}</span>
  );

  const toText = (val) => {
    if (val === null || val === undefined) return String(val);
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const formatGoal = (g) => {
    if (!g || typeof g !== 'object') return toText(g);
    const typeMap = {
      deficit: 'Déficit',
      maintain_weight: 'Mantener peso',
      lose_weight: 'Perder peso',
      gain_weight: 'Ganar peso'
    };
    const t = typeMap[g.type] || g.type;
    const target = g.target_weight_kg !== undefined ? `${g.target_weight_kg} kg` : '—';
    const rate = g.rate_per_week_kg !== undefined ? `${g.rate_per_week_kg} kg/sem` : '—';
    return `${t}: objetivo ${target} (${rate})`;
  };

  const KeyVal = ({ k, v }) => (
    <div className="grid grid-cols-12 gap-2 text-sm">
      <div className="col-span-4 text-gray-500 break-words">{k}</div>
      <div className="col-span-8 font-medium break-words">{k === 'goal' ? formatGoal(v) : toText(v)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Bienvenido{current?.name ? `, ${current.name}` : ''}</h2>
          <p className="text-sm text-gray-500">Tu panel personal</p>
        </div>
        <button className="px-3 py-1 rounded-xl border" onClick={load}>Refrescar</button>
      </div>

      <Card title="Perfil">
        {current ? (
          <div className="space-y-6">
            <ProfileEditor token={token} current={current} onSaved={load} />
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Detalles</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(current).map(([k, v]) => (
                  <KeyVal key={k} k={k} v={v} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No se encontró el perfil del usuario.</p>
        )}
      </Card>

      <Card title="Comidas" subtitle={myMeals.length ? `${myMeals.length} día(s)` : 'Sin registros'}>
        <div className="space-y-4">
          {myMeals.map((day) => (
            <div key={day._id} className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{day.date}</div>
                {day.summary && (
                  <div className="flex gap-2 flex-wrap">
                    <Pill>{day.summary.energy_kcal} kcal</Pill>
                    <Pill>P {day.summary.protein_g}g</Pill>
                    <Pill>C {day.summary.carbs_g}g</Pill>
                    <Pill>F {day.summary.fat_g}g</Pill>
                  </div>
                )}
              </div>
              <div className="grid gap-3">
                {(day.meals || []).map((m, idx) => (
                  <div key={idx} className="">
                    <div className="text-sm text-gray-600 mb-1">{m.name?.es || m.name || m}</div>
                    {Array.isArray(m.items) && (
                      <ul className="grid sm:grid-cols-2 gap-2">
                        {m.items.map((it, iidx) => {
                          const f = foodsById[it.food_id];
                          return (
                            <li key={iidx} className="rounded-lg border border-gray-200/60 dark:border-gray-800/60 p-3">
                              <div className="font-medium text-sm">{f?.name?.es || f?.name?.en || it.food_id}</div>
                              {it.computed && (
                                <div className="mt-1 text-xs text-gray-600 flex gap-2 flex-wrap">
                                  <Pill>{it.computed.energy_kcal} kcal</Pill>
                                  <Pill>P {it.computed.protein_g}g</Pill>
                                  <Pill>C {it.computed.carbs_g}g</Pill>
                                  <Pill>F {it.computed.fat_g}g</Pill>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Rutinas" subtitle={myRoutines.length ? `${myRoutines.length} asignada(s)` : 'Sin rutinas asignadas'}>
        <RoutineAssigner token={token} allRoutines={trainingRoutines} selected={myRoutines} onSaved={load} />
      </Card>

      <Card title="Suplementos" subtitle={mySupps.length ? `${mySupps.length} activo(s)` : 'Sin suplementos'}>
        <SupplementAssigner token={token} allSupps={supplements} selected={mySupps} onSaved={load} />
      </Card>

      <Card title="Ajustes de Nutrición" subtitle="Objetivos y macros">
        {myNutri.length ? (
          <div className="grid gap-3">
            {myNutri.map((n) => (
              <div key={n._id} className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 p-4">
                <div className="text-sm text-gray-600">{n.formula} — objetivo {n.calorie_target_kcal} kcal</div>
                {n.macro_targets && (
                  <div className="mt-2 text-xs text-gray-500 flex gap-2 flex-wrap">
                    <Pill>P {n.macro_targets.protein_g}g</Pill>
                    <Pill>C {n.macro_targets.carbs_g}g</Pill>
                    <Pill>F {n.macro_targets.fat_g}g</Pill>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sin configuración nutricional disponible.</p>
        )}
      </Card>

      <Card title="Agregar día de comidas" subtitle="Crea un registro vacío para una fecha">
        <CreateMealsDay token={token} onSaved={load} />
      </Card>

      {/* Proyectos (si existen) */}
      {Array.isArray(dump?.projects) && dump.projects.length > 0 && (
        <Card title="Proyectos" subtitle={`${dump.projects.length} proyecto(s)`}>
          <ul className="grid md:grid-cols-2 gap-3">
            {dump.projects.map((p) => (
              <li key={p._id || p.id} className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 p-4">
                <div className="font-medium">{p.name || p.titulo || 'Proyecto'}</div>
                {p.description && <div className="text-sm text-gray-600">{p.description}</div>}
                <div className="mt-2 text-xs text-gray-500">{toText(p)}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Otras colecciones no mostradas explícitamente */}
      {(() => {
        const shown = new Set([
          'users', 'meals', 'foods', 'supplements', 'training_routines', 'training_exercises', 'nutrition_settings', 'user_supplements', 'user_routines', 'projects'
        ]);
        const rest = Object.entries(dump || {}).filter(([k]) => !shown.has(k));
        if (!rest.length) return null;
        return (
          <Card title="Otras colecciones">
            <div className="space-y-4">
              {rest.map(([name, docs]) => (
                <div key={name}>
                  <div className="text-sm font-medium mb-2">{name} ({Array.isArray(docs) ? docs.length : 0})</div>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {(docs || []).map((doc, idx) => (
                      <li key={idx} className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 p-4 text-sm break-words">
                        {Object.entries(doc).map(([k, v]) => (
                          <div key={k} className="grid grid-cols-12 gap-2">
                            <div className="col-span-4 text-gray-500">{k}</div>
                            <div className="col-span-8 font-mono">{toText(v)}</div>
                          </div>
                        ))}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="text-sm font-medium text-gray-600 mb-2">{children}</div>;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs mb-1 text-gray-600">{label}</span>
      {children}
    </label>
  );
}

function ProfileEditor({ token, current, onSaved }) {
  const [form, setForm] = useState({
    name: current.name || '',
    age: current.age || '',
    sex: current.sex || '',
    height_cm: current.height_cm || '',
    weight_kg: current.weight_kg || '',
    activity_level: current.activity_level || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      const res = await fetch('http://localhost:4001/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      onSaved?.();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="Nombre"><input className="w-full rounded-xl border px-3 py-2" value={form.name} onChange={(e)=>update('name', e.target.value)} /></Field>
      <Field label="Edad"><input className="w-full rounded-xl border px-3 py-2" value={form.age} onChange={(e)=>update('age', e.target.value)} /></Field>
      <Field label="Sexo"><input className="w-full rounded-xl border px-3 py-2" value={form.sex} onChange={(e)=>update('sex', e.target.value)} /></Field>
      <Field label="Altura (cm)"><input className="w-full rounded-xl border px-3 py-2" value={form.height_cm} onChange={(e)=>update('height_cm', e.target.value)} /></Field>
      <Field label="Peso (kg)"><input className="w-full rounded-xl border px-3 py-2" value={form.weight_kg} onChange={(e)=>update('weight_kg', e.target.value)} /></Field>
      <Field label="Actividad"><input className="w-full rounded-xl border px-3 py-2" value={form.activity_level} onChange={(e)=>update('activity_level', e.target.value)} /></Field>
      <div className="sm:col-span-2 flex items-center gap-2 mt-1">
        <button className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>
    </form>
  );
}

function RoutineAssigner({ token, allRoutines, selected, onSaved }) {
  const [sel, setSel] = useState(new Set(selected.map((r) => String(r.id))));
  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:4001/api/user/routines', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ routine_ids: Array.from(sel).map((x) => Number(x)) })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      onSaved?.();
    } finally { setSaving(false); }
  };
  return (
    <div>
      <ul className="grid md:grid-cols-2 gap-3 mb-3">
        {allRoutines.map((r) => (
          <li key={r._id || r.id} className={`rounded-xl border p-4 cursor-pointer ${sel.has(String(r.id)) ? 'border-black dark:border-white' : 'border-gray-200/60 dark:border-gray-800/60'}`} onClick={()=>toggle(String(r.id))}>
            <div className="font-medium">{r.nombre}</div>
            <div className="text-sm text-gray-600">{r.descripcion}</div>
          </li>
        ))}
      </ul>
      <button className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50" disabled={saving} onClick={save}>{saving ? 'Guardando…' : 'Guardar rutinas'}</button>
    </div>
  );
}

function SupplementAssigner({ token, allSupps, selected, onSaved }) {
  const [sel, setSel] = useState(new Set(selected.map((s) => String(s.id))));
  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:4001/api/user/supplements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ supplement_ids: Array.from(sel) })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      onSaved?.();
    } finally { setSaving(false); }
  };
  return (
    <div>
      <ul className="grid md:grid-cols-2 gap-3 mb-3">
        {allSupps.map((s) => (
          <li key={s._id || s.id} className={`rounded-xl border p-4 flex items-start gap-3 cursor-pointer ${sel.has(String(s.id)) ? 'border-black dark:border-white' : 'border-gray-200/60 dark:border-gray-800/60'}`} onClick={()=>toggle(String(s.id))}>
            {s.image_url && <img src={s.image_url} alt={s.name?.es || s.name?.en} className="w-10 h-10 rounded object-cover" />}
            <div>
              <div className="font-medium">{s.name?.es || s.name?.en}</div>
              <div className="text-sm text-gray-600">{s.brand?.es || s.brand?.en}</div>
            </div>
          </li>
        ))}
      </ul>
      <button className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50" disabled={saving} onClick={save}>{saving ? 'Guardando…' : 'Guardar suplementos'}</button>
    </div>
  );
}

function CreateMealsDay({ token, onSaved }) {
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const createDay = async (e) => {
    e.preventDefault();
    if (!date) { setErr('Selecciona una fecha'); return; }
    setSaving(true); setErr(null);
    try {
      const res = await fetch('http://localhost:4001/api/user/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date, meals: [], summary: { energy_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0 } })
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setDate('');
      onSaved?.();
    } catch (e) { setErr(e.message); } finally { setSaving(false); }
  };
  return (
    <form onSubmit={createDay} className="flex items-center gap-2">
      <input type="date" className="rounded-xl border px-3 py-2" value={date} onChange={(e)=>setDate(e.target.value)} />
      <button className="px-3 py-2 rounded-xl bg-black text-white disabled:opacity-50" disabled={saving}>{saving ? 'Creando…' : 'Crear día'}</button>
      {err && <span className="text-sm text-red-600">{err}</span>}
    </form>
  );
}
