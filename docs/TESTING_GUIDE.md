# DistriSchool - Testing Guide for Business Logic Implementation

## Overview
This guide provides step-by-step instructions for testing all the new features implemented in the DistriSchool platform.

## Prerequisites
1. All services should be deployed and running (use `full-deploy.ps1` or equivalent)
2. Database should be initialized with migrations applied
3. RabbitMQ should be running and accessible
4. Default admin account should be available:
   - Email: `admin@distrischool.com`
   - Password: `admin123`

## Test Scenarios

### 1. Testing Course and Class Management

#### 1.1 Create Courses
1. Access the professor service API or create a simple admin interface
2. Create test courses:
   ```json
   POST /api/cursos
   {
     "nome": "Ciência da Computação",
     "descricao": "Bacharelado em Ciência da Computação",
     "duracaoSemestres": 8
   }
   ```
3. Create another course:
   ```json
   POST /api/cursos
   {
     "nome": "Engenharia de Software",
     "descricao": "Bacharelado em Engenharia de Software",
     "duracaoSemestres": 8
   }
   ```

#### 1.2 Create Classes (Turmas)
1. Create classes for each course:
   ```json
   POST /api/turmas
   {
     "nome": "CC-2024-1",
     "curso": { "id": 1 },
     "ano": 2024,
     "semestre": 1
   }
   ```

2. Create another class:
   ```json
   POST /api/turmas
   {
     "nome": "CC-2024-2",
     "curso": { "id": 1 },
     "ano": 2024,
     "semestre": 2
   }
   ```

#### 1.3 Create Disciplines
1. Create disciplines for classes:
   ```json
   POST /api/disciplinas
   {
     "nome": "Algoritmos e Estruturas de Dados",
     "descricao": "Introdução a algoritmos",
     "turma": { "id": 1 },
     "professores": [{ "id": 1 }]
   }
   ```

### 2. Testing Student Registration with Course/Class

#### 2.1 Login as Administrator
1. Navigate to `http://localhost` (or your frontend URL)
2. Login with admin credentials
3. Navigate to "Usuários" page

#### 2.2 Create a New Student
1. Click "➕ Novo Usuário"
2. Fill in the form:
   - **Nome Completo**: João Silva
   - **Email**: joao.silva@escola.com
   - **Senha**: senha123
   - **Perfil**: Select "Aluno"
3. Note that **Matrícula** field is:
   - Auto-filled with a sequential number (e.g., 2025000001)
   - Grayed out and read-only
4. Select:
   - **Curso**: Ciência da Computação
5. After selecting course, the **Turma** dropdown should:
   - Become enabled
   - Show only classes from the selected course
6. Select a **Turma**: CC-2024-1
7. Fill remaining fields:
   - **Data de Nascimento**: 01/01/2000
   - **Contato**: (11) 98765-4321
   - **Endereço**: Complete all address fields
8. Click "💾 Salvar Usuário"
9. Verify student appears in the list

**Expected Results:**
- ✅ Matrícula is auto-generated and read-only
- ✅ Course dropdown shows all available courses
- ✅ Turma dropdown only shows classes from selected course
- ✅ Turma dropdown is disabled until course is selected
- ✅ Student is created successfully

### 3. Testing Technical Admin Registration

#### 3.1 Create a Technical Admin
1. Still on "Usuários" page, click "➕ Novo Usuário"
2. Fill in basic info:
   - **Nome**: Maria Santos
   - **Email**: maria.santos@escola.com
   - **Senha**: senha123
   - **Perfil**: Select "Técnico Administrativo"
3. In the "Informações do Técnico Administrativo" section:
   - **Departamento**: Should be a dropdown with options:
     - Financeiro
     - Secretaria Acadêmica
     - Recursos Humanos
     - TI
4. Select one department (e.g., "Secretaria Acadêmica")
5. Set **Data de Admissão**
6. Click "💾 Salvar Usuário"

**Expected Results:**
- ✅ Departamento is a dropdown (not a text field)
- ✅ Dropdown contains the 4 predefined options
- ✅ Technical Admin is created successfully

### 4. Testing Grade Submission with Disciplines

#### 4.1 Login as Administrator (or Professor if available)
1. Navigate to "Gestão de Notas" page
2. Click "Lançar Nova Nota"

#### 4.2 Submit a Grade
1. Fill in the form in this order:
   - **Professor**: Select a professor
   - **Disciplina**: Select a discipline (e.g., "Algoritmos e Estruturas de Dados")
   - Note: After selecting discipline, the **Aluno** dropdown should:
     - Become enabled
     - Show only students enrolled in that discipline's class
   - **Aluno**: Select the student created earlier (João Silva)
   - **Nome da Disciplina**: Enter "Algoritmos"
   - **Nota**: Enter 8.5
   - **Tipo de Avaliação**: Select from dropdown:
     - AV1
     - AV2
     - AV3
     - Prova
     - Trabalho
     - etc.
   - **Observações**: Enter "Excelente desempenho"
2. Click "Lançar Nota"

**Expected Results:**
- ✅ Disciplina dropdown shows all available disciplines
- ✅ Aluno dropdown is initially disabled
- ✅ After selecting discipline, Aluno dropdown enables
- ✅ Aluno dropdown shows only students from that discipline's class
- ✅ Evaluation type includes AV1, AV2, AV3 options
- ✅ Grade is saved successfully
- ✅ Grade appears in the list

### 5. Testing Notification System

#### 5.1 Verify RabbitMQ Event
1. After creating a grade (previous step), check RabbitMQ:
   - Access RabbitMQ management UI (typically port 15672)
   - Check that `grade.created` event was published
   - Check that communication service consumed the event

#### 5.2 Test Notification in Header
1. Logout from admin account
2. Login as the student (João Silva):
   - Email: joao.silva@escola.com
   - Password: senha123
3. Look at the header (top right corner):
   - Should see a **🔔 notification icon** next to user name
   - Icon should have a **red badge** with number "1" (or more)
4. Click the notification icon
5. Should navigate to "Notificações" page
6. Should see notification: "Nova Nota Lançada"
7. Message should say: "Você recebeu uma nova nota em Algoritmos: 8.5"

**Expected Results:**
- ✅ Notification icon appears in header
- ✅ Badge shows correct count of unread notifications
- ✅ Badge updates automatically (polls every 30 seconds)
- ✅ Clicking icon navigates to notifications page
- ✅ Notification contains correct information about the grade
- ✅ Notification is marked as unread initially

#### 5.3 Test Marking Notification as Read
1. On notifications page, click "Marcar como lida"
2. Return to dashboard
3. Check header notification icon:
   - Badge should disappear or show "0"

**Expected Results:**
- ✅ Notification can be marked as read
- ✅ Badge count updates after marking as read

### 6. Admin Dashboard Verification

#### 6.1 Check Admin Dashboard Content
1. Login as administrator
2. Navigate to dashboard
3. Verify dashboard contains ONLY:
   - **Usuários** card
   - **Professores** card
   - **Alunos** card
4. Verify there is NO "Gestão de Notas" or similar grade management card

**Expected Results:**
- ✅ Admin dashboard focuses on user/student/professor management
- ✅ No grade management options in admin dashboard

## Integration Testing

### End-to-End Flow Test
1. **Admin creates student** with course and class ✅
2. **Admin creates discipline** with professor assigned ✅
3. **Professor (or admin) launches grade** for student in discipline ✅
4. **Grade is saved** to database ✅
5. **Event published** to RabbitMQ ✅
6. **Communication service** consumes event ✅
7. **Notification created** for student ✅
8. **Student sees notification** in header badge ✅
9. **Student clicks** notification icon ✅
10. **Student views** notification details ✅

## Troubleshooting

### Common Issues

#### Issue: Courses/Classes not appearing in dropdowns
- **Solution**: Ensure courses and classes are created via API or database
- Check that GET /api/cursos and GET /api/turmas return data

#### Issue: Student dropdown not enabling after selecting discipline
- **Solution**: Check browser console for JavaScript errors
- Verify that GET /api/disciplinas/{id} returns discipline with turma information

#### Issue: Notification not appearing
- **Solution**: 
  - Check RabbitMQ management UI to see if events are being published
  - Verify communication-service is running and consuming from queue
  - Check communication-service logs for errors
  - Verify studentId in grade matches userId in notification

#### Issue: Matricula not auto-filled
- **Solution**:
  - Check that GET /api/alunos/next-matricula endpoint is accessible
  - Verify aluno service is running
  - Check browser console for errors

## Database Verification

### SQL Queries to Verify Data

```sql
-- Check courses
SELECT * FROM cursos;

-- Check classes
SELECT * FROM turmas;

-- Check disciplines
SELECT * FROM disciplinas;

-- Check students with course/class
SELECT id, nome, matricula, curso_id, turma_id FROM aluno;

-- Check grades with discipline
SELECT * FROM grades_schema.grades;

-- Check notifications
SELECT * FROM notifications ORDER BY created_at DESC;
```

## Performance Notes

- Notification badge polls every 30 seconds
- Consider caching course/class data in frontend for better performance
- Monitor RabbitMQ queue sizes during heavy grade posting

## Success Criteria

The implementation is successful if:
1. ✅ All backend services compile and run without errors
2. ✅ Frontend builds and runs without errors
3. ✅ Students can be created with course/class selection
4. ✅ Matricula is auto-generated and read-only
5. ✅ Technical admin department is a dropdown
6. ✅ Grades can be submitted with discipline selection
7. ✅ Student dropdown depends on selected discipline
8. ✅ Evaluation types include AV1, AV2, AV3
9. ✅ Notifications appear in header with badge
10. ✅ Full notification flow works (grade -> event -> notification -> display)
