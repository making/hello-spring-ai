package com.example.hello;

import java.time.Duration;

import am.ik.spring.http.client.RetryableClientHttpRequestInterceptor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.util.backoff.FixedBackOff;

@SpringBootApplication
public class HelloSpringAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(HelloSpringAiApplication.class, args);
	}


	@Bean
	public RestClientCustomizer restClientCustomizer() {
		return restClientBuilder -> {
			SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
			requestFactory.setReadTimeout(Duration.ofSeconds(2));
			restClientBuilder
					.requestFactory(requestFactory)
					.requestInterceptor(new RetryableClientHttpRequestInterceptor(new FixedBackOff(1000, 2)));
		};
	}
}
