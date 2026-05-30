import { useState } from 'react'
import './App.css'
import { Route, Routes, Navigate } from "react-router-dom";

import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { StudentDashboard } from "./pages/StudentDashboard.jsx";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Exams } from "./pages/Exams";
import { Seats } from "./pages/Seats";
import { Courses} from "./pages/Courses";
import { Rooms } from "./pages/Rooms";
import { GradeExams } from "./pages/GradeExams";
import { NotificationsManage } from "./pages/NotificationsManage";


function App() {
    const [count, setCount] = useState(0);

    return (
        <Routes>

            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/seats" element={<Seats />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/grade-exams" element={<GradeExams />} />
            <Route path="/notifications-manage" element={<NotificationsManage />} />
        </Routes>
    );
}

export default App;
