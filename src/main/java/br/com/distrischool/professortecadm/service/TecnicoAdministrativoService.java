package br.com.distrischool.professortecadm.service;

import br.com.distrischool.professortecadm.dto.CreateTecnicoRequest;
import br.com.distrischool.professortecadm.dto.TecnicoAdministrativoResponse;
import br.com.distrischool.professortecadm.dto.UpdateTecnicoRequest;
import br.com.distrischool.professortecadm.exception.EmailAlreadyUsedException;
import br.com.distrischool.professortecadm.exception.ResourceNotFoundException;
import br.com.distrischool.professortecadm.model.TecnicoAdministrativo;
import br.com.distrischool.professortecadm.repository.TecnicoAdministrativoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TecnicoAdministrativoService {

    private final TecnicoAdministrativoRepository repository;

    public TecnicoAdministrativoService(TecnicoAdministrativoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public TecnicoAdministrativoResponse create(CreateTecnicoRequest request) {
        if (repository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException("Email já está em uso: " + request.email());
        }
        TecnicoAdministrativo tecnico = new TecnicoAdministrativo();
        tecnico.setNome(request.nome());
        tecnico.setEmail(request.email());
        tecnico.setCargo(request.cargo());
        tecnico.setDataContratacao(request.dataContratacao());
        return toResponse(repository.save(tecnico));
    }

    @Transactional(readOnly = true)
    public Page<TecnicoAdministrativoResponse> list(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TecnicoAdministrativoResponse getById(Long id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Técnico Administrativo não encontrado: id=" + id));
    }

    @Transactional
    public TecnicoAdministrativoResponse update(Long id, UpdateTecnicoRequest request) {
        TecnicoAdministrativo tecnico = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Técnico Administrativo não encontrado: id=" + id));

        if (!request.email().equalsIgnoreCase(tecnico.getEmail()) && repository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException("Email já está em uso: " + request.email());
        }
        tecnico.setNome(request.nome());
        tecnico.setEmail(request.email());
        tecnico.setCargo(request.cargo());
        tecnico.setDataContratacao(request.dataContratacao());
        return toResponse(repository.save(tecnico));
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Técnico Administrativo não encontrado: id=" + id);
        }
        repository.deleteById(id);
    }

    private TecnicoAdministrativoResponse toResponse(TecnicoAdministrativo tecnico) {
        return new TecnicoAdministrativoResponse(
                tecnico.getId(),
                tecnico.getNome(),
                tecnico.getEmail(),
                tecnico.getCargo(),
                tecnico.getDataContratacao()
        );
    }
}