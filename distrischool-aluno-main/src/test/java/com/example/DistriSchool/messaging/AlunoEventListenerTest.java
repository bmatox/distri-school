package com.example.DistriSchool.messaging;

import com.example.DistriSchool.domain.Aluno;
import com.example.DistriSchool.messaging.dto.AlunoEventDTO;
import com.example.DistriSchool.messaging.dto.EnderecoEventDTO;
import com.example.DistriSchool.repository.AlunoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlunoEventListenerTest {

    @Mock
    private AlunoRepository alunoRepository;

    @InjectMocks
    private AlunoEventListener alunoEventListener;

    private AlunoEventDTO validEvent;

    @BeforeEach
    void setUp() {
        // Create a valid event with all required fields
        validEvent = AlunoEventDTO.builder()
                .userId(1L)
                .nome("João Silva")
                .matricula("2025001")
                .cursoId(1L)
                .turmaId(1L)
                .contato("(11) 98765-4321") // 18 characters - valid
                .dataNascimento(LocalDate.of(2000, 5, 15)) // Past date - valid
                .type("CREATED")
                .build();
    }

    @Test
    void shouldCreateAlunoWhenEventIsValid() {
        // Given
        when(alunoRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(alunoRepository.getNextMatriculaSequence()).thenReturn(1L);
        when(alunoRepository.save(any(Aluno.class))).thenAnswer(invocation -> {
            Aluno aluno = invocation.getArgument(0);
            aluno.setId(1L);
            return aluno;
        });

        // When
        alunoEventListener.handleAlunoEvent(validEvent);

        // Then
        verify(alunoRepository).save(any(Aluno.class));
        verify(alunoRepository).getNextMatriculaSequence();
    }

    @Test
    void shouldNotCreateAlunoWhenUserIdAlreadyExists() {
        // Given
        when(alunoRepository.findByUserId(1L)).thenReturn(Optional.of(new Aluno()));

        // When
        alunoEventListener.handleAlunoEvent(validEvent);

        // Then
        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    void shouldNotCreateAlunoWhenContatoIsTooShort() {
        // Given
        AlunoEventDTO invalidEvent = AlunoEventDTO.builder()
                .userId(2L)
                .nome("Maria Silva")
                .matricula("2025002")
                .contato("12345") // 5 characters - too short
                .dataNascimento(LocalDate.of(2000, 5, 15))
                .type("CREATED")
                .build();
        when(alunoRepository.findByUserId(2L)).thenReturn(Optional.empty());

        // When
        alunoEventListener.handleAlunoEvent(invalidEvent);

        // Then
        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    void shouldNotCreateAlunoWhenContatoIsTooLong() {
        // Given
        String longContato = "a".repeat(51); // 51 characters - too long
        AlunoEventDTO invalidEvent = AlunoEventDTO.builder()
                .userId(3L)
                .nome("Pedro Silva")
                .matricula("2025003")
                .contato(longContato)
                .dataNascimento(LocalDate.of(2000, 5, 15))
                .type("CREATED")
                .build();
        when(alunoRepository.findByUserId(3L)).thenReturn(Optional.empty());

        // When
        alunoEventListener.handleAlunoEvent(invalidEvent);

        // Then
        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    void shouldNotCreateAlunoWhenContatoIsBlank() {
        // Given
        AlunoEventDTO invalidEvent = AlunoEventDTO.builder()
                .userId(4L)
                .nome("Ana Silva")
                .matricula("2025004")
                .contato("") // blank - invalid
                .dataNascimento(LocalDate.of(2000, 5, 15))
                .type("CREATED")
                .build();
        when(alunoRepository.findByUserId(4L)).thenReturn(Optional.empty());

        // When
        alunoEventListener.handleAlunoEvent(invalidEvent);

        // Then
        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    void shouldNotCreateAlunoWhenDataNascimentoIsNull() {
        // Given
        AlunoEventDTO invalidEvent = AlunoEventDTO.builder()
                .userId(5L)
                .nome("Carlos Silva")
                .matricula("2025005")
                .contato("(11) 98765-4321")
                .dataNascimento(null) // null - invalid
                .type("CREATED")
                .build();
        when(alunoRepository.findByUserId(5L)).thenReturn(Optional.empty());

        // When
        alunoEventListener.handleAlunoEvent(invalidEvent);

        // Then
        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    void shouldNotCreateAlunoWhenDataNascimentoIsInFuture() {
        // Given
        AlunoEventDTO invalidEvent = AlunoEventDTO.builder()
                .userId(6L)
                .nome("Julia Silva")
                .matricula("2025006")
                .contato("(11) 98765-4321")
                .dataNascimento(LocalDate.now().plusDays(1)) // future date - invalid
                .type("CREATED")
                .build();
        when(alunoRepository.findByUserId(6L)).thenReturn(Optional.empty());

        // When
        alunoEventListener.handleAlunoEvent(invalidEvent);

        // Then
        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    void shouldNotCreateAlunoWhenDataNascimentoIsToday() {
        // Given
        AlunoEventDTO invalidEvent = AlunoEventDTO.builder()
                .userId(7L)
                .nome("Bruno Silva")
                .matricula("2025007")
                .contato("(11) 98765-4321")
                .dataNascimento(LocalDate.now()) // today - invalid (must be past)
                .type("CREATED")
                .build();
        when(alunoRepository.findByUserId(7L)).thenReturn(Optional.empty());

        // When
        alunoEventListener.handleAlunoEvent(invalidEvent);

        // Then
        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    void shouldNotCreateAlunoWhenNomeIsBlank() {
        // Given
        AlunoEventDTO invalidEvent = AlunoEventDTO.builder()
                .userId(8L)
                .nome("") // blank - invalid
                .matricula("2025008")
                .contato("(11) 98765-4321")
                .dataNascimento(LocalDate.of(2000, 5, 15))
                .type("CREATED")
                .build();
        when(alunoRepository.findByUserId(8L)).thenReturn(Optional.empty());

        // When
        alunoEventListener.handleAlunoEvent(invalidEvent);

        // Then
        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    void shouldCreateAlunoWithValidEndereco() {
        // Given
        EnderecoEventDTO endereco = EnderecoEventDTO.builder()
                .rua("Rua A")
                .numero("123")
                .cidade("São Paulo")
                .estado("SP")
                .cep("12345-678")
                .build();
        
        AlunoEventDTO eventWithEndereco = AlunoEventDTO.builder()
                .userId(9L)
                .nome("Laura Silva")
                .matricula("2025009")
                .contato("(11) 98765-4321")
                .dataNascimento(LocalDate.of(2000, 5, 15))
                .endereco(endereco)
                .type("CREATED")
                .build();
        
        when(alunoRepository.findByUserId(9L)).thenReturn(Optional.empty());
        when(alunoRepository.getNextMatriculaSequence()).thenReturn(9L);
        when(alunoRepository.save(any(Aluno.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        alunoEventListener.handleAlunoEvent(eventWithEndereco);

        // Then
        verify(alunoRepository).save(any(Aluno.class));
        verify(alunoRepository).getNextMatriculaSequence();
    }

    @Test
    void shouldCreateAlunoWithoutEnderecoWhenEnderecoIsIncomplete() {
        // Given
        EnderecoEventDTO incompleteEndereco = EnderecoEventDTO.builder()
                .rua("Rua A")
                // Missing other required fields
                .build();
        
        AlunoEventDTO eventWithIncompleteEndereco = AlunoEventDTO.builder()
                .userId(10L)
                .nome("Roberto Silva")
                .matricula("2025010")
                .contato("(11) 98765-4321")
                .dataNascimento(LocalDate.of(2000, 5, 15))
                .endereco(incompleteEndereco)
                .type("CREATED")
                .build();
        
        when(alunoRepository.findByUserId(10L)).thenReturn(Optional.empty());
        when(alunoRepository.getNextMatriculaSequence()).thenReturn(10L);
        when(alunoRepository.save(any(Aluno.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        alunoEventListener.handleAlunoEvent(eventWithIncompleteEndereco);

        // Then
        verify(alunoRepository).save(any(Aluno.class));
        verify(alunoRepository).getNextMatriculaSequence();
    }

    @Test
    void shouldGenerateMatriculaAutomaticallyWhenEventHasNullMatricula() {
        // Given
        AlunoEventDTO eventWithNullMatricula = AlunoEventDTO.builder()
                .userId(11L)
                .nome("Carlos Alberto")
                .matricula(null) // Matricula is null - should be generated
                .contato("(11) 98765-4321")
                .dataNascimento(LocalDate.of(2000, 5, 15))
                .type("CREATED")
                .build();
        
        when(alunoRepository.findByUserId(11L)).thenReturn(Optional.empty());
        when(alunoRepository.getNextMatriculaSequence()).thenReturn(5L);
        when(alunoRepository.save(any(Aluno.class))).thenAnswer(invocation -> {
            Aluno aluno = invocation.getArgument(0);
            // Verify that the saved aluno has a generated matricula as simple sequence number
            String expectedMatricula = "5";
            assert aluno.getMatricula().equals(expectedMatricula) : 
                "Expected matricula " + expectedMatricula + " but got " + aluno.getMatricula();
            return aluno;
        });

        // When
        alunoEventListener.handleAlunoEvent(eventWithNullMatricula);

        // Then
        verify(alunoRepository).save(any(Aluno.class));
        verify(alunoRepository).getNextMatriculaSequence();
    }
}
