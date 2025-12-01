import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'ADMIN':
        return [
          { path: '/', label: '🏠 Painel', exact: true },
          { path: '/usuarios', label: '👥 Usuários' },
          { path: '/professores', label: '👨‍🏫 Professores' },
          { path: '/alunos', label: '🎓 Alunos' },
          { path: '/cursos-turmas', label: '📚 Cursos e Turmas' },
          { path: '/disciplinas', label: '📖 Disciplinas' },
          { path: '/notificacoes', label: '📬 Notificações' },
        ];
      case 'TEACHER':
        return [
          { path: '/', label: '🏠 Painel', exact: true },
          { path: '/notas', label: '📝 Lançar Notas' },
          { path: '/notificacoes', label: '📬 Notificações' },
        ];
      case 'STUDENT':
        return [
          { path: '/', label: '🏠 Painel', exact: true },
          { path: '/notas', label: '📝 Minhas Notas' },
          { path: '/notificacoes', label: '📬 Notificações' },
        ];
      case 'TECHNICAL_ADMIN':
        return [
          { path: '/', label: '🏠 Painel', exact: true },
          { path: '/relatorios', label: '📋 Relatórios' },
          { path: '/recursos', label: '📊 Recursos' },
          { path: '/agendamentos', label: '📅 Agendamentos' },
        ];
      default:
        return [{ path: '/', label: '🏠 Painel', exact: true }];
    }
  };

  const navItems = getNavigationItems();

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={item.exact ? (location.pathname === item.path ? 'active' : '') : isActive(item.path)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
