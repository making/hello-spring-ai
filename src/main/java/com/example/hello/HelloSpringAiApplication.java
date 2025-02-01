package com.example.hello;

import am.ik.spring.http.client.RetryableClientHttpRequestInterceptor;
import org.zalando.logbook.spring.LogbookClientHttpRequestInterceptor;

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
	public RestClientCustomizer restClientCustomizer(
			LogbookClientHttpRequestInterceptor logbookClientHttpRequestInterceptor) {
		return restClientBuilder -> restClientBuilder.requestInterceptor(logbookClientHttpRequestInterceptor)
			.requestInterceptor(new RetryableClientHttpRequestInterceptor(new FixedBackOff(1000, 2)));
	}

}
