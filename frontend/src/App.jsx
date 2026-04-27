import {useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import {Route, Routes} from "react-router-dom";
import {Login} from "./pages/Login.jsx";
import { Register } from "./pages/Register";
import {Home} from "./pages/Home.jsx";
import { Dashboard } from "./pages/Dashboard";
import {GlassWrapper} from "./components/layout/GlassWrapper.jsx";
import { Exams } from "./pages/Exams";
import { Seats } from "./pages/Seats";


function App() {
    const [count, setCount] = useState(0)

    return (
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/exams" element={<Exams />} />
                <Route path="/seats" element={<Seats />} />
            </Routes>
    )
}

export default App
