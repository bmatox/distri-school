package com.example.DistriSchool.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String EXCHANGE = "distrischool.events.exchange";
    public static final String ALUNO_EVENTS_QUEUE = "aluno-service.aluno-events";
    public static final String ALUNO_ROUTING_KEY = "aluno.*";

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public Exchange distrischoolExchange(){
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue alunoEventsQueue() {
        return QueueBuilder.durable(ALUNO_EVENTS_QUEUE).build();
    }

    @Bean
    public Binding alunoEventsBinding(Queue alunoEventsQueue, TopicExchange distrischoolExchange) {
        return BindingBuilder.bind(alunoEventsQueue).to((TopicExchange) distrischoolExchange).with(ALUNO_ROUTING_KEY);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter);
        return rabbitTemplate;
    }
}
