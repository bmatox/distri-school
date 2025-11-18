package br.com.distrischool.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.AbstractRateLimiter;
import org.springframework.cloud.gateway.filter.ratelimit.RateLimiter;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory rate limiter implementation using the token bucket algorithm.
 * This implementation does not require Redis and is suitable for single-instance deployments.
 * For distributed deployments, use Redis-based rate limiting.
 */
@Component
public class InMemoryRateLimiter extends AbstractRateLimiter<InMemoryRateLimiter.Config> {

    private static final String CONFIGURATION_PROPERTY_NAME = "in-memory-rate-limiter";
    
    // Default: 20 requests per second, burst of 40
    private static final int DEFAULT_REPLENISH_RATE = 20;
    private static final int DEFAULT_BURST_CAPACITY = 40;
    private static final int DEFAULT_REQUESTED_TOKENS = 1;
    
    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    public InMemoryRateLimiter() {
        super(Config.class, CONFIGURATION_PROPERTY_NAME, null);
    }

    @Override
    public Mono<Response> isAllowed(String routeId, String id) {
        Config config = getConfig().getOrDefault(routeId, new Config());
        
        int replenishRate = config.getReplenishRate() > 0 ? config.getReplenishRate() : DEFAULT_REPLENISH_RATE;
        int burstCapacity = config.getBurstCapacity() > 0 ? config.getBurstCapacity() : DEFAULT_BURST_CAPACITY;
        int requestedTokens = config.getRequestedTokens() > 0 ? config.getRequestedTokens() : DEFAULT_REQUESTED_TOKENS;
        
        String key = routeId + ":" + id;
        TokenBucket bucket = buckets.computeIfAbsent(key, k -> new TokenBucket(burstCapacity, replenishRate));
        
        boolean allowed = bucket.tryConsume(requestedTokens);
        long tokensRemaining = bucket.getTokensRemaining();
        
        Map<String, String> headers = Map.of(
            "X-RateLimit-Remaining", String.valueOf(tokensRemaining),
            "X-RateLimit-Limit", String.valueOf(burstCapacity),
            "X-RateLimit-Burst-Capacity", String.valueOf(burstCapacity),
            "X-RateLimit-Replenish-Rate", String.valueOf(replenishRate)
        );
        
        return Mono.just(new Response(allowed, headers));
    }
    
    @Override
    public Map<String, Config> getConfig() {
        return Collections.emptyMap();
    }

    /**
     * Token bucket implementation for rate limiting.
     */
    private static class TokenBucket {
        private final int capacity;
        private final int refillRate; // tokens per second
        private final AtomicLong tokens;
        private volatile long lastRefillTimestamp;
        
        public TokenBucket(int capacity, int refillRate) {
            this.capacity = capacity;
            this.refillRate = refillRate;
            this.tokens = new AtomicLong(capacity);
            this.lastRefillTimestamp = Instant.now().toEpochMilli();
        }
        
        public synchronized boolean tryConsume(int tokensToConsume) {
            refill();
            if (tokens.get() >= tokensToConsume) {
                tokens.addAndGet(-tokensToConsume);
                return true;
            }
            return false;
        }
        
        public long getTokensRemaining() {
            refill();
            return tokens.get();
        }
        
        private synchronized void refill() {
            long now = Instant.now().toEpochMilli();
            long elapsedMs = now - lastRefillTimestamp;
            
            if (elapsedMs > 0) {
                long tokensToAdd = (elapsedMs * refillRate) / 1000;
                if (tokensToAdd > 0) {
                    long newTokens = Math.min(capacity, tokens.get() + tokensToAdd);
                    tokens.set(newTokens);
                    lastRefillTimestamp = now;
                }
            }
        }
    }

    /**
     * Configuration class for the rate limiter.
     */
    public static class Config {
        private int replenishRate = DEFAULT_REPLENISH_RATE;
        private int burstCapacity = DEFAULT_BURST_CAPACITY;
        private int requestedTokens = DEFAULT_REQUESTED_TOKENS;

        public int getReplenishRate() {
            return replenishRate;
        }

        public Config setReplenishRate(int replenishRate) {
            this.replenishRate = replenishRate;
            return this;
        }

        public int getBurstCapacity() {
            return burstCapacity;
        }

        public Config setBurstCapacity(int burstCapacity) {
            this.burstCapacity = burstCapacity;
            return this;
        }

        public int getRequestedTokens() {
            return requestedTokens;
        }

        public Config setRequestedTokens(int requestedTokens) {
            this.requestedTokens = requestedTokens;
            return this;
        }
    }
}
