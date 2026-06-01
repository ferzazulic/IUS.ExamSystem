import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {GlassWrapper} from "./components/layout/GlassWrapper.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>


            <App/>

        </BrowserRouter>
    </StrictMode>,
)
