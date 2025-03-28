package com.example.hello;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemory;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.mcp.SyncMcpToolCallbackProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;

@RestController
public class HelloController {

	private final ChatClient chatClient;

	private final SyncMcpToolCallbackProvider mcpTools;

	private final ChatMemory chatMemory = new InMemoryChatMemory();

	public HelloController(ChatClient.Builder chatClientBuilder, SyncMcpToolCallbackProvider mcpTools,
			HttpSession httpSession) {
		this.chatClient = chatClientBuilder
			.defaultAdvisors(new PerSessionMessageChatMemoryAdvisor(this.chatMemory, httpSession))
			.build();
		this.mcpTools = mcpTools;
	}

	@GetMapping(path = "/", produces = MediaType.TEXT_HTML_VALUE)
	public ResponseEntity<Void> index(UriComponentsBuilder uriComponentsBuilder) {
		return ResponseEntity.status(HttpStatus.SEE_OTHER)
			.location(uriComponentsBuilder.path("/index.html").build().toUri())
			.build();
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

	@DeleteMapping(path = "/clear")
	public void clearChatMemory(HttpSession session) {
		this.chatMemory.clear(session.getId());
	}

	@GetMapping(path = "/messages")
	public List<Message> chatMessages(HttpSession session,
			@RequestParam(required = false, defaultValue = "30") int lastN) {
		return this.chatMemory.get(session.getId(), lastN);
	}

}
