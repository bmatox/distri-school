package br.com.distrischool.user_service.exception;

public class EmailAlreadyUsedException extends RuntimeException {
  public EmailAlreadyUsedException(String message) { super(message); }
}
