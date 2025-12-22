package br.com.distrischool.grades;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GradesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GradesServiceApplication.class, args);
    }
}
