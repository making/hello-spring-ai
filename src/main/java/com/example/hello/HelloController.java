package com.example.hello;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
	private final ChatClient chatClient;

	public HelloController(ChatClient.Builder chatClientBuilder) {
		this.chatClient = chatClientBuilder.build();
	}

	@GetMapping(path = "/")
	public String hello() {
		return this.chatClient.prompt()
				.messages()
				.user("Tell me a joke").call().content();
	}
}
