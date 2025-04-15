import {ChangeEvent, FormEvent, useState, useEffect} from 'react';
import {Loader2, Send, Settings, Trash2, User, Info, Brain} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

// Types definition
interface ApiInfo {
    genai: {
        'base-url': string;
        'completions-path': string;
        model: string;
        temperature: string;
    };
    build?: {
        spring?: {
            ai?: {
                version: string;
            };
            boot?: {
                version: string;
            };
            framework?: {
                version: string;
            };
        };
    };
}

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
    media: Array<unknown>;
    text: string;
    toolCalls?: Array<unknown>;
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

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

interface InfoButtonProps {
    onClick: () => void;
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
interface HeaderProps {
    onInfoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onInfoClick }) => {
    return (
        <header className="header">
            <div className="header-left">
                <Brain color="white" size={24} />
                <h1>Spring AI Chat</h1>
            </div>
            <div className="header-right">
                <InfoButton onClick={onInfoClick} />
            </div>
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
                <Settings size={16}/>
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
    const isLoading = message.messageType === 'ASSISTANT' && message.text === '...';

    return (
        <div className={`message-item ${isUser ? 'user-message' : 'assistant-message'}`}>
            {/* Increased icon size from 16 to 20 for better visibility and alignment */}
            <div className="message-avatar">
                {isUser ? <User size={20} /> : <Brain size={20} color="#76b82a" />}
            </div>
            <div className="message-content">
                <div className="message-header">
                    <span className="message-sender">{isUser ? 'You' : 'Assistant'}</span>
                    {!isUser && <span className="endpoint-badge">{endpoint.substring(1)}</span>}
                </div>
                <div className="message-text">
                    {isLoading ? (
                        <div className="loading-message">
                            <Loader2 size={16} className="spinner" />
                            <span>Thinking...</span>
                        </div>
                    ) : renderMarkdown ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
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

// Modal component
const Modal: React.FC<ModalProps> = ({isOpen, onClose, title, children}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button 
                        className="modal-close" 
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Info button component
const InfoButton: React.FC<InfoButtonProps> = ({onClick}) => {
    return (
        <button 
            className="info-button" 
            onClick={onClick}
            title="Show API and Framework Info"
            aria-label="Show API and Framework Information"
        >
            <Info size={16} />
        </button>
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
    const [renderMarkdown, setRenderMarkdown] = useState(true); // Default is now true for Markdown rendering
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null);

    // Fetch message history when component mounts
    useEffect(() => {
        fetchMessages();
    }, []);
    
    // Fetch API info
    const fetchApiInfo = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/actuator/info');
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            setApiInfo(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load API information');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handle info button click
    const handleInfoButtonClick = () => {
        // Only fetch API info if it hasn't been loaded yet
        if (!apiInfo) {
            fetchApiInfo();
        }
        setIsInfoModalOpen(true);
    };
    
    // Handle modal close
    const handleCloseModal = () => {
        setIsInfoModalOpen(false);
    };

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

        // Create initial loading placeholder message from assistant
        const loadingMessage: Message = {
            messageType: 'ASSISTANT',
            metadata: {
                messageType: 'ASSISTANT',
                finishReason: 'STOP',
                refusal: '',
                index: 0,
                role: 'ASSISTANT'
            },
            media: [],
            text: '...',
            toolCalls: []
        };

        // Add both user message and loading message to the UI
        setMessages(prevMessages => [...prevMessages, userMessage, loadingMessage]);

        // Clear the input field after sending
        setPrompt('');
        try {
            const params = new URLSearchParams({prompt});
            const response = await fetch(`${endpoint}?${params}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const responseText = await response.text();
            
            // Replace loading message with actual assistant response
            setMessages(prevMessages => {
                // Create a copy of messages but replace the last one (loading message)
                // with the actual response
                const updatedMessages = [...prevMessages];
                if (updatedMessages.length > 0) {
                    // Update the last message (loading message) with the actual response
                    updatedMessages[updatedMessages.length - 1] = {
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
                }
                return updatedMessages;
            });
        } catch (err) {
            // In case of error, remove the loading message and show error
            setMessages(prevMessages => {
                // Remove the loading message
                const updatedMessages = [...prevMessages];
                if (updatedMessages.length > 0) {
                    updatedMessages.pop();
                }
                return updatedMessages;
            });
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);

            // We don't need to fetch messages here anymore since we're
            // managing the state directly
            // await fetchMessages();
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
            <Header
                onInfoClick={handleInfoButtonClick}
            />

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

            {/* API Info Modal */}
            <Modal
                isOpen={isInfoModalOpen}
                onClose={handleCloseModal}
                title="API Information"
            >
                {apiInfo ? (
                    <div className="api-info">
                        <h3>OpenAI API</h3>
                        <div className="api-info-item">
                            <strong>API URL:</strong> 
                            <span>{apiInfo.genai['base-url'] + apiInfo.genai['completions-path']}</span>
                        </div>
                        <div className="api-info-item">
                            <strong>Model:</strong> 
                            <span>{apiInfo.genai.model}</span>
                        </div>
                        <div className="api-info-item">
                            <strong>Temperature:</strong> 
                            <span>{apiInfo.genai.temperature}</span>
                        </div>
                        
                        {apiInfo.build?.spring && (
                            <>
                                <h3>Spring Framework</h3>
                                {apiInfo.build.spring.ai && (
                                    <div className="api-info-item">
                                        <strong>Spring AI:</strong> 
                                        <span>{apiInfo.build.spring.ai.version}</span>
                                    </div>
                                )}
                                {apiInfo.build.spring.boot && (
                                    <div className="api-info-item">
                                        <strong>Spring Boot:</strong> 
                                        <span>{apiInfo.build.spring.boot.version}</span>
                                    </div>
                                )}
                                {apiInfo.build.spring.framework && (
                                    <div className="api-info-item">
                                        <strong>Spring Framework:</strong> 
                                        <span>{apiInfo.build.spring.framework.version}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="api-info-loading">
                        <Loader2 className="spinner"/> 
                        Loading API information...
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default App;