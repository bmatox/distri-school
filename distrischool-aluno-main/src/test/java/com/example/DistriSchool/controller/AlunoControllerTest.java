package com.example.DistriSchool.controller;

import com.example.DistriSchool.domain.Aluno;
import com.example.DistriSchool.domain.Endereco;
import com.example.DistriSchool.service.AlunoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AlunoController.class)
@DisplayName("AlunoController Integration Tests")
class AlunoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AlunoService alunoService;

    private Aluno alunoMock;

    @BeforeEach
    void setUp() {
        alunoMock = new Aluno();
        alunoMock.setId(1L);
        alunoMock.setNome("João Silva");
        alunoMock.setMatricula("20251");
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
    @WithMockUser
    @DisplayName("POST /alunos should create aluno and return 201")
    void testCreateAluno() throws Exception {
        // Given
        when(alunoService.save(any(Aluno.class))).thenReturn(alunoMock);

        // When & Then
        mockMvc.perform(post("/alunos")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alunoMock)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("João Silva"))
                .andExpect(jsonPath("$.matricula").value("20251"));

        verify(alunoService).save(any(Aluno.class));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /alunos should return 400 for invalid aluno (missing nome)")
    void testCreateAlunoInvalidNome() throws Exception {
        // Given
        alunoMock.setNome("");

        // When & Then
        mockMvc.perform(post("/alunos")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alunoMock)))
                .andExpect(status().isBadRequest());

        verify(alunoService, never()).save(any(Aluno.class));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /alunos should return 400 for invalid contato (too short)")
    void testCreateAlunoInvalidContato() throws Exception {
        // Given
        alunoMock.setContato("123");

        // When & Then
        mockMvc.perform(post("/alunos")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alunoMock)))
                .andExpect(status().isBadRequest());

        verify(alunoService, never()).save(any(Aluno.class));
    }

    @Test
    @WithMockUser
    @DisplayName("POST /alunos should return 400 for invalid dataNascimento (future date)")
    void testCreateAlunoInvalidDataNascimento() throws Exception {
        // Given
        alunoMock.setDataNascimento(LocalDate.now().plusDays(1));

        // When & Then
        mockMvc.perform(post("/alunos")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alunoMock)))
                .andExpect(status().isBadRequest());

        verify(alunoService, never()).save(any(Aluno.class));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /alunos should return all alunos")
    void testSearchAlunos() throws Exception {
        // Given
        List<Aluno> alunos = Arrays.asList(alunoMock);
        when(alunoService.getByFilter(any())).thenReturn(alunos);

        // When & Then
        mockMvc.perform(get("/alunos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("João Silva"));

        verify(alunoService).getByFilter(any());
    }

    @Test
    @WithMockUser
    @DisplayName("GET /alunos/{id} should return aluno when found")
    void testSearchAlunoById() throws Exception {
        // Given
        when(alunoService.getById(1L)).thenReturn(Optional.of(alunoMock));

        // When & Then
        mockMvc.perform(get("/alunos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("João Silva"));

        verify(alunoService).getById(1L);
    }

    @Test
    @WithMockUser
    @DisplayName("GET /alunos/{id} should return 404 when aluno not found")
    void testSearchAlunoByIdNotFound() throws Exception {
        // Given
        when(alunoService.getById(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/alunos/999"))
                .andExpect(status().isNotFound());

        verify(alunoService).getById(999L);
    }

    @Test
    @WithMockUser
    @DisplayName("GET /alunos/matricula/{matricula} should return aluno when found")
    void testSearchAlunoByMatricula() throws Exception {
        // Given
        when(alunoService.getByMatricula("20251")).thenReturn(Optional.of(alunoMock));

        // When & Then
        mockMvc.perform(get("/alunos/matricula/20251"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.matricula").value("20251"));

        verify(alunoService).getByMatricula("20251");
    }

    @Test
    @WithMockUser
    @DisplayName("GET /alunos/matricula/{matricula} should return 404 when not found")
    void testSearchAlunoByMatriculaNotFound() throws Exception {
        // Given
        when(alunoService.getByMatricula("99999")).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/alunos/matricula/99999"))
                .andExpect(status().isNotFound());

        verify(alunoService).getByMatricula("99999");
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /alunos/{id} should update aluno and return 200")
    void testUpdateAluno() throws Exception {
        // Given
        when(alunoService.update(eq(1L), any(Aluno.class))).thenReturn(Optional.of(alunoMock));

        // When & Then
        mockMvc.perform(put("/alunos/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alunoMock)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));

        verify(alunoService).update(eq(1L), any(Aluno.class));
    }

    @Test
    @WithMockUser
    @DisplayName("PUT /alunos/{id} should return 404 when aluno not found")
    void testUpdateAlunoNotFound() throws Exception {
        // Given
        when(alunoService.update(eq(999L), any(Aluno.class))).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(put("/alunos/999")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(alunoMock)))
                .andExpect(status().isNotFound());

        verify(alunoService).update(eq(999L), any(Aluno.class));
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /alunos/{id} should delete aluno and return 204")
    void testDeleteAluno() throws Exception {
        // Given
        doNothing().when(alunoService).delete(1L);

        // When & Then
        mockMvc.perform(delete("/alunos/1")
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(alunoService).delete(1L);
    }

    @Test
    @WithMockUser
    @DisplayName("DELETE /alunos/{id} should return 404 when aluno not found")
    void testDeleteAlunoNotFound() throws Exception {
        // Given
        doThrow(new EmptyResultDataAccessException(1)).when(alunoService).delete(999L);

        // When & Then
        mockMvc.perform(delete("/alunos/999")
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(alunoService).delete(999L);
    }

    @Test
    @WithMockUser
    @DisplayName("GET /alunos/next-matricula should return next matricula")
    void testGetNextMatricula() throws Exception {
        // Given
        when(alunoService.countAlunos()).thenReturn(5L);

        // When & Then
        mockMvc.perform(get("/alunos/next-matricula"))
                .andExpect(status().isOk())
                .andExpect(content().string(java.time.Year.now().toString() + "6"));

        verify(alunoService).countAlunos();
    }
}
