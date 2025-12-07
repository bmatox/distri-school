package br.com.distrischool.gateway.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

  private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
  private final JwtUtil jwtUtil;
  private final ObjectMapper objectMapper;

  public JwtAuthenticationFilter(JwtUtil jwtUtil, ObjectMapper objectMapper) {
    this.jwtUtil = jwtUtil;
    this.objectMapper = objectMapper;
  }

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    ServerHttpRequest request = exchange.getRequest();
    String path = request.getPath().value();

    if (isPublicEndpoint(path)) {
      return chain.filter(exchange);
    }

    String authHeader = request.getHeaders().getFirst("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      log.warn("Authentication failed for {}: Missing or invalid Authorization header", path);
      return writeUnauthorizedResponse(exchange, "Missing or invalid Authorization header");
    }

    String token = authHeader.substring(7);


    if (!jwtUtil.isTokenValid(token)) {
      log.warn("Authentication failed for {}: Invalid or expired JWT token", path);
      return writeUnauthorizedResponse(exchange, "Invalid or expired JWT token");
    }

    log.debug("Authentication successful for {}", path);
    return chain.filter(exchange);
  }


  private Mono<Void> writeUnauthorizedResponse(ServerWebExchange exchange, String message) {
    ServerHttpResponse response = exchange.getResponse();
    response.setStatusCode(HttpStatus.UNAUTHORIZED);
    response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

    Map<String, Object> errorBody = new HashMap<>();
    errorBody.put("error", "Unauthorized");
    errorBody.put("message", message);
    errorBody.put("status", 401);

    try {

      byte[] bytes = objectMapper.writeValueAsBytes(errorBody);
      DataBuffer buffer = response.bufferFactory().wrap(bytes);

      return response.writeWith(Mono.just(buffer));
    } catch (JsonProcessingException e) {

      log.error("Failed to serialize error response", e);
      String fallbackJson = "{\"error\":\"Unauthorized\",\"message\":\"Authentication failed\",\"status\":401}";
      DataBuffer buffer = response.bufferFactory()
              .wrap(fallbackJson.getBytes(StandardCharsets.UTF_8));

      return response.writeWith(Mono.just(buffer));
    }
  }

  private boolean isPublicEndpoint(String path) {

    return path.startsWith("/api/v1/auth/") ||
            path.startsWith("/actuator/health") ||
            path.startsWith("/actuator/info");
  }

  @Override
  public int getOrder() {
    return -100;
  }
}