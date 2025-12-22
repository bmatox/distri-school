-- Create outbox_events table for Transactional Outbox Pattern
CREATE TABLE IF NOT EXISTS grades_schema.outbox_events (
    id BIGSERIAL PRIMARY KEY,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    routing_key VARCHAR(255) NOT NULL,
    sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT
);

-- Create indexes for efficient polling
CREATE INDEX idx_outbox_events_sent ON grades_schema.outbox_events(sent) WHERE sent = FALSE;
CREATE INDEX idx_outbox_events_created_at ON grades_schema.outbox_events(created_at);
CREATE INDEX idx_outbox_events_aggregate ON grades_schema.outbox_events(aggregate_type, aggregate_id);

COMMENT ON TABLE grades_schema.outbox_events IS 'Transactional Outbox Pattern - armazena eventos para publicação garantida no RabbitMQ';
COMMENT ON COLUMN grades_schema.outbox_events.sent IS 'Flag que indica se o evento foi enviado com sucesso ao RabbitMQ';
COMMENT ON COLUMN grades_schema.outbox_events.retry_count IS 'Número de tentativas de envio (proteção contra loops infinitos)';
