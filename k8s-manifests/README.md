# Kubernetes Manifests for DistriSchool

This directory contains all Kubernetes manifests for deploying the DistriSchool application.

## Authentication Configuration

### For Development/Testing

The default configuration files (`auth-secret.yaml` and `auth-configmap.yaml`) are ready to use for development and testing purposes. Simply run `./full-deploy.ps1` and the authentication will work out of the box.

### For Production

⚠️ **IMPORTANT**: Before deploying to production, you MUST update the JWT secret:

#### Method 1: Update the manifest file directly (not recommended for production)

Edit `auth-secret.yaml` and replace the JWT_SECRET value with a secure random key.

#### Method 2: Generate and apply a new secret (recommended)

```bash
# Generate a secure random 256-bit key
NEW_SECRET=$(openssl rand -base64 32)

# Create the secret in Kubernetes
kubectl create secret generic auth-secret \
  --from-literal=JWT_SECRET=$NEW_SECRET \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart affected deployments to pick up the new secret
kubectl rollout restart deployment/user-deployment
kubectl rollout restart deployment/api-gateway-deployment
```

#### Method 3: Use external secret management (best for production)

Consider using a secret management solution like:
- **AWS Secrets Manager** with External Secrets Operator
- **HashiCorp Vault**
- **Azure Key Vault**
- **Google Secret Manager**

## Manifest Files

### Authentication
- `auth-secret.yaml` - JWT secret for token signing
- `auth-configmap.yaml` - JWT configuration (expiration time)

### Infrastructure
- `postgres/` - PostgreSQL database
- `rabbitmq/` - RabbitMQ message broker

### Backend Services
- `user-service/` - User management and authentication service
- `api-gateway/` - API Gateway with JWT validation
- `professor-service/` - Professor management service
- `aluno-service/` - Student management service

### Frontend
- `frontend/` - React frontend application

### Networking
- `ingress.yaml` - Ingress configuration for external access

## Deployment Order

The `full-deploy.ps1` script deploys resources in the following order:

1. Authentication configuration (Secret and ConfigMap)
2. Infrastructure (PostgreSQL, RabbitMQ)
3. Backend services (Professor, Aluno, User, API Gateway)
4. Frontend
5. Ingress

This order ensures that all dependencies are available before dependent services start.

## Security Notes

- JWT secrets are stored as Kubernetes Secrets (base64 encoded by Kubernetes)
- Default development secret is version controlled for convenience
- Production secrets should NEVER be committed to version control
- Use proper secret rotation practices in production
- Consider implementing certificate-based authentication for production
