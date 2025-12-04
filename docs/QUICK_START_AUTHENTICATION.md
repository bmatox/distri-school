# Quick Start Guide - JWT Authentication

This guide will help you quickly get started with the DistriSchool authentication system.

## Prerequisites

- Docker and Minikube installed
- Repository cloned locally
- Basic understanding of the DistriSchool deployment process

## 1. Start the Application

Follow the standard DistriSchool deployment process to start all services:

```bash
# Start Minikube
minikube start

# Deploy to Kubernetes
./full-deploy.ps1  # or follow manual deployment steps
```

## 2. Access the Application

Once deployed, access the application through your configured ingress URL (e.g., `http://distrischool.local`).

## 3. Login

When you first access the application, you'll be redirected to the login page.

**Default Admin Credentials:**
- **Email:** `admin@distrischool.com`
- **Password:** `admin123`

![Login Page](../images/login-page.png) _(If you have a screenshot, add it to the images folder)_

## 4. Explore the Dashboard

After successful login, you'll be redirected to the Dashboard where you can:

- View system overview
- Access Professores (Teachers) management
- Access Alunos (Students) management
- **Admin Only:** Access Usuários (Users) management

## 5. Role-Based Access

The system adapts the user interface based on your role:

### ADMIN Role
- Full system access
- Can see and manage Users
- Can see all menu options

### TEACHER Role
- Access to teaching features
- Cannot see Users management
- Limited administrative access

### STUDENT Role
- Access to student features
- Cannot see Users management
- Limited to student-specific functions

## 6. User Management (Admin Only)

As an ADMIN, you can create new users:

1. Navigate to "Usuários" in the menu
2. Click "Create User" or "Novo Usuário"
3. Fill in user details:
   - Name
   - Email
   - Password
   - Role (ADMIN, TEACHER, STUDENT, TECHNICAL_ADMIN)
4. Save the user

**Note:** When creating a user with role TEACHER or STUDENT, the system automatically creates the corresponding Professor or Aluno record through event-driven synchronization.

## 7. Logout

To logout:
1. Click the logout button (🚪 Logout) in the header
2. You'll be redirected to the login page
3. Your authentication token will be cleared

## 8. Session Management

- **Token Expiration:** 24 hours by default
- **Automatic Logout:** If your token expires, you'll be automatically redirected to login
- **Persistent Login:** Your session persists across browser restarts (stored in localStorage)

## Testing the Authentication

### Test 1: Protected Routes
1. Without logging in, try to access `http://distrischool.local/`
2. You should be redirected to `/login`

### Test 2: Login Flow
1. Go to login page
2. Enter admin credentials
3. Click "Login"
4. Verify you're redirected to the dashboard

### Test 3: Role-Based Access
1. Login as ADMIN
2. Verify you can see "Usuários" in the menu
3. Create a TEACHER user
4. Logout
5. Login as the TEACHER user
6. Verify "Usuários" is NOT visible in the menu

### Test 4: Logout
1. Login to the system
2. Click the logout button
3. Verify you're redirected to login
4. Try to access dashboard - should redirect to login

### Test 5: Token Validation
1. Login to the system
2. Open browser DevTools
3. Check localStorage - you should see 'token' and 'user'
4. Delete the token from localStorage
5. Try to navigate to another page
6. You should be redirected to login

## Troubleshooting

### Cannot Login
- **Check credentials:** Make sure you're using the correct email and password
- **Database migration:** Ensure Flyway migrations have run successfully
- **Service status:** Check that user-service is running

### Redirected to Login After Login
- **Token generation:** Check user-service logs for errors
- **JWT secret:** Ensure JWT_SECRET is set consistently across services
- **Token validation:** Check api-gateway logs for token validation errors

### "Usuários" Menu Not Showing
- **Check role:** Only ADMIN users can see the Users management menu
- **Token validation:** Ensure your JWT token contains the correct role

### Token Expires Too Quickly
- **Change expiration:** Set JWT_EXPIRATION environment variable (in milliseconds)
- **Default:** 86400000 ms (24 hours)

## Environment Variables

For production deployment, set these environment variables:

```bash
# User Service and API Gateway
JWT_SECRET=your-secure-random-256-bit-secret-key-here
JWT_EXPIRATION=86400000  # 24 hours in milliseconds
```

### Generating a Secure JWT Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## API Endpoints

### Authentication
- **POST** `/api/v1/auth/token` - Login endpoint
  ```json
  Request:
  {
    "email": "admin@distrischool.com",
    "password": "admin123"
  }
  
  Response:
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "email": "admin@distrischool.com",
    "name": "System Administrator",
    "role": "ADMIN"
  }
  ```

### Protected Endpoints
All other endpoints require the JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer <your-token>" http://distrischool.local/api/users
```

## Next Steps

1. **Change Default Password:** Create a new admin user and delete/disable the default one
2. **Create Users:** Add TEACHER and STUDENT users as needed
3. **Explore Features:** Navigate through the application to explore all features
4. **Review Documentation:** Read the full authentication documentation at [JWT_AUTHENTICATION_IMPLEMENTATION.md](./JWT_AUTHENTICATION_IMPLEMENTATION.md)

## Support

For issues or questions:
1. Check the logs of user-service and api-gateway
2. Review the comprehensive documentation
3. Open an issue on the repository

## Security Reminders

⚠️ **Important Security Notes:**
- Change the default admin password immediately
- Set a secure JWT_SECRET in production
- Use HTTPS in production environments
- Regularly rotate JWT secrets
- Monitor authentication logs for suspicious activity
- Consider implementing 2FA for admin accounts
