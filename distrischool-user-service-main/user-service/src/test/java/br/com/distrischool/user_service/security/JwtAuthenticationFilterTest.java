package br.com.distrischool.user_service.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.servlet.ServletException;
import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

class JwtAuthenticationFilterTest {

  @Mock
  private JwtUtil jwtUtil;

  @Mock
  private UserDetailsService userDetailsService;

  private JwtAuthenticationFilter filter;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.openMocks(this);
    SecurityContextHolder.clearContext();
    filter = new JwtAuthenticationFilter(jwtUtil, userDetailsService);
  }

  @Test
  void shouldSkipWhenNoAuthorizationHeader() throws ServletException, IOException {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRequestURI("/users");
    MockHttpServletResponse response = new MockHttpServletResponse();
    MockFilterChain chain = new MockFilterChain();

    filter.doFilter(request, response, chain);

    assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    verify(jwtUtil, never()).isTokenValid(anyString());
  }

  @Test
  void shouldSkipWhenPathIsPublic() throws ServletException, IOException {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRequestURI("/auth/token");
    request.addHeader("Authorization", "Bearer any");
    MockHttpServletResponse response = new MockHttpServletResponse();
    MockFilterChain chain = new MockFilterChain();

    filter.doFilter(request, response, chain);

    assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    verify(jwtUtil, never()).isTokenValid(anyString());
  }

  @Test
  void shouldNotAuthenticateWhenTokenInvalid() throws ServletException, IOException {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRequestURI("/users");
    request.addHeader("Authorization", "Bearer invalidtoken");
    MockHttpServletResponse response = new MockHttpServletResponse();
    MockFilterChain chain = new MockFilterChain();

    when(jwtUtil.isTokenValid("invalidtoken")).thenReturn(false);

    filter.doFilter(request, response, chain);

    assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    verify(jwtUtil).isTokenValid("invalidtoken");
    verify(userDetailsService, never()).loadUserByUsername(anyString());
  }

  @Test
  void shouldAuthenticateWhenTokenValid() throws ServletException, IOException {
    String token = "validtoken";
    String email = "admin@distrischool.com";

    MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRequestURI("/users");
    request.addHeader("Authorization", "Bearer " + token);
    MockHttpServletResponse response = new MockHttpServletResponse();
    MockFilterChain chain = new MockFilterChain();

    UserDetails userDetails = new User(email, "pass", AuthorityUtils.createAuthorityList("ROLE_ADMIN"));

    when(jwtUtil.isTokenValid(token)).thenReturn(true);
    when(jwtUtil.extractEmail(token)).thenReturn(email);
    when(userDetailsService.loadUserByUsername(email)).thenReturn(userDetails);

    filter.doFilter(request, response, chain);

    assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo(email);
    assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
        .extracting("authority")
        .containsExactly("ROLE_ADMIN");
  }
}
