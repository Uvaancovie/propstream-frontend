import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// Import API config test - remove this after testing
import './utils/apiConfigTest.js'

createRoot(document.getElementById('root')).render(
  <App />
)
