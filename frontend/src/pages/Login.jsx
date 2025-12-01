import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/v1/auth/token', { email, password });
      
      const userData = {
        userId: response.userId,
        email: response.email,
        name: response.name,
        role: response.role,
      };
      
      login(response.token, userData);
      navigate('/');
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Email ou senha inválidos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>DistriSchool</h1>
        <h2>Entrar no Sistema</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              placeholder="seu.email@exemplo.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
              placeholder="Digite sua senha"
            />
          </div>
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="default-credentials">
          <p>Credenciais de teste:</p>
          <p><strong>Admin:</strong> admin@distrischool.com</p>
          <p><strong>Senha:</strong> admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
