import {ChangeEvent, FormEvent, useState, useEffect} from 'react';
import {Loader2, MessageCircle, Send, Settings, Trash2, User} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './App.css';

// Types definition
interface EndpointOption {
    id: string;
    value: string;
    label: string;
    description: string;
}

interface EndpointOptionProps {
    id: string;
    value: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface EndpointSelectorProps {
    endpoint: string;
    onEndpointChange: (e: ChangeEvent<HTMLInputElement>) => void;
    endpointOptions: EndpointOption[];
}

interface PromptFormProps {
    prompt: string;
    onPromptChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
}

interface ErrorMessageProps {
    message: string;
}

interface Message {
    messageType: 'USER' | 'ASSISTANT';
    metadata: {
        messageType: string;
        finishReason?: string;
        refusal?: string;
        index?: number;
        id?: string;
        role?: string;
    };
    media: any[];
    text: string;
    toolCalls?: any[];
}

interface MessageListProps {
    messages: Message[];
    endpoint: string;
    renderMarkdown: boolean;
}

interface MessageItemProps {
    message: Message;
    endpoint: string;
    renderMarkdown: boolean;
}

interface ClearChatButtonProps {
    onClick: () => void;
    isLoading: boolean;
}

// Endpoint option component
const EndpointOption: React.FC<EndpointOptionProps> = ({
    id,
    value,
    label,
    description,
    checked,
    onChange
}) => {
    return (
        <div className="endpoint-option">
            <input
                type="radio"
                id={id}
                name="endpoint"
                value={value}
                checked={checked}
                onChange={onChange}
            />
            <label htmlFor={id}>
                <strong>{label}</strong>
                <span className="endpoint-description">{description}</span>
            </label>
        </div>
    );
};

// Header component
const Header: React.FC = () => {
    return (
        <header className="header">
            <MessageCircle/>
            <h1>AI Prompt</h1>
        </header>
    );
};

// Endpoint selector component
const EndpointSelector: React.FC<EndpointSelectorProps> = ({
    endpoint,
    onEndpointChange,
    endpointOptions
}) => {
    return (
        <div className="endpoint-selector">
            <div className="endpoint-header">
                <Settings size={18}/>
                <h3>Select Endpoint</h3>
            </div>

            <div className="endpoint-options">
                {endpointOptions.map(option => (
                    <EndpointOption
                        key={option.id}
                        id={option.id}
                        value={option.value}
                        label={option.label}
                        description={option.description}
                        checked={endpoint === option.value}
                        onChange={onEndpointChange}
                    />
                ))}
            </div>
        </div>
    );
};

// Prompt form component
const PromptForm: React.FC<PromptFormProps> = ({prompt, onPromptChange, onSubmit, isLoading}) => {
    return (
        <form onSubmit={onSubmit}>
            <div className="form-group">
                <label htmlFor="prompt">Enter your prompt</label>
                <textarea
                    id="prompt"
                    className="form-control"
                    value={prompt}
                    onChange={onPromptChange}
                    placeholder="What's on your mind?"
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || !prompt.trim()}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="spinner"/>
                        Thinking...
                    </>
                ) : (
                    <>
                        <Send/>
                        Submit
                    </>
                )}
            </button>
        </form>
    );
};

// Error message component
const ErrorMessage: React.FC<ErrorMessageProps> = ({message}) => {
    if (!message) return null;

    return (
        <div className="error-container">
            <p>Error</p>
            <p>{message}</p>
        </div>
    );
};

// Message item component
const MessageItem: React.FC<MessageItemProps> = ({message, endpoint, renderMarkdown}) => {
    const isUser = message.messageType === 'USER';

    return (
        <div className={`message-item ${isUser ? 'user-message' : 'assistant-message'}`}>
            <div className="message-avatar">
                {isUser ? <User size={20} /> : <MessageCircle size={20} />}
            </div>
            <div className="message-content">
                <div className="message-header">
                    <span className="message-sender">{isUser ? 'You' : 'Assistant'}</span>
                    {!isUser && <span className="endpoint-badge">{endpoint.substring(1)}</span>}
                </div>
                <div className="message-text">
                    {renderMarkdown ? (
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                    ) : (
                        message.text
                    )}
                </div>
            </div>
        </div>
    );
};

// Message list component
const MessageList: React.FC<MessageListProps> = ({messages, endpoint, renderMarkdown}) => {
    if (!messages || messages.length === 0) return null;

    return (
        <div className="message-list">
            {messages.map((message, index) => (
                <MessageItem 
                    key={`${message.messageType}-${index}`} 
                    message={message} 
                    endpoint={endpoint}
                    renderMarkdown={renderMarkdown}
                />
            ))}
        </div>
    );
};

interface RenderOptionProps {
    renderMarkdown: boolean;
    onRenderMarkdownChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

// Render option component
const RenderOption: React.FC<RenderOptionProps> = ({
    renderMarkdown,
    onRenderMarkdownChange
}) => {
    return (
        <div className="render-option">
            <label className="checkbox-label">
                <input
                    type="checkbox"
                    checked={renderMarkdown}
                    onChange={onRenderMarkdownChange}
                />
                <span>Render messages as Markdown</span>
            </label>
        </div>
    );
};

// Clear chat button component
const ClearChatButton: React.FC<ClearChatButtonProps> = ({onClick, isLoading}) => {
    return (
        <button
            className="btn btn-danger"
            onClick={onClick}
            disabled={isLoading}
            type="button"
        >
            <Trash2 className="mr-2"/>
            Clear Chat
        </button>
    );
};

const App: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [endpoint, setEndpoint] = useState('/vanilla');
    const [renderMarkdown, setRenderMarkdown] = useState(false); // Default is no rendering

    // Fetch message history when component mounts
    useEffect(() => {
        fetchMessages();
    }, []);

    // Fetch message history
    const fetchMessages = async () => {
        try {
            const response = await fetch('/messages');
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setMessages(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load message history');
        }
    };

    // Endpoint options data
    const endpointOptions: EndpointOption[] = [
        {
            id: "vanilla",
            value: "/vanilla",
            label: "Vanilla Chat",
            description: "Basic chat without any additional tools"
        },
        {
            id: "datetime",
            value: "/datetime",
            label: "DateTime Chat",
            description: "Chat with access to date and time tools"
        },
        {
            id: "mcp",
            value: "/mcp",
            label: "MCP Server",
            description: "Chat connected to the MCP server integration"
        }
    ];

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!prompt.trim()) {
            return;
        }

        setIsLoading(true);
        setError('');

        // Create user message
        const userMessage: Message = {
            messageType: 'USER',
            metadata: {
                messageType: 'USER'
            },
            media: [],
            text: prompt
        };

        // Optimistically add user message to the UI
        setMessages(prevMessages => [...prevMessages, userMessage]);

        // Clear the input field after sending
        setPrompt('');
        try {
            const params = new URLSearchParams({prompt});
            const response = await fetch(`${endpoint}?${params}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const responseText = await response.text();
            
            // Add assistant response to messages
            const assistantMessage: Message = {
                messageType: 'ASSISTANT',
                metadata: {
                    messageType: 'ASSISTANT',
                    finishReason: 'STOP',
                    refusal: '',
                    index: 0,
                    role: 'ASSISTANT'
                },
                media: [],
                text: responseText,
                toolCalls: []
            };

            setMessages(prevMessages => [...prevMessages, assistantMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);


            // Refresh messages to ensure we have the latest state
            await fetchMessages();
        }
    };

    const handleEndpointChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEndpoint(e.target.value);
    };

    const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };
    
    const handleRenderMarkdownChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRenderMarkdown(e.target.checked);
    };

    const handleClearChat = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/clear', {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            // Clear conversation state
            setPrompt('');
            setMessages([]);
            setError('');
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'An error occurred while clearing the chat');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <Header/>

            <main>
                <EndpointSelector
                    endpoint={endpoint}
                    onEndpointChange={handleEndpointChange}
                    endpointOptions={endpointOptions}
                />

                <MessageList 
                    messages={messages} 
                    endpoint={endpoint}
                    renderMarkdown={renderMarkdown}
                />
                
                <RenderOption
                    renderMarkdown={renderMarkdown}
                    onRenderMarkdownChange={handleRenderMarkdownChange}
                />

                <PromptForm
                    prompt={prompt}
                    onPromptChange={handlePromptChange}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />

                <ErrorMessage message={error}/>

                {/* Clear chat button at bottom of page */}
                <div className="clear-chat-container">
                    <ClearChatButton
                        onClick={handleClearChat}
                        isLoading={isLoading}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;