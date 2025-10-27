package br.com.distrischool.professortecadm.repository;

import br.com.distrischool.professortecadm.model.TecnicoAdministrativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TecnicoAdministrativoRepository extends JpaRepository<TecnicoAdministrativo, Long> {
    boolean existsByEmail(String email);
}