import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./msalConfig.js";

const pca = new PublicClientApplication(msalConfig);
window.msalInstance = pca;

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <MsalProvider instance={pca}>
                <App/>
            </MsalProvider>
        </BrowserRouter>
    </StrictMode>,
)
