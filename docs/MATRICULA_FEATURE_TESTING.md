# 📚 Testing Guide - Student Enrollment (Matrícula) Feature

## Overview

This document describes how to test the new **Matrícula** (Student Enrollment) feature implemented for the DistriSchool platform.

## Feature Summary

### What Was Implemented

1. **Backend (Professor Service)**
   - New `MatriculaDisciplina` entity to track student enrollments
   - Database table `matricula_disciplina` with foreign keys
   - RESTful API endpoints for enrollment management
   - Business logic to prevent duplicate enrollments

2. **Frontend (React)**
   - Updated `StudentDashboard` to display student's matricula number
   - New `MatriculaPage` for enrollment management
   - Filtered disciplina selection (only shows available disciplinas for student's turma)
   - List of enrolled disciplinas with cancellation option
   - "Em desenvolvimento" badges on other dashboard cards

3. **API Gateway**
   - New route for `/api/matriculas/**` endpoints

## Prerequisites for Testing

### Running Infrastructure

You need the following services running:

1. **PostgreSQL Database** (port 5432)
2. **RabbitMQ** (optional for this feature, but needed for full system)
3. **Professor Service** (port 8082) - includes matricula endpoints
4. **Aluno Service** (port 8081)
5. **User Service** (port 8080)
6. **API Gateway** (port 8080)
7. **Frontend** (port 80 or 5173 for dev)

### Using Docker Compose (Recommended for Quick Testing)

```bash
# Start infrastructure
cd /home/runner/work/distri-school/distri-school
docker-compose up -d db

# Build and run the professor service
./mvnw clean package -DskipTests
java -jar target/*.jar
```

### Using Kubernetes (Full Production Setup)

```bash
# Use the full deploy script
.\full-deploy.ps1
```

## Test Data Setup

### 1. Create Test Users and Students

You'll need at least one student user with associated aluno data.

**Via User Service API:**

```bash
# Create a student user
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "estudante@test.com",
    "password": "senha123",
    "name": "João da Silva",
    "role": "STUDENT"
  }'

# The user service will automatically create an Aluno via messaging
```

### 2. Ensure Student Has Curso and Turma

Students must be associated with a `curso` and `turma` to see available disciplinas.

**Update Student via Aluno Service:**

```bash
# Get the student ID first
curl http://localhost:8081/api/alunos

# Update student with turma and curso
curl -X PUT http://localhost:8081/api/alunos/{alunoId} \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João da Silva",
    "dataNascimento": "01-01-2000",
    "contato": "(11) 98765-4321",
    "cursoId": 1,
    "turmaId": 1,
    "endereco": {
      "rua": "Rua Teste",
      "numero": "123",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01234-567"
    }
  }'
```

### 3. Create Disciplinas for the Turma

```bash
# Create a disciplina associated with turma 1
curl -X POST http://localhost:8082/api/disciplinas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Cálculo I",
    "descricao": "Introdução ao Cálculo Diferencial e Integral",
    "turma": {
      "id": 1
    },
    "professores": []
  }'

# Create more disciplinas
curl -X POST http://localhost:8082/api/disciplinas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Programação Web",
    "descricao": "Desenvolvimento de aplicações web modernas",
    "turma": {
      "id": 1
    },
    "professores": []
  }'
```

## Testing the Matricula Feature

### Test Case 1: View Student Dashboard with Matricula Number

**Steps:**
1. Login as a student user (email: `estudante@test.com`, password: `senha123`)
2. View the Student Dashboard

**Expected Results:**
- ✅ Student's matricula number is displayed below the welcome message
- ✅ "Matrícula" card is clickable and prominent
- ✅ Other cards show "🚧 Em desenvolvimento" badge
- ✅ Dashboard loads without errors

### Test Case 2: Access Matricula Page

**Steps:**
1. Click on the "Matrícula" card from the Student Dashboard
2. Or navigate directly to `/matriculas`

**Expected Results:**
- ✅ Page displays student's name and matricula
- ✅ Dropdown shows only disciplinas from student's turma
- ✅ Page loads enrolled disciplinas (if any)
- ✅ No errors in console

### Test Case 3: Enroll in a Disciplina

**Steps:**
1. Navigate to `/matriculas`
2. Select a disciplina from the dropdown
3. Click "✅ Confirmar Matrícula" button

**Expected Results:**
- ✅ Success message or page refresh
- ✅ Disciplina appears in "Disciplinas Matriculadas" list
- ✅ Selected disciplina is removed from dropdown
- ✅ Enrollment date is displayed
- ✅ Status shows as "ATIVO"

**API Test (Backend):**
```bash
curl -X POST http://localhost:8082/api/matriculas \
  -H "Content-Type: application/json" \
  -d '{
    "alunoId": 1,
    "disciplinaId": 1
  }'
```

### Test Case 4: View Enrolled Disciplinas

**Steps:**
1. Navigate to `/matriculas`
2. Scroll down to "Disciplinas Matriculadas" section

**Expected Results:**
- ✅ All enrolled disciplinas are displayed as cards
- ✅ Each card shows: disciplina name, curso, turma, enrollment date, status
- ✅ Cancel button (❌) is visible on each card

**API Test (Backend):**
```bash
# Get enrollments for a student
curl http://localhost:8082/api/matriculas/aluno/{alunoId}
```

### Test Case 5: Cancel Enrollment

**Steps:**
1. Navigate to `/matriculas`
2. Click the "❌" button on an enrolled disciplina
3. Confirm the cancellation in the dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ After confirmation, disciplina is removed from enrolled list
- ✅ Disciplina reappears in the dropdown
- ✅ Success message or page refresh

**API Test (Backend):**
```bash
curl -X DELETE http://localhost:8082/api/matriculas/{matriculaId}/aluno/{alunoId}
```

### Test Case 6: Prevent Duplicate Enrollments

**Steps:**
1. Enroll in a disciplina
2. Try to enroll in the same disciplina again (via API or by refreshing and selecting again)

**Expected Results:**
- ✅ Backend returns error (400 Bad Request)
- ✅ Frontend shows error message
- ✅ No duplicate entry in database

**API Test:**
```bash
# Try to enroll twice
curl -X POST http://localhost:8082/api/matriculas \
  -H "Content-Type: application/json" \
  -d '{"alunoId": 1, "disciplinaId": 1}'

# Second attempt should fail
curl -X POST http://localhost:8082/api/matriculas \
  -H "Content-Type: application/json" \
  -d '{"alunoId": 1, "disciplinaId": 1}'
```

### Test Case 7: Filter Disciplinas by Turma

**Steps:**
1. Login as a student with turma 1
2. Navigate to `/matriculas`
3. Check dropdown options

**Expected Results:**
- ✅ Only disciplinas associated with turma 1 are shown
- ✅ Disciplinas from other turmas are not visible
- ✅ If student has no turma, appropriate message is shown

### Test Case 8: Student Without Turma

**Steps:**
1. Create or use a student without turma assigned
2. Login as that student
3. Navigate to `/matriculas`

**Expected Results:**
- ✅ Warning message: "Você não está associado a uma turma"
- ✅ Dropdown is disabled or shows "Nenhuma disciplina disponível"
- ✅ Contact secretary message is displayed

### Test Case 9: All Disciplinas Enrolled

**Steps:**
1. Enroll in all available disciplinas for the student's turma
2. Check the matricula page

**Expected Results:**
- ✅ Dropdown shows: "Você já está matriculado em todas as disciplinas disponíveis"
- ✅ Enroll button is disabled
- ✅ Message is informative and clear

## Database Validation

### Check Matricula Records

```sql
-- Connect to PostgreSQL
psql -U postgres -d distrischool_db

-- View matricula_disciplina table
SELECT * FROM matricula_disciplina;

-- Join with disciplinas to see full details
SELECT 
    m.id as matricula_id,
    m.aluno_id,
    d.nome as disciplina_nome,
    m.data_matricula,
    m.status
FROM matricula_disciplina m
JOIN disciplinas d ON m.disciplina_id = d.id
ORDER BY m.data_matricula DESC;

-- Check unique constraint
-- Try inserting duplicate - should fail
INSERT INTO matricula_disciplina (aluno_id, disciplina_id, data_matricula, status)
VALUES (1, 1, NOW(), 'ATIVO');
-- ERROR: duplicate key value violates unique constraint
```

## API Endpoints Reference

### POST /api/matriculas
Enroll a student in a disciplina

**Request:**
```json
{
  "alunoId": 1,
  "disciplinaId": 1
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "alunoId": 1,
  "disciplina": {
    "id": 1,
    "nome": "Cálculo I",
    "turma": { ... }
  },
  "dataMatricula": "2025-11-09T15:30:00",
  "status": "ATIVO"
}
```

### GET /api/matriculas/aluno/{alunoId}
Get all enrollments for a student

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "alunoId": 1,
    "disciplina": { ... },
    "dataMatricula": "2025-11-09T15:30:00",
    "status": "ATIVO"
  }
]
```

### DELETE /api/matriculas/{matriculaId}/aluno/{alunoId}
Cancel an enrollment

**Response:** `204 No Content`

## Error Scenarios

| Scenario | Expected Behavior |
|----------|-------------------|
| Duplicate enrollment | HTTP 400, error message |
| Invalid disciplinaId | HTTP 400, "Disciplina não encontrada" |
| Invalid alunoId | HTTP 400 |
| Canceling someone else's enrollment | HTTP 400, "Esta matrícula não pertence ao aluno" |
| Student without turma | UI shows warning, dropdown disabled |

## Performance Testing

### Load Test Scenarios

1. **Multiple simultaneous enrollments**
   - 10+ students enrolling at the same time
   - Should handle without deadlocks

2. **Database constraints**
   - Unique constraint should prevent race conditions
   - Test with concurrent requests

3. **Page load performance**
   - MatriculaPage should load in < 2 seconds
   - Dashboard should load in < 1 second

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Testing

- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ Color contrast meets WCAG standards
- ✅ Forms have proper labels

## Known Limitations

1. **No authorization** - Any student can technically access any other student's enrollments via API (should add authorization in production)
2. **No enrollment capacity** - Disciplinas don't have maximum student limits
3. **No prerequisites** - System doesn't check if student completed prerequisite disciplinas
4. **No semester constraints** - Students can enroll anytime, no enrollment period validation

## Future Enhancements

- Add enrollment periods (e.g., only allow enrollment during specific dates)
- Add disciplina capacity limits
- Add prerequisite checking
- Add notification when enrollment is successful
- Add grade/approval tracking for completed enrollments
- Add bulk enrollment functionality
- Add enrollment history/audit log

## Troubleshooting

### Issue: Dropdown shows no disciplinas

**Solution:**
- Verify student has turma assigned
- Check if disciplinas exist for that turma
- Verify API Gateway is routing correctly
- Check browser console for errors

### Issue: Enrollment fails with 400 error

**Solution:**
- Check if student is already enrolled
- Verify disciplinaId is valid
- Check backend logs for detailed error
- Verify database constraints

### Issue: Matricula number not showing

**Solution:**
- Verify aluno has matricula field populated
- Check if login response includes correct user data
- Verify aluno fetch is successful
- Check browser console for errors

## Conclusion

This feature implements a complete student enrollment system with proper validation, filtered selection, and a clean user interface. All components work together through RESTful APIs without requiring message queuing, making it a simple and maintainable solution.

For questions or issues, please refer to the main [ARCHITECTURE.md](./ARCHITECTURE.md) documentation or create an issue in the repository.
