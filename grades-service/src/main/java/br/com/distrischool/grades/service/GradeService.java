package br.com.distrischool.grades.service;

import br.com.distrischool.grades.dto.CreateGradeRequest;
import br.com.distrischool.grades.entity.Grade;
import br.com.distrischool.grades.exception.GradeNotFoundException;
import br.com.distrischool.grades.repository.GradeRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GradeService {

    private final GradeRepository gradeRepository;
    private final RabbitTemplate rabbitTemplate;
    
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
        
        Grade savedGrade = gradeRepository.save(grade);
        
        // Publish event to RabbitMQ
        try {
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, "grade.created", savedGrade);
            log.info("Published grade.created event for grade ID: {}", savedGrade.getId());
        } catch (Exception e) {
            log.error("Failed to publish grade.created event", e);
            // Don't fail the transaction if event publishing fails
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
        
        // Publish event
        try {
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, "grade.updated", updatedGrade);
            log.info("Published grade.updated event for grade ID: {}", updatedGrade.getId());
        } catch (Exception e) {
            log.error("Failed to publish grade.updated event", e);
        }
        
        return updatedGrade;
    }

    @Transactional
    public void deleteGrade(Long id) {
        Grade grade = getGradeById(id);
        gradeRepository.delete(grade);
        
        // Publish event
        try {
            rabbitTemplate.convertAndSend(EXCHANGE_NAME, "grade.deleted", grade);
            log.info("Published grade.deleted event for grade ID: {}", id);
        } catch (Exception e) {
            log.error("Failed to publish grade.deleted event", e);
        }
    }

    // Fallback method for Circuit Breaker
    private Grade createGradeFallback(CreateGradeRequest request, Exception e) {
        log.error("Circuit breaker activated - createGrade fallback", e);
        throw new RuntimeException("Service temporarily unavailable. Please try again later.");
    }
}
