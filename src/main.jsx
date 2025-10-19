import React from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'        // <— import the CSS above
import FoodDeliveryApp from './FoodDeliveryApp.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <FoodDeliveryApp />
    </React.StrictMode>,
)