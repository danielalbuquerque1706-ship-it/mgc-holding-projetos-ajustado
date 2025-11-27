import { useState } from 'react';
import { LogIn } from 'lucide-react';
import logo from './assets/logo_mgc_holding_transparent.png';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificar credenciais
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Adicionar usuário administrador padrão se não existir
    if (users.length === 0) {
      users.push({
        username: 'Projetosmgc_2025',
        password: 'Proje@2025',
        isAdmin: true
      });
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      onLogin();
    } else {
      setError('Usuário ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="MGC HOLDING" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-800">Controle de Projetos</h1>
          <p className="text-gray-600 mt-2">MGC HOLDING</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
          >
            <LogIn className="w-5 h-5" />
            <span>Entrar</span>
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Sistema de Gestão de Projetos</p>
          <p className="mt-1">© 2025 MGC HOLDING</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

