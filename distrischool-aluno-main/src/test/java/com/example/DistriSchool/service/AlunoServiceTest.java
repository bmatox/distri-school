package com.example.DistriSchool.service;

import com.example.DistriSchool.domain.Aluno;
import com.example.DistriSchool.domain.Endereco;
import com.example.DistriSchool.dto.FiltroAlunoDTO;
import com.example.DistriSchool.repository.AlunoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.EmptyResultDataAccessException;

import java.time.LocalDate;
import java.time.Year;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AlunoService Unit Tests")
class AlunoServiceTest {

    @Mock
    private AlunoRepository alunoRepository;

    @Mock
    private AlunoProducer alunoProducer;

    @InjectMocks
    private AlunoService alunoService;

    private Aluno alunoMock;

    @BeforeEach
    void setUp() {
        alunoMock = new Aluno();
        alunoMock.setId(1L);
        alunoMock.setNome("João Silva");
        alunoMock.setContato("(11) 98765-4321");
        alunoMock.setDataNascimento(LocalDate.of(2000, 5, 15));
        alunoMock.setCursoId(1L);
        alunoMock.setTurmaId(1L);
        
        Endereco endereco = new Endereco();
        endereco.setRua("Rua Teste");
        endereco.setNumero("123");
        endereco.setCidade("São Paulo");
        endereco.setEstado("SP");
        endereco.setCep("12345-678");
        alunoMock.setEndereco(endereco);
    }

    @Test
    @DisplayName("Should generate sequential matricula when creating aluno without matricula")
    void testSaveAlunoGeneratesSequentialMatricula() {
        // Given
        alunoMock.setMatricula(null);
        when(alunoRepository.count()).thenReturn(5L);
        when(alunoRepository.save(any(Aluno.class))).thenReturn(alunoMock);
        doNothing().when(alunoProducer).sendMessage(any(Aluno.class));

        // When
        Aluno savedAluno = alunoService.save(alunoMock);

        // Then
        assertNotNull(savedAluno);
        String expectedMatricula = Year.now().toString() + "6"; // count + 1
        assertEquals(expectedMatricula, savedAluno.getMatricula());
        verify(alunoRepository).count();
        verify(alunoRepository).save(any(Aluno.class));
        verify(alunoProducer).sendMessage(any(Aluno.class));
    }

    @Test
    @DisplayName("Should not override matricula when aluno already has one")
    void testSaveAlunoKeepsExistingMatricula() {
        // Given
        String existingMatricula = "20231234";
        alunoMock.setMatricula(existingMatricula);
        when(alunoRepository.save(any(Aluno.class))).thenReturn(alunoMock);
        doNothing().when(alunoProducer).sendMessage(any(Aluno.class));

        // When
        Aluno savedAluno = alunoService.save(alunoMock);

        // Then
        assertNotNull(savedAluno);
        assertEquals(existingMatricula, savedAluno.getMatricula());
        verify(alunoRepository, never()).count();
        verify(alunoRepository).save(any(Aluno.class));
        verify(alunoProducer).sendMessage(any(Aluno.class));
    }

    @Test
    @DisplayName("Should publish message to RabbitMQ when saving aluno")
    void testSaveAlunoPublishesMessage() {
        // Given
        alunoMock.setMatricula("20251");
        when(alunoRepository.save(any(Aluno.class))).thenReturn(alunoMock);
        doNothing().when(alunoProducer).sendMessage(any(Aluno.class));

        // When
        alunoService.save(alunoMock);

        // Then
        verify(alunoProducer).sendMessage(alunoMock);
    }

    @Test
    @DisplayName("Should return all alunos")
    void testGetAll() {
        // Given
        List<Aluno> mockAlunos = Arrays.asList(alunoMock, new Aluno());
        when(alunoRepository.findAll()).thenReturn(mockAlunos);

        // When
        List<Aluno> result = alunoService.getAll();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(alunoRepository).findAll();
    }

    @Test
    @DisplayName("Should return aluno by id")
    void testGetById() {
        // Given
        when(alunoRepository.findById(1L)).thenReturn(Optional.of(alunoMock));

        // When
        Optional<Aluno> result = alunoService.getById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals("João Silva", result.get().getNome());
        verify(alunoRepository).findById(1L);
    }

    @Test
    @DisplayName("Should return empty when aluno not found by id")
    void testGetByIdNotFound() {
        // Given
        when(alunoRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Aluno> result = alunoService.getById(999L);

        // Then
        assertFalse(result.isPresent());
        verify(alunoRepository).findById(999L);
    }

    @Test
    @DisplayName("Should return aluno by matricula")
    void testGetByMatricula() {
        // Given
        when(alunoRepository.findByMatricula("20251")).thenReturn(Optional.of(alunoMock));

        // When
        Optional<Aluno> result = alunoService.getByMatricula("20251");

        // Then
        assertTrue(result.isPresent());
        assertEquals("João Silva", result.get().getNome());
        verify(alunoRepository).findByMatricula("20251");
    }

    @Test
    @DisplayName("Should filter alunos by nome")
    void testGetByFilterNome() {
        // Given
        FiltroAlunoDTO filtro = new FiltroAlunoDTO();
        filtro.setNome("João");
        List<Aluno> mockAlunos = Arrays.asList(alunoMock);
        when(alunoRepository.findByNomeContainingIgnoreCase("João")).thenReturn(mockAlunos);

        // When
        List<Aluno> result = alunoService.getByFilter(filtro);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(alunoRepository).findByNomeContainingIgnoreCase("João");
    }

    @Test
    @DisplayName("Should filter alunos by turmaId")
    void testGetByFilterTurmaId() {
        // Given
        FiltroAlunoDTO filtro = new FiltroAlunoDTO();
        filtro.setTurma("1");
        List<Aluno> mockAlunos = Arrays.asList(alunoMock);
        when(alunoRepository.findByTurmaId(1L)).thenReturn(mockAlunos);

        // When
        List<Aluno> result = alunoService.getByFilter(filtro);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(alunoRepository).findByTurmaId(1L);
    }

    @Test
    @DisplayName("Should return all alunos when filter is empty")
    void testGetByFilterEmpty() {
        // Given
        FiltroAlunoDTO filtro = new FiltroAlunoDTO();
        List<Aluno> mockAlunos = Arrays.asList(alunoMock);
        when(alunoRepository.findAll()).thenReturn(mockAlunos);

        // When
        List<Aluno> result = alunoService.getByFilter(filtro);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(alunoRepository).findAll();
    }

    @Test
    @DisplayName("Should update aluno successfully")
    void testUpdateAluno() {
        // Given
        Aluno updatedInfo = new Aluno();
        updatedInfo.setNome("João Silva Updated");
        updatedInfo.setMatricula("20251");
        updatedInfo.setDataNascimento(LocalDate.of(2001, 6, 20));
        updatedInfo.setCursoId(2L);
        updatedInfo.setTurmaId(2L);
        updatedInfo.setContato("(11) 99999-9999");
        updatedInfo.setEndereco(alunoMock.getEndereco());

        when(alunoRepository.findById(1L)).thenReturn(Optional.of(alunoMock));
        when(alunoRepository.save(any(Aluno.class))).thenReturn(alunoMock);

        // When
        Optional<Aluno> result = alunoService.update(1L, updatedInfo);

        // Then
        assertTrue(result.isPresent());
        verify(alunoRepository).findById(1L);
        verify(alunoRepository).save(any(Aluno.class));
    }

    @Test
    @DisplayName("Should return empty when updating non-existent aluno")
    void testUpdateAlunoNotFound() {
        // Given
        when(alunoRepository.findById(999L)).thenReturn(Optional.empty());

        // When
        Optional<Aluno> result = alunoService.update(999L, alunoMock);

        // Then
        assertFalse(result.isPresent());
        verify(alunoRepository).findById(999L);
        verify(alunoRepository, never()).save(any(Aluno.class));
    }

    @Test
    @DisplayName("Should delete aluno successfully")
    void testDeleteAluno() {
        // Given
        when(alunoRepository.existsById(1L)).thenReturn(true);
        doNothing().when(alunoRepository).deleteById(1L);

        // When
        assertDoesNotThrow(() -> alunoService.delete(1L));

        // Then
        verify(alunoRepository).existsById(1L);
        verify(alunoRepository).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent aluno")
    void testDeleteAlunoNotFound() {
        // Given
        when(alunoRepository.existsById(999L)).thenReturn(false);

        // When & Then
        assertThrows(EmptyResultDataAccessException.class, () -> alunoService.delete(999L));
        verify(alunoRepository).existsById(999L);
        verify(alunoRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Should count alunos correctly")
    void testCountAlunos() {
        // Given
        when(alunoRepository.count()).thenReturn(10L);

        // When
        long count = alunoService.countAlunos();

        // Then
        assertEquals(10L, count);
        verify(alunoRepository).count();
    }
}
