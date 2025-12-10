package br.com.distrischool.user_service.security;

import br.com.distrischool.user_service.domain.User;
import br.com.distrischool.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DatabaseUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = userRepository.findByEmail(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

    return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
      .password(user.getPasswordHash())
      .roles(user.getRole().name())
      .build();
  }
}
