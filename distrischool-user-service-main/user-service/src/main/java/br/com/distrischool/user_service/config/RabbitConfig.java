package br.com.distrischool.user_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE = "distrischool.events.exchange";
    public static final String PROFESSOR_EVENTS_QUEUE = "professor-service.professor-events";
    public static final String ALUNO_EVENTS_QUEUE = "aluno-service.aluno-events";
    public static final String TECNICOADMIN_EVENTS_QUEUE = "tecnicoadmin-service.tecnicoadmin-events";
    public static final String PROFESSOR_ROUTING_KEY = "professor.*";
    public static final String ALUNO_ROUTING_KEY = "aluno.*";
    public static final String TECNICOADMIN_ROUTING_KEY = "tecnicoadmin.*";

    @Bean
    public TopicExchange distrischoolExchange() {
        return ExchangeBuilder.topicExchange(EXCHANGE).durable(true).build();
    }

    @Bean
    public Queue professorEventsQueue() {
        return QueueBuilder.durable(PROFESSOR_EVENTS_QUEUE).build();
    }

    @Bean
    public Queue alunoEventsQueue() {
        return QueueBuilder.durable(ALUNO_EVENTS_QUEUE).build();
    }

    @Bean
    public Queue tecnicoAdminEventsQueue() {
        return QueueBuilder.durable(TECNICOADMIN_EVENTS_QUEUE).build();
    }

    @Bean
    public Binding professorEventsBinding(Queue professorEventsQueue, TopicExchange distrischoolExchange) {
        return BindingBuilder.bind(professorEventsQueue).to(distrischoolExchange).with(PROFESSOR_ROUTING_KEY);
    }

    @Bean
    public Binding alunoEventsBinding(Queue alunoEventsQueue, TopicExchange distrischoolExchange) {
        return BindingBuilder.bind(alunoEventsQueue).to(distrischoolExchange).with(ALUNO_ROUTING_KEY);
    }

    @Bean
    public Binding tecnicoAdminEventsBinding(Queue tecnicoAdminEventsQueue, TopicExchange distrischoolExchange) {
        return BindingBuilder.bind(tecnicoAdminEventsQueue).to(distrischoolExchange).with(TECNICOADMIN_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter);
        return rabbitTemplate;
    }
}
