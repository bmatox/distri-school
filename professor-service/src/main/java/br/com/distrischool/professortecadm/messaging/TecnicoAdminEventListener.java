package br.com.distrischool.professortecadm.messaging;

import br.com.distrischool.professortecadm.messaging.dto.TecnicoAdminEventDTO;
import br.com.distrischool.professortecadm.model.TecnicoAdministrativo;
import br.com.distrischool.professortecadm.repository.TecnicoAdministrativoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class TecnicoAdminEventListener {
    
    private final TecnicoAdministrativoRepository tecnicoRepository;

    @RabbitListener(queues = "#{tecnicoAdminEventsQueue.name}")
    @Transactional
    public void handleTecnicoAdminEvent(TecnicoAdminEventDTO event) {
        log.info("Received tecnico admin event: type={}, userId={}", event.getType(), event.getUserId());
        
        if ("CREATED".equals(event.getType())) {
            // Check if tecnico with this userId already exists
            if (tecnicoRepository.findByUserId(event.getUserId()).isPresent()) {
                log.info("TecnicoAdministrativo with userId={} already exists, skipping creation", event.getUserId());
                return;
            }
            
            // Create tecnico administrativo record
            // Note: departamento from event is mapped to cargo in TecnicoAdministrativo model
            // dataAdmissao from event is mapped to dataContratacao field
            TecnicoAdministrativo tecnico = new TecnicoAdministrativo();
            tecnico.setNome(event.getNome());
            tecnico.setEmail(event.getEmail());
            tecnico.setUserId(event.getUserId());
            tecnico.setCargo(event.getDepartamento()); // departamento -> cargo mapping
            tecnico.setDataContratacao(event.getDataAdmissao()); // dataAdmissao -> dataContratacao mapping
            
            tecnicoRepository.save(tecnico);
            log.info("Created tecnico administrativo record for user: userId={}, tecnicoId={}", event.getUserId(), tecnico.getId());
        }
    }
}
