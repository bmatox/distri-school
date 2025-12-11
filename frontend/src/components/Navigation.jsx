import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users, UserCheck, GraduationCap, BookOpen, Book, Mail, FileText, BarChart3, Calendar } from 'lucide-react';
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
          { path: '/', label: 'Painel', icon: Home, exact: true },
          { path: '/usuarios', label: 'Usuários', icon: Users },
          { path: '/professores', label: 'Professores', icon: UserCheck },
          { path: '/alunos', label: 'Alunos', icon: GraduationCap },
          { path: '/cursos-turmas', label: 'Cursos e Turmas', icon: BookOpen },
          { path: '/disciplinas', label: 'Disciplinas', icon: Book },
          { path: '/notificacoes', label: 'Notificações', icon: Mail },
        ];
      case 'TEACHER':
        return [
          { path: '/', label: 'Painel', icon: Home, exact: true },
          { path: '/notas', label: 'Lançar Notas', icon: FileText },
          { path: '/notificacoes', label: 'Notificações', icon: Mail },
        ];
      case 'STUDENT':
        return [
          { path: '/', label: 'Painel', icon: Home, exact: true },
          { path: '/notas', label: 'Minhas Notas', icon: FileText },
          { path: '/notificacoes', label: 'Notificações', icon: Mail },
        ];
      case 'TECHNICAL_ADMIN':
        return [
          { path: '/', label: 'Painel', icon: Home, exact: true },
          { path: '/relatorios', label: 'Relatórios', icon: FileText },
          { path: '/recursos', label: 'Recursos', icon: BarChart3 },
          { path: '/agendamentos', label: 'Agendamentos', icon: Calendar },
        ];
      default:
        return [{ path: '/', label: 'Painel', icon: Home, exact: true }];
    }
  };

  const navItems = getNavigationItems();

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <ul className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={item.exact ? (location.pathname === item.path ? 'active' : '') : isActive(item.path)}
                >
                  {Icon && <Icon size={18} style={{marginRight: '8px', display: 'inline'}} />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
