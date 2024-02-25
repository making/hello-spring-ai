package com.example.hello;

import am.ik.spring.http.client.RetryableClientHttpRequestInterceptor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.util.backoff.FixedBackOff;

@SpringBootApplication
public class HelloSpringAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(HelloSpringAiApplication.class, args);
	}


	@Bean
	public RestClientCustomizer restClientCustomizer() {
		return restClientBuilder -> restClientBuilder.requestInterceptor(new RetryableClientHttpRequestInterceptor(new FixedBackOff(1000, 2)));
	}
}
