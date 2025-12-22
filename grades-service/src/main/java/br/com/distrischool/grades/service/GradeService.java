package br.com.distrischool.grades.service;

import br.com.distrischool.grades.dto.CreateGradeRequest;
import br.com.distrischool.grades.entity.Grade;
import br.com.distrischool.grades.entity.OutboxEvent;
import br.com.distrischool.grades.exception.GradeNotFoundException;
import br.com.distrischool.grades.repository.GradeRepository;
import br.com.distrischool.grades.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GradeService {

    private final GradeRepository gradeRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;
    
    private static final String EXCHANGE_NAME = "distrischool.events.exchange";

    @Transactional
    @CircuitBreaker(name = "default", fallbackMethod = "createGradeFallback")
    @Retry(name = "default")
    public Grade createGrade(CreateGradeRequest request) {
        log.info("Creating grade for student {} by professor {}", request.getStudentId(), request.getProfessorId());
        
        Grade grade = new Grade();
        grade.setStudentId(request.getStudentId());
        grade.setProfessorId(request.getProfessorId());
        grade.setStudentUserId(request.getStudentUserId());
        grade.setProfessorUserId(request.getProfessorUserId());
        grade.setDisciplinaId(request.getDisciplinaId());
        grade.setSubject(request.getSubject());
        grade.setGrade(request.getGrade());
        grade.setEvaluationType(request.getEvaluationType());
        grade.setComments(request.getComments());
        
        // Salva a Grade no banco
        Grade savedGrade = gradeRepository.save(grade);
        
        // Transactional Outbox Pattern: Salva o evento na mesma transação
        try {
            OutboxEvent outboxEvent = new OutboxEvent();
            outboxEvent.setAggregateType("Grade");
            outboxEvent.setAggregateId(savedGrade.getId());
            outboxEvent.setEventType("grade.created");
            outboxEvent.setRoutingKey("grade.created");
            outboxEvent.setPayload(objectMapper.writeValueAsString(savedGrade));
            outboxEvent.setSent(false);
            
            outboxEventRepository.save(outboxEvent);
            log.info("Saved outbox event for grade.created: gradeId={}", savedGrade.getId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize grade for outbox event", e);
            throw new RuntimeException("Failed to create outbox event", e);
        }
        
        return savedGrade;
    }

    public List<Grade> getAllGrades() {
        return gradeRepository.findAll();
    }

    public List<Grade> getGradesByStudentId(Long studentId) {
        return gradeRepository.findByStudentId(studentId);
    }

    public List<Grade> getGradesByProfessorId(Long professorId) {
        return gradeRepository.findByProfessorId(professorId);
    }

    public Grade getGradeById(Long id) {
        return gradeRepository.findById(id)
                .orElseThrow(() -> new GradeNotFoundException(id));
    }

    @Transactional
    public Grade updateGrade(Long id, CreateGradeRequest request) {
        Grade grade = getGradeById(id);
        grade.setSubject(request.getSubject());
        grade.setGrade(request.getGrade());
        grade.setEvaluationType(request.getEvaluationType());
        grade.setComments(request.getComments());
        
        Grade updatedGrade = gradeRepository.save(grade);
        
        // Transactional Outbox Pattern
        try {
            OutboxEvent outboxEvent = new OutboxEvent();
            outboxEvent.setAggregateType("Grade");
            outboxEvent.setAggregateId(updatedGrade.getId());
            outboxEvent.setEventType("grade.updated");
            outboxEvent.setRoutingKey("grade.updated");
            outboxEvent.setPayload(objectMapper.writeValueAsString(updatedGrade));
            outboxEvent.setSent(false);
            
            outboxEventRepository.save(outboxEvent);
            log.info("Saved outbox event for grade.updated: gradeId={}", updatedGrade.getId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize grade for outbox event", e);
            throw new RuntimeException("Failed to create outbox event", e);
        }
        
        return updatedGrade;
    }

    @Transactional
    public void deleteGrade(Long id) {
        Grade grade = getGradeById(id);
        
        // Transactional Outbox Pattern: Salva evento ANTES de deletar
        try {
            OutboxEvent outboxEvent = new OutboxEvent();
            outboxEvent.setAggregateType("Grade");
            outboxEvent.setAggregateId(grade.getId());
            outboxEvent.setEventType("grade.deleted");
            outboxEvent.setRoutingKey("grade.deleted");
            outboxEvent.setPayload(objectMapper.writeValueAsString(grade));
            outboxEvent.setSent(false);
            
            outboxEventRepository.save(outboxEvent);
            log.info("Saved outbox event for grade.deleted: gradeId={}", id);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize grade for outbox event", e);
            throw new RuntimeException("Failed to create outbox event", e);
        }
        
        gradeRepository.delete(grade);
    }

    // Fallback method for Circuit Breaker
    private Grade createGradeFallback(CreateGradeRequest request, Exception e) {
        log.error("Circuit breaker activated - createGrade fallback", e);
        throw new RuntimeException("Service temporarily unavailable. Please try again later.");
    }
}
