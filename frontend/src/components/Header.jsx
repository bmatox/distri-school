import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationsService } from '../services/notificationsService';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.id) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      if (user && user.id) {
        const unreadNotifications = await notificationsService.getUnreadNotificationsByUser(user.id);
        setUnreadCount(unreadNotifications ? unreadNotifications.length : 0);
      }
    } catch (err) {
      console.error('Error loading unread notifications count:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationsClick = () => {
    navigate('/notificacoes');
  };

  const getRoleName = (role) => {
    const roleNames = {
      ADMIN: 'Administrador',
      TEACHER: 'Professor',
      STUDENT: 'Aluno',
      TECHNICAL_ADMIN: 'Técnico Administrativo',
    };
    return roleNames[role] || role;
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <div className="brand-icon">🎓</div>
          <div className="brand-text">
            <h1>DistriSchool</h1>
            <p>Sistema de Gestão Escolar</p>
          </div>
        </div>
        <div className="header-actions">
          {user && (
            <>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{getRoleName(user.role)}</span>
              </div>
              <button 
                className="header-btn notification-btn" 
                onClick={handleNotificationsClick}
                title="Notificações"
              >
                <span className="notification-icon">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              <button className="header-btn logout-btn" onClick={handleLogout}>
                <span>🚪</span> Sair
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
