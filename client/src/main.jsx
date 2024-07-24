import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/main.scss'
import './styles/forms.css'
import './styles/pins.css'
import './styles/login.css'
import './styles/RecipeBook.scss'
import './styles/inputs.scss'

//remove before production
import './styles/testingStyles.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
