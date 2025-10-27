package br.com.distrischool.user_service.repository;

import br.com.distrischool.user_service.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  boolean existsByEmail(String email);
  Optional<User> findByEmail(String email);
}
