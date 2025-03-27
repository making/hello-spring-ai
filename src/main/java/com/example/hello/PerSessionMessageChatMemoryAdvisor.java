package com.example.hello;

import jakarta.servlet.http.HttpSession;
import org.springframework.ai.chat.client.advisor.AbstractChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.client.advisor.api.AdvisedRequest;
import org.springframework.ai.chat.client.advisor.api.AdvisedResponse;
import org.springframework.ai.chat.client.advisor.api.Advisor;
import org.springframework.ai.chat.client.advisor.api.CallAroundAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAroundAdvisorChain;
import org.springframework.ai.chat.client.advisor.api.StreamAroundAdvisor;
import org.springframework.ai.chat.client.advisor.api.StreamAroundAdvisorChain;
import org.springframework.ai.chat.memory.ChatMemory;
import reactor.core.publisher.Flux;

public class PerSessionMessageChatMemoryAdvisor implements CallAroundAdvisor, StreamAroundAdvisor {

	private final ChatMemory chatMemory;

	private final HttpSession httpSession;

	public PerSessionMessageChatMemoryAdvisor(ChatMemory chatMemory, HttpSession httpSession) {
		this.chatMemory = chatMemory;
		this.httpSession = httpSession;
	}

	@Override
	public AdvisedResponse aroundCall(AdvisedRequest advisedRequest, CallAroundAdvisorChain chain) {
		String sessionId = httpSession.getId();
		MessageChatMemoryAdvisor delegate = new MessageChatMemoryAdvisor(chatMemory, sessionId,
				AbstractChatMemoryAdvisor.DEFAULT_CHAT_MEMORY_RESPONSE_SIZE);
		return delegate.aroundCall(advisedRequest, chain);
	}

	@Override
	public Flux<AdvisedResponse> aroundStream(AdvisedRequest advisedRequest, StreamAroundAdvisorChain chain) {
		String sessionId = httpSession.getId();
		MessageChatMemoryAdvisor delegate = new MessageChatMemoryAdvisor(chatMemory, sessionId,
				AbstractChatMemoryAdvisor.DEFAULT_CHAT_MEMORY_RESPONSE_SIZE);
		return delegate.aroundStream(advisedRequest, chain);
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
