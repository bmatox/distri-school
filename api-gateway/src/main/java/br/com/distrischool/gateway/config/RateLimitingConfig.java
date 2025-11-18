package br.com.distrischool.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Mono;

/**
 * Rate limiting configuration for the API Gateway.
 * Uses client IP address as the key for rate limiting.
 */
@Configuration
public class RateLimitingConfig {

    /**
     * Key resolver that uses the client's real IP address for rate limiting.
     * Supports clients behind proxies by checking X-Forwarded-For and X-Real-IP headers.
     * Each unique IP has its own rate limit bucket.
     */
    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            // Try to get real client IP from headers (for clients behind proxies)
            String forwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isEmpty()) {
                // X-Forwarded-For can contain multiple IPs, take the first one (original client)
                String clientIp = forwardedFor.split(",")[0].trim();
                // Basic validation: ensure it looks like an IP address
                if (isValidIp(clientIp)) {
                    return Mono.just(clientIp);
                }
            }
            
            String realIp = exchange.getRequest().getHeaders().getFirst("X-Real-IP");
            if (realIp != null && !realIp.isEmpty() && isValidIp(realIp.trim())) {
                return Mono.just(realIp.trim());
            }
            
            // Fall back to remote address
            String clientIp = exchange.getRequest().getRemoteAddress() != null
                    ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                    : "unknown";
            return Mono.just(clientIp);
        };
    }
    
    /**
     * Basic IP address validation to prevent IP spoofing attacks.
     * Accepts both IPv4 and IPv6 addresses.
     */
    private boolean isValidIp(String ip) {
        if (ip == null || ip.isEmpty() || ip.length() > 45) {
            return false;
        }
        // Basic check: only allow alphanumeric, dots, colons (for IPv6), and nothing else
        return ip.matches("^[a-fA-F0-9.:]+$");
    }
}
