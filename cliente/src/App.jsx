import { useEffect, useState } from 'react';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t) setToken(t);
    if (u) setUser(JSON.parse(u));
  }, []);

  const onLogin = (tkn, usr) => {
    localStorage.setItem('token', tkn);
    localStorage.setItem('user', JSON.stringify(usr));
    setToken(tkn);
    setUser(usr);
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        {!token ? (
          <Login onLogin={onLogin} />
        ) : (
          <div>
            <div className="flex justify-end mb-4">
              <button className="px-3 py-1 rounded border" onClick={onLogout}>Cerrar sesión</button>
            </div>
            <Home token={token} user={user} />
          </div>
        )}
      </div>
    </Layout>
  );
}
