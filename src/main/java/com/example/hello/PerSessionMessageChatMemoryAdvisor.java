package com.example.hello;

import jakarta.servlet.http.HttpSession;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.api.Advisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.ai.chat.client.advisor.api.StreamAdvisor;
import org.springframework.ai.chat.client.advisor.api.StreamAdvisorChain;
import org.springframework.ai.chat.memory.ChatMemory;
import reactor.core.publisher.Flux;

public class PerSessionMessageChatMemoryAdvisor implements CallAdvisor, StreamAdvisor {

	private final ChatMemory chatMemory;

	private final HttpSession httpSession;

	public PerSessionMessageChatMemoryAdvisor(ChatMemory chatMemory, HttpSession httpSession) {
		this.chatMemory = chatMemory;
		this.httpSession = httpSession;
	}

	@Override
	public ChatClientResponse adviseCall(ChatClientRequest chatClientRequest, CallAdvisorChain callAdvisorChain) {
		String sessionId = httpSession.getId();
		MessageChatMemoryAdvisor delegate = MessageChatMemoryAdvisor.builder(this.chatMemory)
			.conversationId(sessionId)
			.build();
		return delegate.adviseCall(chatClientRequest, callAdvisorChain);
	}

	@Override
	public Flux<ChatClientResponse> adviseStream(ChatClientRequest chatClientRequest,
			StreamAdvisorChain streamAdvisorChain) {
		String sessionId = httpSession.getId();
		MessageChatMemoryAdvisor delegate = MessageChatMemoryAdvisor.builder(this.chatMemory)
			.conversationId(sessionId)
			.build();
		return delegate.adviseStream(chatClientRequest, streamAdvisorChain);
	}

	@Override
	public String getName() {
		return this.getClass().getSimpleName();
	}

	@Override
	public int getOrder() {
		return Advisor.DEFAULT_CHAT_MEMORY_PRECEDENCE_ORDER;
	}

}
