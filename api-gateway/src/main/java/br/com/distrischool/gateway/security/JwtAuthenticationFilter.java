package br.com.distrischool.gateway.security;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

  private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
  private final JwtUtil jwtUtil;

  public JwtAuthenticationFilter(JwtUtil jwtUtil) {
    this.jwtUtil = jwtUtil;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    ServerHttpRequest request = exchange.getRequest();
    String path = request.getPath().value();

    // Allow public endpoints
    if (isPublicEndpoint(path)) {
      return chain.filter(exchange);
    }

    // Extract JWT token from Authorization header
    String authHeader = request.getHeaders().getFirst("Authorization");
    
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      log.warn("Authentication failed for {}: Missing or invalid Authorization header", path);
      exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
      return exchange.getResponse().setComplete();
    }

    String token = authHeader.substring(7);

    // Validate token
    if (!jwtUtil.isTokenValid(token)) {
      log.warn("Authentication failed for {}: Invalid or expired JWT token", path);
      exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
      return exchange.getResponse().setComplete();
    }

    // Token is valid, continue with the request
    log.debug("Authentication successful for {}", path);
    return chain.filter(exchange);
  }

  private boolean isPublicEndpoint(String path) {
    // Public endpoints that don't require authentication
    return path.startsWith("/api/v1/auth/") ||
           path.startsWith("/actuator/health") ||
           path.startsWith("/actuator/info");
  }

  @Override
  public int getOrder() {
    return -100; // Execute before other filters
  }
}
