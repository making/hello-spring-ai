import { useState } from 'react'
import { MessageCircle, Send, Loader2, Settings } from 'lucide-react'
import './App.css'

// Endpoint option component
const EndpointOption = ({ id, value, label, description, checked, onChange }) => {
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
  )
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [endpoint, setEndpoint] = useState('/vanilla')

  // Endpoint options data
  const endpointOptions = [
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
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!prompt.trim()) {
      return
    }

    setIsLoading(true)
    setError('')
    setResponse('')

    try {
      const params = new URLSearchParams({ prompt })
      const response = await fetch(`${endpoint}?${params}`)
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      const data = await response.text()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndpointChange = (e) => {
    setEndpoint(e.target.value)
  }

  return (
    <div className="app-container">
      <header className="header">
        <MessageCircle />
        <h1>AI Prompt</h1>
      </header>

      <main>
        <div className="endpoint-selector">
          <div className="endpoint-header">
            <Settings size={18} />
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
                onChange={handleEndpointChange}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="prompt">Enter your prompt</label>
            <textarea
              id="prompt"
              className="form-control"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
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
                <Loader2 className="spinner" />
                Thinking...
              </>
            ) : (
              <>
                <Send />
                Submit
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="error-container">
            <p>Error</p>
            <p>{error}</p>
          </div>
        )}

        {response && (
          <div className="response-container">
            <div className="response-header">
              <MessageCircle />
              <h2>Response:</h2>
              <span className="endpoint-badge">{endpoint.substring(1)}</span>
            </div>
            <div className="response-content">
              {response}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App