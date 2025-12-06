package br.com.distrischool.professortecadm.messaging;

import br.com.distrischool.professortecadm.messaging.dto.ProfessorEventDTO;
import br.com.distrischool.professortecadm.model.Professor;
import br.com.distrischool.professortecadm.repository.ProfessorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProfessorEventListener {
    
    private final ProfessorRepository professorRepository;

    @RabbitListener(queues = "#{professorEventsQueue.name}")
    @Transactional
    public void handleProfessorEvent(ProfessorEventDTO event) {
        log.info("Received professor event: type={}, userId={}", event.getType(), event.getUserId());
        
        if ("CREATED".equals(event.getType())) {
            // Check if professor with this userId already exists
            if (professorRepository.findByUserId(event.getUserId()).isPresent()) {
                log.info("Professor with userId={} already exists, skipping creation", event.getUserId());
                return;
            }
            
            // Create professor record
            Professor professor = new Professor();
            professor.setNome(event.getNome());
            professor.setEmail(event.getEmail());
            professor.setUserId(event.getUserId());
            professor.setEspecialidade(event.getEspecialidade());
            professor.setDataContratacao(event.getDataContratacao());
            professor.setTurmaId(event.getTurmaId());
            
            professorRepository.save(professor);
            log.info("Created professor record for user: userId={}, professorId={}", event.getUserId(), professor.getId());
        }
    }
}
