import { Route, Routes, Navigate } from "react-router-dom";

import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register";
import { AuthRedirect } from "./pages/AuthRedirect.jsx";
import { Dashboard } from "./pages/Dashboard";
import { StudentDashboard } from "./pages/StudentDashboard.jsx";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Exams } from "./pages/Exams";
import { Seats } from "./pages/Seats";
import { Courses} from "./pages/Courses";
import {Rooms} from "./pages/Rooms";


function App() {

    return (
        <Routes>

            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth" element={<AuthRedirect />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/seats" element={<Seats />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/rooms" element={<Rooms />} />
        </Routes>
    );
}

export default App;