import React, { useEffect, useState } from "react";
import  "./styles/AttendanceReportPage.css";

const API_ATTENDANCE = "https://mern-app-server-production-457d.up.railway.app/api/attendances";
const API_STUDENTS = "https://mern-app-server-production-457d.up.railway.app/api/students";

const AttendanceReportPage = () => {
  const [attendances, setAttendances] = useState([]);
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState("");
  const [range, setRange] = useState({ start: "", end: "" });

  // جلب كل الطلاب (لحساب النسبة)
  useEffect(() => {
    fetch(API_STUDENTS)
      .then((res) => res.json())
      .then(setStudents)
      .catch(console.error);
  }, []);

  // جلب الحضور حسب التاريخ أو الفترة
  useEffect(() => {
    let query = "";
    if (date) {
      query = `?date=${date}`;
    } else if (range.start || range.end) {
      const start = range.start ? `start=${range.start}` : "";
      const end = range.end ? `end=${range.end}` : "";
      query = `?${start}&${end}`;
    }

    fetch(`${API_ATTENDANCE}${query}`)
      .then((res) => res.json())
      .then(setAttendances)
      .catch(console.error);
  }, [date, range]);

  // أسماء الطلاب الذين حضروا
  const attendedStudents = attendances
    .map((a) => a.studentId)
    .filter((s) => s && s.name);

  const uniqueAttended = Array.from(
    new Map(attendedStudents.map((s) => [s._id, s])).values()
  );

  const attendanceRate = students.length
    ? Math.round((uniqueAttended.length / students.length) * 100)
    : 0;

  return (
    <div className="attendance-report">
      <h2>تقرير الحضور</h2>

      {/* اختيار التاريخ أو الفترة */}
      <div className="filters">
        <label>📅 تاريخ محدد:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setRange({ start: "", end: "" });
          }}
        />

        <label>أو فترة:</label>
        <input
          type="date"
          placeholder="من"
          value={range.start}
          onChange={(e) => {
            setDate("");
            setRange({ ...range, start: e.target.value });
          }}
        />
        <input
          type="date"
          placeholder="إلى"
          value={range.end}
          onChange={(e) => {
            setDate("");
            setRange({ ...range, end: e.target.value });
          }}
        />
      </div>

      <h3>عدد الحاضرين: {uniqueAttended.length}</h3>
      <h3>نسبة الحضور: {attendanceRate}%</h3>

      {/* قائمة الطلاب الحاضرين */}
      <ul className="attended-students">
        {uniqueAttended.map((student) => (
          <li key={student._id}>
            {student.name} – رقم الأهل: {student.parentContact || "غير متوفر"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AttendanceReportPage;
