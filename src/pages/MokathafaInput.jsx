import React, { useState, useEffect } from "react";
import "./MokathafaInput.css";

const API_URL = "https://mern-app-server-production-457d.up.railway.app/api";

const emptySession = {
  studentId: "",
  studentName: "",
  pageNumber: "",
  tajweedMark: "",
  hifzMark: "",
  type: "جديد",
  date: new Date().toISOString().split("T")[0],
  isSaved: false,
};

const MokathafaInput = () => {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("mokathafa_sessions");
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("mokathafa_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    fetch(`${API_URL}/students`)
      .then((res) => res.json())
      .then((data) => setStudents(data));
  }, []);

  const handleAddSession = () => {
    setSessions([...sessions, { ...emptySession }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...sessions];
    updated[index][field] = value;
    updated[index].isSaved = false;

    if (field === "studentName") {
      const found = students.find(
        (s) => s.name === value || s._id === value
      );
      if (found) {
        updated[index].studentId = found._id;
        updated[index].studentName = found.name;
      }
    }

    setSessions(updated);
  };

  const handleDelete = async (index) => {
    const target = sessions[index];

    if (target.isSaved && target._id) {
      const confirmDelete = window.confirm("هل تريد حذف الجلسة من قاعدة البيانات؟");
      if (!confirmDelete) return;

      try {
        await fetch(`${API_URL}/sessions/${target._id}`, { method: "DELETE" });
      } catch {
        alert("⚠️ فشل حذف الجلسة من قاعدة البيانات");
        return;
      }
    }

    const updated = [...sessions];
    updated.splice(index, 1);
    setSessions(updated);
  };

  const handleSend = async () => {
    try {
      const updated = [...sessions];

      for (let i = 0; i < updated.length; i++) {
        const session = updated[i];

        if (!session.isSaved) {
          if (session._id) {
            await fetch(`${API_URL}/sessions/${session._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(session),
            });
          } else {
            const res = await fetch(`${API_URL}/sessions`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(session),
            });
            const data = await res.json();
            updated[i]._id = data._id;
          }

          updated[i].isSaved = true;
        }
      }

      setSessions(updated);
      localStorage.removeItem("mokathafa_sessions");
    } catch {
      alert("⚠️ حدث خطأ أثناء الإرسال، تأكد من الاتصال بالإنترنت.");
    }
  };

  const handleUpdate = async (index) => {
    const session = sessions[index];
    try {
      await fetch(`${API_URL}/sessions/${session._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });

      const updated = [...sessions];
      updated[index].isSaved = true;
      setSessions(updated);
    } catch {
      alert("⚠️ فشل تعديل الجلسة");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("mokathafa_sessions");
    const localSessions = saved ? JSON.parse(saved) : [];

    fetch(`${API_URL}/sessions`)
      .then((res) => res.json())
      .then((apiSessions) => {
        const formatted = apiSessions.map((s) => ({
          ...s,
          studentId: s.studentId?._id || s.studentId,
          studentName: s.studentId?.name || s.studentName,
          isSaved: true,
        }));
        setSessions([...formatted, ...localSessions]);
      })
      .catch((err) => console.error("فشل تحميل الجلسات:", err));
  }, []);

  const filteredSessions = sessions.filter(
    (s) =>
      (!filterDate || s.date === filterDate) &&
      (!filterName || s.studentName.toLowerCase().includes(filterName.toLowerCase()))
  );

  return (
    <div className="container">
      <h1>📖 إضافة تسميعات المكثفة</h1>

      {/* الفلاتر */}
      <div className="filters">
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="🔍 الاسم أو الرقم"
          list="studentsList"
        />
        <datalist id="studentsList">
          {students.map((s) => (
            <option key={s._id} value={s.name} />
          ))}
        </datalist>
      </div>

      {/* عرض الجلسات */}
      {filteredSessions.map((s, i) => (
        <div key={i} className={`session ${s.isSaved ? "saved" : "unsaved"}`}>
          <div className="session-header">
          <button className="delete-btn" onClick={() => handleDelete(i)}>حذف ✖</button>

            <strong>{s.studentName || "بدون اسم"}</strong>{" "}
            {s.isSaved ? "محفوظ ✅" : "📍غير مرسل"}
          </div>

          <div className="session-body">
            <select
              value={s.studentId}
              onChange={(e) => {
                const selected = students.find((stu) => stu._id === e.target.value);
                handleChange(i, "studentId", e.target.value);
                handleChange(i, "studentName", selected?.name || "");
              }}>
              <option value="">-- اختر الطالب --</option>
              {students.map((stu) => (
                <option key={stu._id} value={stu._id}>{stu.name}</option>
              ))}
            </select>

            <input
              type="number"
              value={s.pageNumber}
              onChange={(e) => handleChange(i, "pageNumber", e.target.value)}
              placeholder="رقم الصفحة"
            />
            <input
              type="number"
              value={s.tajweedMark}
              onChange={(e) => handleChange(i, "tajweedMark", e.target.value)}
              placeholder="علامة التجويد"
            />
            <input
              type="number"
              value={s.hifzMark}
              onChange={(e) => handleChange(i, "hifzMark", e.target.value)}
              placeholder="علامة الحفظ"
            />
            <select value={s.type} onChange={(e) => handleChange(i, "type", e.target.value)}>
              <option value="جديد">جديد</option>
              <option value="مراجعة">مراجعة</option>
            </select>
            <input
              type="date"
              value={s.date}
              onChange={(e) => handleChange(i, "date", e.target.value)}
            />

            {s._id && (
              <button className="update-btn" onClick={() => handleUpdate(i)}>
                💾 حفظ التعديلات
              </button>
            )}
          </div>

          {(s.hifzMark < 3 || s.tajweedMark < 3) && (
            <div className="alert">⚠️ العلامة منخفضة جداً!</div>
          )}
        </div>
      ))}

      {/* أزرار عامة */}
      <div className="actions">
        <button onClick={handleAddSession}>➕ إضافة تسميع جديد</button>
        <button onClick={handleSend}>🚀 إرسال التسميعات</button>
      </div>
    </div>
  );
};

export default MokathafaInput;
