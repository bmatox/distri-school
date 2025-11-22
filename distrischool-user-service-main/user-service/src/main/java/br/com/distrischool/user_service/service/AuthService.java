package br.com.distrischool.user_service.service;

import br.com.distrischool.user_service.domain.User;
import br.com.distrischool.user_service.dto.LoginRequest;
import br.com.distrischool.user_service.dto.LoginResponse;
import br.com.distrischool.user_service.repository.UserRepository;
import br.com.distrischool.user_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtil jwtUtil;

  @Transactional(readOnly = true)
  public LoginResponse authenticate(LoginRequest request) {
    log.info("Authentication attempt for email: {}", request.email());
    
    User user = userRepository.findByEmail(request.email())
        .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      log.warn("Failed authentication attempt for email: {}", request.email());
      throw new BadCredentialsException("Invalid email or password");
    }

    String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    
    log.info("Successful authentication for user: {} with role: {}", user.getEmail(), user.getRole());
    
    return new LoginResponse(
        token,
        user.getId(),
        user.getEmail(),
        user.getName(),
        user.getRole().name()
    );
  }
}
