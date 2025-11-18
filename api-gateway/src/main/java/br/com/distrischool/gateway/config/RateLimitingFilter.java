package br.com.distrischool.gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global rate limiting filter that applies rate limiting to all incoming requests.
 * Uses the InMemoryRateLimiter to track and limit requests per client IP.
 */
@Component
public class RateLimitingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);
    private static final String DEFAULT_ROUTE_ID = "default";
    
    private final InMemoryRateLimiter rateLimiter;
    private final KeyResolver keyResolver;

    public RateLimitingFilter(InMemoryRateLimiter rateLimiter, KeyResolver keyResolver) {
        this.rateLimiter = rateLimiter;
        this.keyResolver = keyResolver;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        
        // Skip rate limiting for health check endpoints
        if (isExcludedPath(path)) {
            return chain.filter(exchange);
        }
        
        return keyResolver.resolve(exchange)
                .flatMap(key -> rateLimiter.isAllowed(DEFAULT_ROUTE_ID, key))
                .flatMap(response -> {
                    // Add rate limit headers to response
                    response.getHeaders().forEach((headerName, headerValue) -> 
                        exchange.getResponse().getHeaders().add(headerName, headerValue)
                    );
                    
                    if (response.isAllowed()) {
                        return chain.filter(exchange);
                    } else {
                        log.warn("Rate limit exceeded for path: {}", path);
                        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                        exchange.getResponse().getHeaders().add("Retry-After", "1");
                        return exchange.getResponse().setComplete();
                    }
                });
    }

    private boolean isExcludedPath(String path) {
        return path.startsWith("/actuator/health") || 
               path.startsWith("/actuator/info") ||
               path.startsWith("/actuator/prometheus");
    }

    @Override
    public int getOrder() {
        // Execute before JWT filter
        return -200;
    }
}
