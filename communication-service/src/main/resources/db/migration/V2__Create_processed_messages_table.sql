-- Create processed_messages table for idempotency protection
CREATE TABLE IF NOT EXISTS communication_schema.processed_messages (
    id BIGSERIAL PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    aggregate_id BIGINT,
    processed_at TIMESTAMP NOT NULL,
    consumer_name VARCHAR(255) NOT NULL
);

-- Create indexes
CREATE UNIQUE INDEX idx_processed_messages_message_id ON communication_schema.processed_messages(message_id);
CREATE INDEX idx_processed_messages_processed_at ON communication_schema.processed_messages(processed_at);

COMMENT ON TABLE communication_schema.processed_messages IS 'Idempotency table - previne processamento duplicado de mensagens RabbitMQ';
COMMENT ON COLUMN communication_schema.processed_messages.message_id IS 'ID único da mensagem RabbitMQ (MessageProperties.messageId)';
COMMENT ON COLUMN communication_schema.processed_messages.consumer_name IS 'Nome do listener que processou a mensagem';
