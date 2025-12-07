import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_PROJECT } from '../graphql/mutations.js';

export default function Dashboard() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createProject, { data, loading, error }] = useMutation(CREATE_PROJECT);

  const submit = async (e) => {
    e.preventDefault();
    await createProject({ variables: { name, description } });
    setName('');
    setDescription('');
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Crear Proyecto</h2>
      <form onSubmit={submit} className="space-y-2 max-w-md">
        <input className="w-full border p-2 rounded" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
        <textarea className="w-full border p-2 rounded" placeholder="Descripción" value={description} onChange={e=>setDescription(e.target.value)} />
        <button className="px-3 py-1 rounded bg-blue-600 text-white" disabled={loading}>
          {loading ? 'Creando...' : 'Crear'}
        </button>
      </form>
      {error && <p className="text-red-600 mt-2">{error.message}</p>}
      {data && <p className="text-green-700 mt-2">Creado: {data.createProject.name}</p>}
    </div>
  );
}
