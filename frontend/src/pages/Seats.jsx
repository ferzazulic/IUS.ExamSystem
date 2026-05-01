import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

//  PREDEFINED ROOMS
const rooms = [
    { id: 1, name: "Sports Hall", capacity: 200 },
    { id: 2, name: "BF1.17", capacity: 40 },
    { id: 3, name: "BF2.15", capacity: 80 },
    { id: 4, name: "BF1.18", capacity: 35 },
    { id: 5, name: "BF2.10", capacity: 60 }
];

export function Seats() {
    const location = useLocation();
    const navigate = useNavigate();

    const exam = location.state;

    const user = localStorage.getItem("token");
    const storageKey = `seating-${user?.email}-${exam?.id}`;

    //  ROOM + CAPACITY
    const room = rooms.find(r => r.id == exam?.roomId);
    const capacity = room?.capacity || 0;

    let numRows;
    let seatsPerRow;


    if (capacity >= 150) {
        seatsPerRow = 8; //
        numRows = Math.ceil(capacity / seatsPerRow);
    } else {
        numRows = Math.ceil(Math.sqrt(capacity));
        seatsPerRow = Math.ceil(capacity / numRows);
    }
    const seatsPerSide = Math.ceil(seatsPerRow / 2);

    const rows = Array.from({ length: numRows }, (_, i) =>
        String.fromCharCode(65 + i)
    );

    //  NEW STUDENT MODEL
    const students = exam?.students || [];

    //  LOAD
    const [seatMap, setSeatMap] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : {};
    });

    const [selectedSeat, setSelectedSeat] = useState(null);
    const [history, setHistory] = useState([]);
    const [mode, setMode] = useState("manual");

    // 💾 SAVE
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(seatMap));
    }, [seatMap, storageKey]);

    // 🔧 MANUAL ASSIGN
    const assignStudent = (student) => {
        if (!selectedSeat) return;

        setHistory(prev => [...prev, seatMap]);

        const updated = { ...seatMap };

        // ukloni ako već sjedi
        Object.keys(updated).forEach(seat => {
            if (updated[seat] === student) {
                delete updated[seat];
            }
        });

        updated[selectedSeat] = student;

        setSeatMap(updated);
        setSelectedSeat(null);
    };

    //  REMOVE
    const removeStudent = (seatLabel) => {
        setHistory(prev => [...prev, seatMap]);

        const updated = { ...seatMap };
        delete updated[seatLabel];

        setSeatMap(updated);
    };

    // ↩ UNDO (reset)
    const undo = () => {
        setSeatMap({});
        setHistory([]);
    };

    //  AUTO ASSIGN (random + spacing)
    const autoAssign = () => {
        let updated = {};

        const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

        let allSeats = [];

        rows.forEach(row => {
            for (let i = 1; i <= seatsPerRow; i++) {
                allSeats.push(`${row}${i}`);
            }
        });


        const spacedSeats = allSeats.filter((_, i) => i % 2 === 0);

        shuffledStudents.forEach((student, index) => {
            if (spacedSeats[index]) {
                updated[spacedSeats[index]] = student;
            }
        });

        setHistory(prev => [...prev, seatMap]);
        setSeatMap(updated);
        setMode("auto");
    };

    return (
        <div className="academia-container">

            {/* HEADER */}
            <div className="page-container exams-header">

                <button className="back-btn" onClick={() => navigate(-1)}>
                    ← Dashboard
                </button>

                <div className="title-block">
                    <h1 className="exams-title">Seat Allocation</h1>
                    <p className="exams-sub">
                        {exam?.course} — {exam?.date} — {exam?.time}
                        <br />
                        Room: {room?.name} ({capacity} seats)
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
                        onClick={autoAssign}
                    >
                        Auto Assign
                    </button>

                    <button className="mode-btn danger" onClick={undo}>
                        Reset
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
                            <option key={i} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* SEATS */}
            <div className="seats-wrapper">
                {rows.map((row, rowIndex) => {

                    const start = rowIndex * seatsPerRow;
                    const end = Math.min(start + seatsPerRow, capacity);

                    const rowSeats = [];

                    for (let i = start; i < end; i++) {
                        const col = i - start;
                        const label = `${row}${col + 1}`;
                        rowSeats.push(label);
                    }

                    if (rowSeats.length === 0) return null;

                    return (
                        <div
                            className="seat-row"
                            key={row}
                            style={{
                                justifyContent: "center" // 🔥 CENTRIRA red
                            }}
                        >
                            {rowSeats.map(label => (
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
                            ))}
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

// 🪑 SEAT COMPONENT
function Seat({ label, student, onClick }) {
    return (
        <div
            className={`seat ${student ? "active" : ""}`}
            onClick={onClick}
        >
            {student || label}
        </div>
    );
}