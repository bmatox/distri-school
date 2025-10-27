package com.example.DistriSchool.service;

import com.example.DistriSchool.config.RabbitMQConfig;
import com.example.DistriSchool.domain.Aluno;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class AlunoProducer {
    private static final String EXCHANGE_NAME = RabbitMQConfig.EXCHANGE;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void sendMessage(Aluno aluno){
        String routingKey = "aluno.created";

        try {
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, routingKey, aluno);
            System.out.println("Evento criado para o rabbitMQ: aluno criado: " + aluno.getId());
        } catch (AmqpException e) {
            System.err.println("CRITICAL: falha ao enviar evento RabbitMQ. Mensagem Perdida: " + e.getMessage());
        }

        System.out.println("Evento enviado para o RabbitMQ: aluno criado: " + aluno.getId());
    }
}
