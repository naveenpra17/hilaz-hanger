package com.hilazhanger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration;

@SpringBootApplication(exclude = MailSenderAutoConfiguration.class)
public class HilazHangerApplication {

    public static void main(String[] args) {
        SpringApplication.run(HilazHangerApplication.class, args);
    }
}
