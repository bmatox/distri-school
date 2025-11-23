package br.com.distrischool.grades.exception;

public class GradeNotFoundException extends RuntimeException {
    public GradeNotFoundException(String message) {
        super(message);
    }
    
    public GradeNotFoundException(Long id) {
        super("Grade not found with id: " + id);
    }
}
