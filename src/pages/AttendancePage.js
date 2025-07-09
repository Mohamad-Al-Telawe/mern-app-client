import React, { useEffect, useState } from "react";
import "./styles/AttendancePage.css";

const API_STUDENTS =
   "https://mern-app-server-production-457d.up.railway.app/api/students";
const API_ATTENDANCE =
   "https://mern-app-server-production-457d.up.railway.app/api/attendances";

const AttendancePage = () => {
   const [students, setStudents] = useState([]);
   const [todayAttendance, setTodayAttendance] = useState([]);
   const [loading, setLoading] = useState(false);
   const [filters, setFilters] = useState({ level: "", group: "", grade: "" });
   const [search, setSearch] = useState("");
   const [selectedDate, setSelectedDate] = useState(
      new Date().toISOString().split("T")[0]
   );
   const [timeInputs, setTimeInputs] = useState({});
   const [hifzStatusInputs, setHifzStatusInputs] = useState({});

   // ✅ جلب الطلاب مرة واحدة
   useEffect(() => {
      fetch(API_STUDENTS)
         .then((res) => res.json())
         .then(setStudents)
         .catch(console.error);
   }, []);

   // ✅ جلب الحضور حسب التاريخ
   useEffect(() => {
      fetch(`${API_ATTENDANCE}?date=${selectedDate}`)
         .then((res) => res.json())
         .then(setTodayAttendance)
         .catch(console.error);
   }, [selectedDate]);

   const handleAttend = async (studentId) => {
      setLoading(true);
      const timeIn = timeInputs[studentId] || null;
      const hifz = hifzStatusInputs[studentId] || "غير حافظ";

      try {
         const res = await fetch(API_ATTENDANCE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               studentId,
               date: selectedDate,
               timeIn: timeIn ? `${selectedDate}T${timeIn}` : undefined,
               hifz,
            }),
         });

         if (res.ok) {
            const newEntry = await res.json();
            setTodayAttendance((prev) => [...prev, newEntry]);
         } else {
            alert("فشل في تسجيل الحضور");
         }
      } catch (err) {
         console.error(err);
         alert("خطأ في الاتصال بالسيرفر");
      } finally {
         setLoading(false);
      }
   };

   const isPresent = (id) =>
      todayAttendance.some(
         (a) => a.studentId === id || a.studentId?._id === id
      );

   const filteredStudents = students.filter((s) => {
      const matchesLevel = filters.level ? s.level === filters.level : true;
      const matchesGroup = filters.group ? s.group === filters.group : true;
      const matchesGrade = filters.grade
         ? s.grade === Number(filters.grade)
         : true;
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      return matchesLevel && matchesGroup && matchesGrade && matchesSearch;
   });

   return (
      <div className="attendance-page">
         <h1>تسجيل الحضور - {selectedDate}</h1>

         {/* ✅ اختيار التاريخ */}
         <div className="date-control">
            <label>📅 اختر التاريخ: </label>
            <input
               type="date"
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
            />
         </div>

         {/* ✅ الفلاتر والبحث */}
         <div className="filters">
            <input
               type="text"
               placeholder="🔍 بحث بالاسم"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />

            <select
               value={filters.level}
               onChange={(e) =>
                  setFilters({ ...filters, level: e.target.value })
               }>
               <option value="">كل المستويات</option>
               <option value="مكثفة">مكثفة</option>
               <option value="A">A</option>
               <option value="B">B</option>
            </select>

            <input
               type="text"
               placeholder="Group"
               value={filters.group}
               onChange={(e) =>
                  setFilters({ ...filters, group: e.target.value })
               }
            />

            <input
               type="number"
               placeholder="Grade"
               value={filters.grade}
               onChange={(e) =>
                  setFilters({ ...filters, grade: e.target.value })
               }
            />
         </div>

         {/* ✅ عرض الطلاب */}
         {filteredStudents.map((student) => (
            <div key={student._id} className="student-row">
               <span className="student-name">{student.name}</span>

               <div className="attendance-actions">
                  {/* ✅ خانة الوقت لطلاب المكثفة */}
                  {student.level === "مكثفة" && !isPresent(student._id) && (
                     <input
                        type="time"
                        value={timeInputs[student._id] || ""}
                        onChange={(e) =>
                           setTimeInputs({
                              ...timeInputs,
                              [student._id]: e.target.value,
                           })
                        }
                     />
                  )}

                  {/* ✅ خانة الحفظ للجميع */}
                  {!isPresent(student._id) && (
                     <select
                        value={hifzStatusInputs[student._id] || ""}
                        onChange={(e) =>
                           setHifzStatusInputs({
                              ...hifzStatusInputs,
                              [student._id]: e.target.value,
                           })
                        }>
                        <option value="">حالة الحفظ</option>
                        <option value="حافظ">حافظ</option>
                        <option value="غير حافظ">غير حافظ</option>
                        <option value="لا يوجد تسميع">لا يوجد تسميع</option>
                     </select>
                  )}

                  {/* ✅ عرض حالة الحضور */}
                  {isPresent(student._id) ? (
                     <span className="present-mark">✅ تم الحضور</span>
                  ) : (
                     <button
                        onClick={() => handleAttend(student._id)}
                        disabled={loading}>
                        حضر اليوم
                     </button>
                  )}
               </div>
            </div>
         ))}
      </div>
   );
};

export default AttendancePage;
