package com.exammanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class ExamManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamManagementApplication.class, args);
    }
}
