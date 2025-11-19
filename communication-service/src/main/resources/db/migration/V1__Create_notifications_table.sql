-- Create notifications table
CREATE TABLE IF NOT EXISTS communication_schema.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(100) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    read_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user_id ON communication_schema.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON communication_schema.notifications(is_read);
CREATE INDEX idx_notifications_type ON communication_schema.notifications(notification_type);
CREATE INDEX idx_notifications_created_at ON communication_schema.notifications(created_at);
