# Hello Spring AI

Hello Spring AI is a Spring Boot application that provides a chat interface with various functionalities, including joke generation and real-time date and time responses.

## Features

- **Chat Interface**: Interact with the application using prompts to receive responses.
- **Streaming Responses**: Get real-time responses for prompts.
- **Date and Time**: Query the current date and time.
- **MCP Integration**: Utilize MCP tools for enhanced functionality.

## Endpoints

### GET /

Returns a response based on a user-provided prompt. Default prompt is "Tell me a joke".

**Request Parameters:**
- `prompt` (optional): The prompt to send to the chat client. Default value is "Tell me a joke".

### POST /

Streams responses based on a user-provided prompt.

**Request Body:**
- The prompt to send to the chat client.

**Content-Type:** `text/plain`

### GET /datetime

Returns the current date and time based on a user prompt. Default prompt is "What time is it now?".

**Request Parameters:**
- `prompt` (optional): The prompt to send to the chat client. Default value is "What time is it now?".

### GET /mcp

Interacts with MCP tools based on a user prompt. Default prompt is "What time is it now?".

**Request Parameters:**
- `prompt` (optional): The prompt to send to the chat client. Default value is "What time is it now?".

## Installation

To run the application, ensure you have Java and Maven installed. Clone the repository and run:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--spring.ai.openai.api-key=sk-YOUR_API_KEY
```

## Usage

Access the application at `http://localhost:8080` and interact with the endpoints.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue.

## License

This project is licensed under the MIT License.