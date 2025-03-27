import { useState } from 'react'
import { MessageCircle, Send, Loader2 } from 'lucide-react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
      const response = await fetch(`/mcp?${params}`)
      
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

  return (
    <div className="app-container">
      <header className="header">
        <MessageCircle />
        <h1>AI Prompt</h1>
      </header>

      <main>
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