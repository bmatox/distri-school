package br.com.distrischool.user_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;
  private final UserDetailsService userDetailsService;

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    return path.startsWith("/auth/") || path.startsWith("/actuator/");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
    String path = request.getRequestURI();
    String authHeader = request.getHeader("Authorization");

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      log.debug("JWT filter skip for {}: missing/invalid Authorization header: {}", path, authHeader);
      filterChain.doFilter(request, response);
      return;
    }

    String token = authHeader.substring(7);

    try {
      log.debug("JWT filter processing for {}: raw token length {}", path, token.length());

      if (!jwtUtil.isTokenValid(token)) {
        log.error("JWT invalid or expired for {}: token begins with {}", path, token.substring(0, Math.min(10, token.length())));
        filterChain.doFilter(request, response);
        return;
      }

      String email = jwtUtil.extractEmail(token);
      if (email == null || email.isBlank()) {
        log.error("JWT missing subject/email for {}", path);
        filterChain.doFilter(request, response);
        return;
      }

      if (SecurityContextHolder.getContext().getAuthentication() == null) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            userDetails,
            null,
            userDetails.getAuthorities());
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        log.debug("JWT authenticated user {} with authorities {}", email, userDetails.getAuthorities());
      } else {
        log.debug("SecurityContext already populated for {}", path);
      }

    } catch (Exception ex) {
      log.error("JWT filter failed for path {}: {}", path, ex.getMessage(), ex);
    }

    filterChain.doFilter(request, response);
  }
}
