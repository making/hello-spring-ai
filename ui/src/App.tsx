import { useState, ChangeEvent, FormEvent } from 'react';
import { Loader2, MessageCircle, Send, Settings } from 'lucide-react';
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

interface ResponseDisplayProps {
    response: string;
    endpoint: string;
}

// Endpoint option component
const EndpointOption: React.FC<EndpointOptionProps> = ({id, value, label, description, checked, onChange}) => {
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
const EndpointSelector: React.FC<EndpointSelectorProps> = ({endpoint, onEndpointChange, endpointOptions}) => {
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

// Response display component
const ResponseDisplay: React.FC<ResponseDisplayProps> = ({response, endpoint}) => {
    if (!response) return null;

    return (
        <div className="response-container">
            <div className="response-header">
                <MessageCircle/>
                <h2>Response:</h2>
                <span className="endpoint-badge">{endpoint.substring(1)}</span>
            </div>
            <div className="response-content">
                {response}
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [endpoint, setEndpoint] = useState('/vanilla');

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
        setResponse('');

        try {
            const params = new URLSearchParams({prompt});
            const response = await fetch(`${endpoint}?${params}`);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.text();
            setResponse(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndpointChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEndpoint(e.target.value);
    };

    const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
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

                <PromptForm
                    prompt={prompt}
                    onPromptChange={handlePromptChange}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />

                <ErrorMessage message={error}/>

                <ResponseDisplay
                    response={response}
                    endpoint={endpoint}
                />
            </main>
        </div>
    );
};

export default App;
