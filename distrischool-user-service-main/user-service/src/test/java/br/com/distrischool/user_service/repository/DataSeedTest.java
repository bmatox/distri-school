package br.com.distrischool.user_service.repository;

import br.com.distrischool.user_service.domain.Role;
import br.com.distrischool.user_service.domain.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class DataSeedTest {

  @Autowired
  private UserRepository userRepository;

  @Test
  @DisplayName("data.sql deve inserir admin padrão")
  void shouldSeedAdminUser() {
    Optional<User> admin = userRepository.findByEmail("admin@distrischool.com");
    assertTrue(admin.isPresent(), "Admin user must exist from seed");
    assertEquals(Role.ADMIN, admin.get().getRole());
    assertNotNull(admin.get().getPasswordHash());
    assertFalse(admin.get().getPasswordHash().isBlank());
  }
}
