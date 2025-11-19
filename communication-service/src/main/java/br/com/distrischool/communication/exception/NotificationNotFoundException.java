package br.com.distrischool.communication.exception;

public class NotificationNotFoundException extends RuntimeException {
    public NotificationNotFoundException(String message) {
        super(message);
    }
    
    public NotificationNotFoundException(Long id) {
        super("Notification not found with id: " + id);
    }
}
