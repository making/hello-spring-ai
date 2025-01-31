package com.example.hello;

import java.util.stream.Collectors;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
public class HelloController {

	private final ChatClient chatClient;

	public HelloController(ChatClient.Builder chatClientBuilder) {
		this.chatClient = chatClientBuilder.build();
	}

	@GetMapping(path = "/")
	public String hello(@RequestParam(defaultValue = "Tell me a joke") String prompt) {
		return this.chatClient.prompt().messages().user(prompt).call().content();
	}

	@PostMapping(path = "/", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public Flux<String> helloStream(@RequestBody String prompt) {
		return this.chatClient.prompt()
			.messages()
			.user(prompt)
			.stream()
			.content()
			.windowUntil(s -> s.endsWith(".") || s.endsWith("。"))
			.flatMap(flux -> flux.collect(Collectors.joining()));
	}

}
