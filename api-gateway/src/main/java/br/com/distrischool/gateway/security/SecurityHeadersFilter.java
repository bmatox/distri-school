package br.com.distrischool.gateway.security;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global filter that adds security headers to all HTTP responses.
 * These headers help protect against common web vulnerabilities.
 */
@Component
public class SecurityHeadersFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            var headers = exchange.getResponse().getHeaders();
            
            // Prevent MIME type sniffing
            headers.addIfAbsent("X-Content-Type-Options", "nosniff");
            
            // Prevent clickjacking attacks
            headers.addIfAbsent("X-Frame-Options", "DENY");
            
            // Enable browser XSS filtering
            headers.addIfAbsent("X-XSS-Protection", "1; mode=block");
            
            // Force HTTPS connections (Strict Transport Security)
            headers.addIfAbsent("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
            
            // Content Security Policy - restrict resources to same origin
            headers.addIfAbsent("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:");
            
            // Prevent referrer leakage
            headers.addIfAbsent("Referrer-Policy", "strict-origin-when-cross-origin");
            
            // Control browser features
            headers.addIfAbsent("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
        }));
    }

    @Override
    public int getOrder() {
        // Execute after other filters but before response is sent
        return Ordered.LOWEST_PRECEDENCE - 1;
    }
}
