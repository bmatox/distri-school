package br.com.distrischool.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsGlobalConfig {

  @Bean
  public CorsWebFilter corsWebFilter(
      @Value("${app.cors.allowed-origins}") String allowedOrigins,
      @Value("${app.cors.allowed-methods}") String allowedMethods,
      @Value("${app.cors.allowed-headers}") String allowedHeaders,
      @Value("${app.cors.allow-credentials}") boolean allowCredentials
  ) {
    CorsConfiguration config = new CorsConfiguration();
    
    // Handle allowed origins
    for (String o : allowedOrigins.split(",")) {
      if (!o.isBlank()) {
        String origin = o.trim();
        // Use addAllowedOriginPattern for wildcards or when credentials are disabled
        // This is more flexible and handles * correctly
        config.addAllowedOriginPattern(origin);
      }
    }
    
    // Handle allowed methods
    for (String m : allowedMethods.split(",")) {
      if (!m.isBlank()) config.addAllowedMethod(m.trim());
    }
    
    // Handle allowed headers
    if ("*".equals(allowedHeaders.trim())) {
      config.addAllowedHeader("*");
    } else {
      for (String h : allowedHeaders.split(",")) {
        if (!h.isBlank()) config.addAllowedHeader(h.trim());
      }
    }
    
    // Set credentials - note: when true, origins cannot be "*" but must be specific
    config.setAllowCredentials(allowCredentials);
    
    // Enable preflight request caching
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return new CorsWebFilter(source);
  }
}
