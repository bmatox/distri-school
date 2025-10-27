import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <h1 className="nav-title">DistriSchool</h1>
        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/')}>
              🏠 Dashboard
            </Link>
          </li>
          <li>
            <Link to="/professores" className={isActive('/professores')}>
              👨‍🏫 Professores
            </Link>
          </li>
          <li>
            <Link to="/alunos" className={isActive('/alunos')}>
              🎓 Alunos
            </Link>
          </li>
          <li>
            <Link to="/usuarios" className={isActive('/usuarios')}>
              👥 Usuários
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
