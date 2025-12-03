import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp-up: 0 to 50 VUs in 30s
    { duration: '1m', target: 50 },    // Sustain: 50 VUs for 1 minute
    { duration: '30s', target: 200 },  // Stress: 50 to 200 VUs in 30s
    { duration: '30s', target: 0 },    // Cool-down: 200 to 0 in 30s
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Less than 10% of requests should fail
    errors: ['rate<0.1'],              // Error rate should be below 10%
  },
};

// Base URL - can be overridden with environment variable
const BASE_URL = __ENV.BASE_URL || 'http://distrischool.local';

// Authentication credentials
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@distrischool.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'admin123';

// Global variable to store the JWT token
let authToken = null;

// Setup function - runs once before all VUs
export function setup() {
  console.log(`Starting load test against: ${BASE_URL}`);
  console.log('Authenticating with admin credentials...');
  
  // Authenticate and get JWT token
  const loginPayload = JSON.stringify({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  const loginParams = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/token`,
    loginPayload,
    loginParams
  );

  const loginSuccess = check(loginRes, {
    'authentication successful': (r) => r.status === 200,
    'token received': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!loginSuccess) {
    console.error(`Authentication failed. Status: ${loginRes.status}`);
    console.error(`Response: ${loginRes.body}`);
    throw new Error('Authentication failed - cannot proceed with load test');
  }

  const loginData = JSON.parse(loginRes.body);
  console.log('Authentication successful!');
  
  return {
    token: loginData.token,
    baseUrl: BASE_URL,
  };
}

// Main test function - runs for each VU
export default function (data) {
  const token = data.token;
  const baseUrl = data.baseUrl;
  
  // Headers for authenticated requests
  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  // Scenario 1: Heavy Read Operations (Authenticated Endpoints)
  // GET /api/v1/professores
  const professorRes = http.get(
    `${baseUrl}/api/v1/professores`,
    authHeaders
  );
  
  check(professorRes, {
    'GET professores status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(0.5); // Small delay between requests

  // GET /api/cursos
  const cursosRes = http.get(
    `${baseUrl}/api/cursos`,
    authHeaders
  );
  
  check(cursosRes, {
    'GET cursos status 200': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(0.5);

  // Scenario 2: Write/Processing Operations (Protected Endpoints)
  // POST /api/users - Create student with role STUDENT
  const randomId = Math.floor(Math.random() * 1000000000); // Larger range for uniqueness
  const timestamp = Date.now();
  const vuId = __VU || 0; // Virtual User ID for extra uniqueness
  const iterId = __ITER || 0; // Iteration number for extra uniqueness
  
  const studentPayload = JSON.stringify({
    name: `Aluno Teste ${randomId}`,
    email: `aluno.teste.${timestamp}.${vuId}.${iterId}@distrischool.com`,
    password: 'Teste@123456',
    role: 'STUDENT',
    alunoProfile: {
      contato: generateContato(), // Must be 12-50 characters
      dataNascimento: generatePastDate(), // Must be a past date (YYYY-MM-DD)
      endereco: {
        rua: `Rua Teste ${randomId}`,
        numero: `${(randomId % 999) + 1}`,
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100'
      }
    }
  });

  const createStudentRes = http.post(
    `${baseUrl}/api/users`,
    studentPayload,
    authHeaders
  );

  check(createStudentRes, {
    'POST aluno status 201 or 200': (r) => r.status === 201 || r.status === 200,
  }) || errorRate.add(1);

  sleep(1); // Longer delay after write operation
}

// Helper function to generate a valid contato (12-50 characters)
// Format: Brazilian phone number with enough characters to meet validation
function generateContato() {
  const ddd = Math.floor(Math.random() * 89) + 11; // DDD from 11 to 99
  const prefix = 9; // Mobile phone prefix
  const firstPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const secondPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  // Format: "(XX) 9XXXX-XXXX" = 15 characters, meets 12-50 requirement
  return `(${ddd}) ${prefix}${firstPart}-${secondPart}`;
}

// Helper function to generate a past date in YYYY-MM-DD format
function generatePastDate() {
  // Generate a random birth date between 18 and 30 years ago
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - Math.floor(Math.random() * 13) - 18; // 18-30 years old
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1; // 1-28 to avoid invalid dates
  
  const month = birthMonth.toString().padStart(2, '0');
  const day = birthDay.toString().padStart(2, '0');
  
  return `${birthYear}-${month}-${day}`;
}

// Teardown function - runs once after all VUs complete
export function teardown(data) {
  console.log('Load test completed!');
  console.log(`Check Grafana at http://localhost:30030 for detailed metrics`);
  console.log(`Check Prometheus at http://localhost:30090 for raw data`);
}
