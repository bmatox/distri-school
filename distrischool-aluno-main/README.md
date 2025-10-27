#  DistriSchool - Microsserviço de Gerenciamento de Alunos

Este projeto implementa o Microsserviço central para gerenciamento da entidade `Aluno` e serve como a base da arquitetura de microsserviços da DistriSchool. O foco está na robustez da infraestrutura e na segurança.

## Stack de Tecnologia

| Categoria | Tecnologia | Versão Principal | Notas de Configuração |
| :--- | :--- | :--- | :--- |
| **Linguagem** | Java | 17 (LTS) | Versão alinhada para estabilidade com o Spring Boot 3.x. |
| **Framework** | Spring Boot | 3.5.6 | Base para API REST. |
| **Persistência** | Spring Data JPA / Hibernate | Gerenciado pelo Spring | Desativada a criação automática de DDL (`ddl-auto=none`). |
| **Banco de Dados** | PostgreSQL | 14 | Servidor de banco de dados de produção (rodando via Docker). |
| **Migração** | Flyway | Gerenciado pelo Spring | Garante a evolução do schema (`db/migration/V1__...`). |
| **Segurança** | Spring Security | Spring Boot Starter | Autenticação Básica (Basic Auth) e Autorização por Roles. |
| **Qualidade** | Bean Validation | Jakarta Validation | Validação de entrada de dados (`@Valid`, `@NotBlank`). |

## Infraestrutura & Orquestração (Docker Compose)

O projeto é projetado para ser executado via Docker Compose, garantindo que o Microsserviço e o banco de dados sejam iniciados, conectados e configurados com um único comando.

A arquitetura usa o `docker-compose.yml` para orquestrar os seguintes serviços:

1.  **`app` (Aluno Service):** Sua aplicação Spring Boot.
2.  **`db` (PostgreSQL):** O servidor de banco de dados persistente.

### Como Iniciar o Ambiente

**Pré-requisitos:** Docker Desktop (ou Engine) instalado e ativo.

1.  **Clonar e Navegar:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd [pasta-do-projeto]
    ```

2.  **Buildar e Subir:**
    ```bash
    # Este comando compila o código Java, cria a imagem e inicia os containers.
    docker compose up -d --build
    ```
    *Isso inicializará o PostgreSQL 14 e o Flyway executará o script de criação de tabelas (`V1`).*

##  Segurança e Credenciais

A API exige autenticação para todas as operações de modificação.

| Tipo de Acesso | Operações | Credenciais (Basic Auth) |
| :--- | :--- | :--- |
| **Público** | `GET /api/alunos/**` | Nenhuma (Acesso Livre) |
| **Usuário Comum** | `POST`, `PUT` | **Username:** `user` / **Password:** `user123` |
| **Administrador** | `DELETE`, `POST`, `PUT` | **Username:** `admin` / **Password:** `admin123` |

---

##  Endpoints da API (CRUD Completo)

Todos os endpoints utilizam o prefixo completo: `http://localhost:8080/distrischool/api/alunos`.

| Operação | Método HTTP | URL | Corpo (Requer) | Status de Sucesso |
| :--- | :--- | :--- | :--- | :--- |
| **Criar** | `POST` | `/api/alunos` | Objeto `Aluno` com `Endereco` aninhado. | `201 Created` |
| **Listar/Filtrar**| `GET` | `/api/alunos?nome=...` | Nenhum (Query Params) | `200 OK` |
| **Buscar (ID)** | `GET` | `/api/alunos/{id}` | Nenhum | `200 OK` / `404 Not Found` |
| **Buscar (Matrícula)**| `GET` | `/api/alunos/matricula/{valor}` | Nenhum | `200 OK` / `404 Not Found` |
| **Atualizar** | `PUT` | `/api/alunos/{id}` | Objeto `Aluno` completo. | `200 OK` / `404 Not Found` |
| **Excluir** | `DELETE` | `/api/alunos/{id}` | Nenhum | `204 No Content` / `404 Not Found` |

---

##  Tratamento de Exceções Centralizado

O projeto utiliza um `GlobalExceptionHandler` (`@ControllerAdvice`) para lidar com todos os erros de forma centralizada:

| Erro | Status HTTP | Causa no Código | Solução para o Cliente |
| :--- | :--- | :--- | :--- |
| **Validação** | `400 Bad Request` | Falha no `@Valid` (ex: campo `@NotBlank` vazio). | Retorna um JSON com `details` listando cada campo inválido. |
| **Não Encontrado** | `404 Not Found` | Recurso não existe para `GET`, `PUT`, ou `DELETE`. | Retorna um JSON de erro customizado (via `EmptyResultDataAccessException`). |
| **Autorização** | `403 Forbidden` | Usuário logado tentou um `DELETE` sem a `ROLE_ADMIN`. | |

***

