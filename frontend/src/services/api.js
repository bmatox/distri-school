/**
 * Get the API base URL from runtime configuration or environment variable
 * Priority:
 * 1. Runtime config (window.DISTRISCHOOL_CONFIG.apiUrl)
 * 2. Environment variable (VITE_API_URL)
 * 3. Relative path '/api' (works with Ingress)
 */
export const getApiBaseUrl = () => {
  // Check runtime config first (allows dynamic configuration)
  if (window.DISTRISCHOOL_CONFIG?.apiUrl) {
    return window.DISTRISCHOOL_CONFIG.apiUrl;
  }
  
  // Fallback to environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to relative path (works with Ingress)
  return '/api';
};

/**
 * API service for making HTTP requests to backend services
 */
class ApiService {
  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - clear auth and redirect to login
      if (response.status === 401) {
        console.warn('Unauthorized request - clearing authentication');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Hard navigation to clear React state completely
        window.location.href = '/login';
        throw new Error('Unauthorized - session expired');
      }
      
      if (!response.ok) {
        const errorMessage = `HTTP error! status: ${response.status}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Handle empty responses (e.g., DELETE)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const api = new ApiService();
