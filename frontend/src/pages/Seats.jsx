import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function Seats() {
    const location = useLocation();
    const navigate = useNavigate();

    const exam = location.state;

    // 👤 user
    const user = localStorage.getItem("token");

    // 🔑 KEY PO USERU + EXAMU
    const storageKey = `seating-${user?.email}-${exam?.id}`;

    const rows = Array.from({ length: 12 }, (_, i) =>
        String.fromCharCode(65 + i)
    );

    const seatsPerSide = 6;

    const students = exam?.students?.filter(s => s.enrolled) || [];

    // 💾 LOAD
    const [seatMap, setSeatMap] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : {};
    });

    const [selectedSeat, setSelectedSeat] = useState(null);
    const [history, setHistory] = useState([]);
    const [mode, setMode] = useState("manual");

    // 🔄 SAVE
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(seatMap));
    }, [seatMap, storageKey]);

    // MANUAL
    const assignStudent = (studentName) => {
        if (!selectedSeat) return;

        setHistory(prev => [...prev, seatMap]);

        const updated = { ...seatMap };

        Object.keys(updated).forEach(seat => {
            if (updated[seat] === studentName) {
                delete updated[seat];
            }
        });

        updated[selectedSeat] = studentName;

        setSeatMap(updated);
        setSelectedSeat(null);
    };

    // REMOVE
    const removeStudent = (seatLabel) => {
        setHistory(prev => [...prev, seatMap]);

        const updated = { ...seatMap };
        delete updated[seatLabel];

        setSeatMap(updated);
    };

    // UNDO
    const undo = () => {
        setSeatMap({});
        setHistory([]);
    };

    //AUTO
    const autoAssign = () => {
        let updated = {};

        // 🔀 shuffle students
        const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

        // 🔀 napravi listu svih seatova
        let allSeats = [];

        rows.forEach(row => {
            for (let i = 1; i <= seatsPerSide * 2; i++) {
                allSeats.push(`${row}${i}`);
            }
        });

        // 🔀 shuffle seats
        const shuffledSeats = allSeats.sort(() => Math.random() - 0.5);

        // 🎯 assign
        shuffledStudents.forEach((student, index) => {
            if (shuffledSeats[index]) {
                updated[shuffledSeats[index]] = student.name;
            }
        });

        setHistory(prev => [...prev, seatMap]);
        setSeatMap(updated);
        setMode("auto");
    };

    return (
        <div className="academia-container">

            <div className="page-container exams-header">

                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Dashboard
                </button>

                <div className="title-block">
                    <h1 className="exams-title">Seat Allocation</h1>
                    <p className="exams-sub">
                        {exam?.name} — {exam?.date} — {exam?.time}
                    </p>
                </div>

                <div className="actions-bar">

                    <button
                        className={`mode-btn ${mode === "manual" ? "active" : ""}`}
                        onClick={() => setMode("manual")}
                    >
                        Manual
                    </button>

                    <button
                        className={`mode-btn ${mode === "auto" ? "active" : ""}`}
                        onClick={() => {
                            autoAssign();
                            setMode("auto");
                        }}
                    >
                        Auto Assign
                    </button>

                    <button className="mode-btn danger" onClick={undo}>
                        Undo
                    </button>

                </div>

            </div>

            {/* PICKER */}
            {mode === "manual" && selectedSeat && (
                <div className="page-container student-picker">
                    <span>Assign to {selectedSeat}:</span>

                    <select
                        className="login-input"
                        onChange={(e) => assignStudent(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" disabled>Select student</option>
                        {students.map((s, i) => (
                            <option key={i} value={s.name}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* SEATS */}
            <div className="seats-wrapper">
                {rows.map((row) => (
                    <div className="seat-row" key={row}>

                        {/* LEFT */}
                        {Array.from({ length: seatsPerSide }).map((_, i) => {
                            const label = `${row}${i + 1}`;
                            return (
                                <Seat
                                    key={label}
                                    label={label}
                                    student={seatMap[label]}
                                    onClick={() =>
                                        mode === "manual"
                                            ? seatMap[label]
                                                ? removeStudent(label)
                                                : setSelectedSeat(label)
                                            : null
                                    }
                                />
                            );
                        })}

                        <div className="seat-aisle"></div>

                        {/* RIGHT */}
                        {Array.from({ length: seatsPerSide }).map((_, i) => {
                            const label = `${row}${i + 1 + seatsPerSide}`;
                            return (
                                <Seat
                                    key={label}
                                    label={label}
                                    student={seatMap[label]}
                                    onClick={() =>
                                        mode === "manual"
                                            ? seatMap[label]
                                                ? removeStudent(label)
                                                : setSelectedSeat(label)
                                            : null
                                    }
                                />
                            );
                        })}

                    </div>
                ))}
            </div>

        </div>
    );
}

/* SEAT */
function Seat({ label, student, onClick }) {
    return (
        <div
            className={`seat ${student ? "active" : ""}`}
            onClick={onClick}
        >
            {student ? student : label}
        </div>
    );
}