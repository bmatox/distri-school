-- Create processed_messages table for idempotency protection in aluno-service
CREATE TABLE IF NOT EXISTS aluno_schema.processed_messages (
    id BIGSERIAL PRIMARY KEY,
    message_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    aggregate_id BIGINT,
    processed_at TIMESTAMP NOT NULL,
    consumer_name VARCHAR(255) NOT NULL
);

-- Create indexes
CREATE UNIQUE INDEX idx_processed_messages_message_id ON aluno_schema.processed_messages(message_id);
CREATE INDEX idx_processed_messages_processed_at ON aluno_schema.processed_messages(processed_at);

COMMENT ON TABLE aluno_schema.processed_messages IS 'Idempotency table - previne processamento duplicado de mensagens RabbitMQ';
COMMENT ON COLUMN aluno_schema.processed_messages.message_id IS 'ID único da mensagem RabbitMQ (MessageProperties.messageId ou hash do payload)';
COMMENT ON COLUMN aluno_schema.processed_messages.consumer_name IS 'Nome do listener que processou a mensagem';
