import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsService } from '../services/notificationsService';
import { FileText, Inbox } from 'lucide-react';
import './NotificationsPage.css';

function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    loadNotifications();
  }, [filter, user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      let data;
      
      if (user?.userId) {
        // If user has an ID, load their notifications
        if (filter === 'unread') {
          data = await notificationsService.getUnreadNotificationsByUser(user.userId);
        } else {
          data = await notificationsService.getNotificationsByUser(user.userId);
        }
      } else {
        // If no user ID, load all notifications (admin view)
        data = await notificationsService.getAllNotifications();
      }
      
      setNotifications(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Erro ao carregar notificações. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsService.markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      alert('Erro ao marcar notificação como lida.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta notificação?')) {
      try {
        await notificationsService.deleteNotification(id);
        loadNotifications();
      } catch (err) {
        console.error('Error deleting notification:', err);
        alert('Erro ao excluir notificação.');
      }
    }
  };

  const getNotificationIcon = (type) => {
    // Removed emoji icons - using CSS classes instead
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading">Carregando notificações...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1><Inbox size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />Notificações</h1>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Não Lidas
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>
              {filter === 'unread' 
                ? 'Você não tem notificações não lidas.' 
                : 'Você não tem notificações.'}
            </p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-card ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.notificationType)}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <span className="notification-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="btn-mark-read"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Marcar como lida
                    </button>
                  )}
                  <button
                    className="btn-delete-notification"
                    onClick={() => handleDelete(notification.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
