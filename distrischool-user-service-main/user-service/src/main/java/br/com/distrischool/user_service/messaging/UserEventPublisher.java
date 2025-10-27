package br.com.distrischool.user_service.messaging;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import static br.com.distrischool.user_service.config.RabbitConfig.EXCHANGE;

@Component
@RequiredArgsConstructor
public class UserEventPublisher {
  private final RabbitTemplate rabbit;

  public void publish(String routingKey, Object payload) {
    rabbit.convertAndSend(EXCHANGE, routingKey, payload);
  }
}
