package com.example.DistriSchool.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.userdetails.UserDetailsService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/actuator/health", "/actuator/prometheus", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.DELETE, "/alunos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/alunos/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/alunos/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/alunos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/alunos").permitAll()
                        .anyRequest().authenticated()
                )
                    .userDetailsService(userDetailsService)
                .httpBasic(org.springframework.security.config.Customizer.withDefaults());
        return http.build();
    }
}
