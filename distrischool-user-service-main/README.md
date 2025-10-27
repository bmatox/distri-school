# DistriSchool - User Service

Microserviço responsável pela **gestão de usuários** da plataforma **DistriSchool** — uma solução distribuída de gestão escolar.

---

## 🚀 Tecnologias

- **Java 17**
- **Spring Boot 3.5.6**
- **Spring Data JPA**
- **Spring Security**
- **Flyway (Migrations)**
- **PostgreSQL**
- **Docker & Docker Compose**
- **Lombok**
- **Actuator** (Healthcheck)

---

## ⚙️ Estrutura do Projeto

src/
├── main/
│ ├── java/br/com/distrischool/user_service
│ │ ├── controller/ # Endpoints REST
│ │ ├── dto/ # Objetos de requisição e resposta
│ │ ├── entity/ # Entidades JPA (User, etc)
│ │ ├── repository/ # Interfaces de acesso ao banco
│ │ ├── service/ # Regras de negócio
│ │ └── config/ # Segurança, CORS e Beans gerais
│ └── resources/
│ ├── application.yml
│ └── db/migration/ # Scripts Flyway (ex: V1__create_users_table.sql)
└── test/ # Testes unitários e de integração


## 🐳 Rodando com Docker

Certifique-se de ter **Docker** e **Docker Compose** instalados.

```bash
# Clonar o repositório
git clone https://github.com/YuriEnomoto/distrischool-user-service.git
cd distrischool-user-service/user-service/user-service

# Subir os containers
docker compose up -d --build
📦 Isso sobe:

user-service → aplicação Spring Boot (porta 8080)

users-db → banco PostgreSQL (porta 5432)

🧩 Migrations (Flyway)
Os scripts SQL estão em:

src/main/resources/db/migration/
O Flyway é executado automaticamente ao subir o container, criando a tabela users e o histórico em flyway_schema_history.

🔍 Endpoints Principais
Método	Endpoint	Descrição
GET	/actuator/health	Verifica se o serviço está UP
POST	/api/v1/users	Cria um novo usuário
GET	/api/v1/users	Lista todos os usuários (paginado)
GET	/api/v1/users/{id}	Busca usuário por ID
PUT	/api/v1/users/{id}	Atualiza dados de um usuário
DELETE	/api/v1/users/{id}	Remove um usuário

📬 Exemplos de Requisição (Postman)
➕ Criar Usuário
POST http://localhost:8080/api/v1/users

{
  "name": "Yuri",
  "email": "Yuri@example.com",
  "password": "SenhaForte!",
  "role": "ADMIN"
}
🔎 Listar Usuários
GET http://localhost:8080/api/v1/users?page=0&size=10

✏️ Atualizar Usuário
PUT http://localhost:8080/api/v1/users/1

{
  "name": "Yuri Enomoto",
  "password": "NovaSenha!"
}

🗑️ Deletar Usuário
DELETE http://localhost:8080/api/v1/users/1

🔐 Segurança e Criptografia
As senhas são criptografadas com BCrypt.

O campo password_hash nunca é retornado pela API.

Hashes válidos começam com $2a$ ou $2b$ e possuem 60 caracteres.

Exemplo no banco:
$2b$10$4YVg45c1m8a5J1o0dX2nZ.2p4x1kV9hZFCt4oHq0vT9X0w1qf1U2a


