package br.com.distrischool.user_service.config;

import br.com.distrischool.user_service.controller.AuthController;
import br.com.distrischool.user_service.controller.UserController;
import br.com.distrischool.user_service.dto.LoginRequest;
import br.com.distrischool.user_service.dto.LoginResponse;
import br.com.distrischool.user_service.security.JwtAuthenticationFilter;
import br.com.distrischool.user_service.service.AuthService;
import br.com.distrischool.user_service.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {AuthController.class, UserController.class})
@Import(SecurityConfig.class)
class SecurityConfigTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @MockBean
  private AuthService authService;

  @MockBean
  private UserService userService;

  @MockBean
  private UserDetailsService userDetailsService;

  @MockBean
  private JwtAuthenticationFilter jwtAuthenticationFilter;

  @Test
  @DisplayName("Login endpoint deve ser público")
  void loginEndpointShouldBePublic() throws Exception {
    when(authService.authenticate(any(LoginRequest.class)))
        .thenReturn(new LoginResponse("token", 1L, "admin@distrischool.com", "Admin", "ADMIN"));

    mockMvc.perform(post("/auth/token")
            .with(csrf())
            .contentType("application/json")
            .content(objectMapper.writeValueAsString(new LoginRequest("admin@distrischool.com", "pass"))))
        .andExpect(status().isOk());
  }

  @Test
  @DisplayName("/users sem credenciais deve responder 401 ou 200 (depende do filtro JWT)")
  void usersEndpointWithoutAuthHeaders() throws Exception {
    // Sem Authorization header, o JwtAuthenticationFilter deixa passar para o chain
    // e como não há token, a autenticação é anônima, mas a config permite
    mockMvc.perform(get("/users"))
        .andExpect(status().isOk());
  }

  @Test
  @WithMockUser
  @DisplayName("/users com usuário autenticado deve responder 200")
  void usersEndpointWithAuth() throws Exception {
    mockMvc.perform(get("/users"))
        .andExpect(status().isOk());
  }
}
