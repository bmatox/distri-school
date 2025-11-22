package br.com.distrischool.user_service.service;

import br.com.distrischool.user_service.domain.Role;
import br.com.distrischool.user_service.domain.User;
import br.com.distrischool.user_service.dto.*;
import br.com.distrischool.user_service.exception.EmailAlreadyUsedException;
import br.com.distrischool.user_service.exception.ResourceNotFoundException;
import br.com.distrischool.user_service.messaging.UserEventPublisher;
import br.com.distrischool.user_service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserEventPublisher userEventPublisher;

    @InjectMocks
    private UserService userService;

    private User userMock;

    @BeforeEach
    void setUp() {
        userMock = new User();
        userMock.setId(1L);
        userMock.setName("João Silva");
        userMock.setEmail("joao@test.com");
        userMock.setPasswordHash("encodedPassword");
        userMock.setRole(Role.STUDENT);
        userMock.setCreatedAt(LocalDateTime.now());
        userMock.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should create user successfully with STUDENT role and publish event")
    void testCreateUserAsStudent() {
        // Given
        AlunoProfileData alunoProfile = new AlunoProfileData(
                null,
                1L,
                1L,
                "(11) 98765-4321",
                LocalDate.of(2000, 5, 15),
                new EnderecoData("Rua Teste", "123", "São Paulo", "SP", "12345-678")
        );
        CreateUserRequest request = new CreateUserRequest(
                "João Silva",
                "joao@test.com",
                "password123",
                Role.STUDENT,
                null,
                null,
                null,
                alunoProfile,
                null
        );

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(userMock);
        doNothing().when(userEventPublisher).publish(anyString(), any());

        // When
        UserResponse response = userService.create(request);

        // Then
        assertNotNull(response);
        assertEquals("João Silva", response.name());
        assertEquals("joao@test.com", response.email());
        verify(userRepository).existsByEmail("joao@test.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
        verify(userEventPublisher).publish(eq("aluno.created"), any());
    }

    @Test
    @DisplayName("Should create user successfully with TEACHER role and publish event")
    void testCreateUserAsTeacher() {
        // Given
        ProfessorProfileData professorProfile = new ProfessorProfileData(
                "Engenharia de Software",
                LocalDate.of(2020, 1, 15),
                1L
        );
        CreateUserRequest request = new CreateUserRequest(
                "Maria Santos",
                "maria@test.com",
                "password123",
                Role.TEACHER,
                null,
                null,
                professorProfile,
                null,
                null
        );

        userMock.setRole(Role.TEACHER);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(userMock);
        doNothing().when(userEventPublisher).publish(anyString(), any());

        // When
        UserResponse response = userService.create(request);

        // Then
        assertNotNull(response);
        verify(userEventPublisher).publish(eq("professor.created"), any());
    }

    @Test
    @DisplayName("Should throw EmailAlreadyUsedException when email is already in use")
    void testCreateUserWithDuplicateEmail() {
        // Given
        CreateUserRequest request = new CreateUserRequest(
                "João Silva",
                "joao@test.com",
                "password123",
                Role.STUDENT,
                null,
                null,
                null,
                null,
                null
        );

        when(userRepository.existsByEmail("joao@test.com")).thenReturn(true);

        // When & Then
        assertThrows(EmailAlreadyUsedException.class, () -> userService.create(request));
        verify(userRepository).existsByEmail("joao@test.com");
        verify(userRepository, never()).save(any(User.class));
        verify(userEventPublisher, never()).publish(anyString(), any());
    }

    @Test
    @DisplayName("Should get user by id successfully")
    void testGetById() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(userMock));

        // When
        UserResponse response = userService.getById(1L);

        // Then
        assertNotNull(response);
        assertEquals("João Silva", response.name());
        assertEquals("joao@test.com", response.email());
        verify(userRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user not found by id")
    void testGetByIdNotFound() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> userService.getById(999L));
        verify(userRepository).findById(999L);
    }

    @Test
    @DisplayName("Should list users with pagination")
    void testListUsers() {
        // Given
        List<User> users = Arrays.asList(userMock);
        Page<User> userPage = new PageImpl<>(users);
        Pageable pageable = PageRequest.of(0, 10);
        when(userRepository.findAll(pageable)).thenReturn(userPage);

        // When
        Page<UserResponse> response = userService.list(pageable);

        // Then
        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        verify(userRepository).findAll(pageable);
    }

    @Test
    @DisplayName("Should list users by role")
    void testListByRole() {
        // Given
        List<User> users = Arrays.asList(userMock);
        when(userRepository.findByRole(Role.STUDENT)).thenReturn(users);

        // When
        List<UserResponse> response = userService.listByRole(Role.STUDENT);

        // Then
        assertNotNull(response);
        assertEquals(1, response.size());
        verify(userRepository).findByRole(Role.STUDENT);
    }

    @Test
    @DisplayName("Should list available users by role")
    void testListAvailableByRole() {
        // Given
        List<User> users = Arrays.asList(userMock);
        when(userRepository.findByRoleAndExternalIdIsNull(Role.TEACHER)).thenReturn(users);

        // When
        List<UserResponse> response = userService.listAvailableByRole(Role.TEACHER);

        // Then
        assertNotNull(response);
        assertEquals(1, response.size());
        verify(userRepository).findByRoleAndExternalIdIsNull(Role.TEACHER);
    }

    @Test
    @DisplayName("Should update user successfully")
    void testUpdateUser() {
        // Given
        UpdateUserRequest request = new UpdateUserRequest(
                "João Silva Updated",
                "joao.updated@test.com",
                "newPassword",
                Role.STUDENT,
                2L,
                "STUDENT"
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(userMock));
        when(userRepository.existsByEmail("joao.updated@test.com")).thenReturn(false);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        doNothing().when(userEventPublisher).publish(anyString(), any());

        // When
        UserResponse response = userService.update(1L, request);

        // Then
        assertNotNull(response);
        verify(userRepository).findById(1L);
        verify(userRepository).existsByEmail("joao.updated@test.com");
        verify(passwordEncoder).encode("newPassword");
        verify(userEventPublisher).publish(eq("user.updated"), any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when updating non-existent user")
    void testUpdateUserNotFound() {
        // Given
        UpdateUserRequest request = new UpdateUserRequest(
                "João Silva",
                "joao@test.com",
                null,
                Role.STUDENT,
                null,
                null
        );

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> userService.update(999L, request));
        verify(userRepository).findById(999L);
        verify(userRepository, never()).existsByEmail(anyString());
    }

    @Test
    @DisplayName("Should throw EmailAlreadyUsedException when updating to existing email")
    void testUpdateUserWithDuplicateEmail() {
        // Given
        UpdateUserRequest request = new UpdateUserRequest(
                "João Silva",
                "existing@test.com",
                null,
                Role.STUDENT,
                null,
                null
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(userMock));
        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        // When & Then
        assertThrows(EmailAlreadyUsedException.class, () -> userService.update(1L, request));
        verify(userRepository).findById(1L);
        verify(userRepository).existsByEmail("existing@test.com");
    }

    @Test
    @DisplayName("Should delete user successfully and publish event")
    void testDeleteUser() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(true);
        doNothing().when(userRepository).deleteById(1L);
        doNothing().when(userEventPublisher).publish(anyString(), any());

        // When
        userService.delete(1L);

        // Then
        verify(userRepository).existsById(1L);
        verify(userRepository).deleteById(1L);
        verify(userEventPublisher).publish(eq("user.deleted"), any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent user")
    void testDeleteUserNotFound() {
        // Given
        when(userRepository.existsById(999L)).thenReturn(false);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> userService.delete(999L));
        verify(userRepository).existsById(999L);
        verify(userRepository, never()).deleteById(anyLong());
        verify(userEventPublisher, never()).publish(anyString(), any());
    }

    @Test
    @DisplayName("Should publish correct event routing key for STUDENT role")
    void testCreateUserPublishesCorrectEventForStudent() {
        // Given
        AlunoProfileData alunoProfile = new AlunoProfileData(
                null,
                1L,
                1L,
                "(11) 98765-4321",
                LocalDate.of(2000, 5, 15),
                null
        );
        CreateUserRequest request = new CreateUserRequest(
                "Test Student",
                "student@test.com",
                "password",
                Role.STUDENT,
                null,
                null,
                null,
                alunoProfile,
                null
        );

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(userMock);
        doNothing().when(userEventPublisher).publish(anyString(), any());

        // When
        userService.create(request);

        // Then
        ArgumentCaptor<String> routingKeyCaptor = ArgumentCaptor.forClass(String.class);
        verify(userEventPublisher).publish(routingKeyCaptor.capture(), any());
        assertEquals("aluno.created", routingKeyCaptor.getValue());
    }

    @Test
    @DisplayName("Should publish correct event routing key for TEACHER role")
    void testCreateUserPublishesCorrectEventForTeacher() {
        // Given
        ProfessorProfileData professorProfile = new ProfessorProfileData(
                "Matemática",
                LocalDate.now(),
                null
        );
        CreateUserRequest request = new CreateUserRequest(
                "Test Teacher",
                "teacher@test.com",
                "password",
                Role.TEACHER,
                null,
                null,
                professorProfile,
                null,
                null
        );

        userMock.setRole(Role.TEACHER);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(userMock);
        doNothing().when(userEventPublisher).publish(anyString(), any());

        // When
        userService.create(request);

        // Then
        ArgumentCaptor<String> routingKeyCaptor = ArgumentCaptor.forClass(String.class);
        verify(userEventPublisher).publish(routingKeyCaptor.capture(), any());
        assertEquals("professor.created", routingKeyCaptor.getValue());
    }
}
