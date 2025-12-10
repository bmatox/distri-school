package com.example.DistriSchool.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("SecurityConfig Tests")
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @DisplayName("Should allow anonymous access to /actuator/health without 401")
    void shouldAllowAnonymousAccessToActuatorHealth() throws Exception {
        // Health endpoint should be accessible (status 200 or 503, but NOT 401 unauthorized)
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().is(not(401)));
    }

    @Test
    @DisplayName("Should allow anonymous access to /actuator/prometheus without 401")
    void shouldAllowAnonymousAccessToActuatorPrometheus() throws Exception {
        // Prometheus endpoint should be accessible (status 200 or 404, but NOT 401 unauthorized)
        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().is(not(401)));
    }

    @Test
    @DisplayName("Should allow anonymous access to /actuator/info without 401")
    void shouldAllowAnonymousAccessToActuatorInfo() throws Exception {
        // Info endpoint should be accessible (status 200 or 404, but NOT 401 unauthorized)
        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().is(not(401)));
    }
}
