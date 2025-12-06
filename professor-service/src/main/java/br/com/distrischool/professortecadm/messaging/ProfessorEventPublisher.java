package br.com.distrischool.professortecadm.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import static br.com.distrischool.professortecadm.config.RabbitConfig.EXCHANGE;

@Component
@RequiredArgsConstructor
public class ProfessorEventPublisher {
    private final RabbitTemplate rabbitTemplate;

    public void publish(String routingKey, Object payload) {
        rabbitTemplate.convertAndSend(EXCHANGE, routingKey, payload);
    }
}
