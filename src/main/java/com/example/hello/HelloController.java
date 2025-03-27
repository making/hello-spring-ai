package com.example.hello;

import java.util.stream.Collectors;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.mcp.SyncMcpToolCallbackProvider;
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

	private final SyncMcpToolCallbackProvider mcpTools;

	public HelloController(ChatClient.Builder chatClientBuilder, SyncMcpToolCallbackProvider mcpTools) {
		this.chatClient = chatClientBuilder.build();
		this.mcpTools = mcpTools;
	}

	@GetMapping(path = { "/", "/vanilla" })
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
			.flatMap(flux -> flux.map(String::trim).collect(Collectors.joining()));
	}

	@GetMapping(path = "/datetime")
	public String dateTime(@RequestParam(defaultValue = "What time is it now?") String prompt) {
		return this.chatClient.prompt().messages().user(prompt).tools(new DateTimeTools()).call().content();
	}

	@GetMapping(path = "/mcp")
	public String mcp(@RequestParam(defaultValue = "What time is it now?") String prompt) {
		return this.chatClient.prompt().messages().user(prompt).tools(mcpTools).call().content();
	}

	@PostMapping(path = "/mcp", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public Flux<String> mcpStream(@RequestBody String prompt) {
		return this.chatClient.prompt()
			.messages()
			.user(prompt)
			.tools(mcpTools)
			.stream()
			.content()
			.windowUntil(s -> s.endsWith(".") || s.endsWith("。"))
			.flatMap(flux -> flux.map(String::trim).collect(Collectors.joining()));
	}

}
