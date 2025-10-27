// Runtime configuration for DistriSchool Frontend
// This file is served by nginx and can be modified at runtime
window.DISTRISCHOOL_CONFIG = {
  // API URL - can be absolute or relative
  // If using Ingress: '/api' (relative path)
  // If using NodePort: 'http://127.0.0.1:PORT' (absolute URL)
  apiUrl: '/api',
  
  // Environment
  environment: 'production'
};
