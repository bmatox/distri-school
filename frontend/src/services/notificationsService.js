import { api } from './api';

/**
 * Service for interacting with the Notifications API
 */
export const notificationsService = {
  /**
   * Get all notifications
   */
  async getAllNotifications() {
    return api.get('/notifications');
  },

  /**
   * Get notification by ID
   */
  async getNotificationById(id) {
    return api.get(`/notifications/${id}`);
  },

  /**
   * Get notifications by user ID
   */
  async getNotificationsByUser(userId) {
    return api.get(`/notifications/user/${userId}`);
  },

  /**
   * Get unread notifications by user ID
   */
  async getUnreadNotificationsByUser(userId) {
    return api.get(`/notifications/user/${userId}/unread`);
  },

  /**
   * Create a new notification
   */
  async createNotification(notificationData) {
    return api.post('/notifications', notificationData);
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id) {
    return api.put(`/notifications/${id}/read`);
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id) {
    return api.delete(`/notifications/${id}`);
  }
};
