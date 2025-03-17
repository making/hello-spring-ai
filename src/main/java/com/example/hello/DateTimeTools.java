package com.example.hello;

import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.context.i18n.LocaleContextHolder;

public class DateTimeTools {

	private final Logger logger = LoggerFactory.getLogger(DateTimeTools.class);

	@Tool(description = "Get the current date and time in the user's timezone")
	public String getCurrentDateTime() {
		logger.info("Calling getCurrentDateTime()");
		return LocalDateTime.now().atZone(LocaleContextHolder.getTimeZone().toZoneId()).toString();
	}

}
