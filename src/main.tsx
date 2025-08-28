import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";

import "./main.css"
import "./index.css"

import App from "./App.tsx"
import { ErrorFallback } from "./ErrorFallback.tsx"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback} onError={console.error}>
    <App />
  </ErrorBoundary>
)