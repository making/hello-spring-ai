package com.example.hello;

import org.springframework.ai.chat.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {
	private final ChatClient chatClient;

	public HelloController(ChatClient chatClient) {
		this.chatClient = chatClient;
	}

	@GetMapping(path = "/")
	public String hello() {
		return this.chatClient.call("Tell me a joke");
	}
}
