import React, { useEffect, useState } from "react";

// نستخدم متغير البيئة
const API_BASE_URL = process.env.REACT_APP_API_URL;

function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");

  // جلب الطلاب من السيرفر
  useEffect(() => {
    fetch(`${API_BASE_URL}/students`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
      .catch((err) => console.error("حدث خطأ في جلب البيانات:", err));
  }, []);

  // إرسال طالب جديد
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newStudent = { name, points: Number(points) };

    const res = await fetch(`${API_BASE_URL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    });

    const data = await res.json();
    setStudents([...students, data]); // تحديث القائمة
    setName("");
    setPoints("");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>📚 قائمة الطلاب</h1>

      {/* نموذج الإضافة */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="اسم الطالب"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />
        <input
          type="number"
          placeholder="النقاط"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />
        <button type="submit">➕ إضافة</button>
      </form>

      {/* عرض الطلاب */}
      {students.length === 0 ? (
        <p>لا يوجد طلاب حالياً</p>
      ) : (
        <ul>
          {students.map((student) => (
            <li key={student._id}>
              {student.name} - النقاط: {student.points}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
