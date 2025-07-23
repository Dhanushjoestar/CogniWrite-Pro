package com.cogniwritepro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class CogniWriteProApplication {

	public static void main(String[] args) {
		SpringApplication.run(CogniWriteProApplication.class, args);
	}


	@Bean  // Add this method
	public RestTemplate restTemplate() {
		return new RestTemplate();
	}
}