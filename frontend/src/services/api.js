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
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
