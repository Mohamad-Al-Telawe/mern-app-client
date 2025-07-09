import React, { useEffect, useState } from "react";
import "./styles/StudentListPage.css";
import "./styles/StudentForm.css";
import StudentForm from "../components/StudentForm";

const API =
   "https://mern-app-server-production-457d.up.railway.app/api/students";
// "./studentDataTest.json";

const StudentListPage = () => {
   const [students, setStudents] = useState([]);
   const [selectedStudent, setSelectedStudent] = useState(null);
   const [showForm, setShowForm] = useState(false);
   const [filters, setFilters] = useState({ level: "", group: "", grade: "" });
   const [search, setSearch] = useState("");

   // ✅ تصفية الطلاب
   const filteredStudents = students.filter((s) => {
      const matchesLevel = filters.level ? s.level === filters.level : true;
      const matchesGroup = filters.group ? s.group === filters.group : true;
      const matchesGrade = filters.grade
         ? s.grade === Number(filters.grade)
         : true;
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
      return matchesLevel && matchesGroup && matchesGrade && matchesSearch;
   });

   const fetchStudents = async () => {
      const res = await fetch(API);
      const data = await res.json();
      setStudents(data);
   };

   useEffect(() => {
      fetchStudents();
   }, []);

   const openEditForm = (student) => {
      setSelectedStudent(student);
      setShowForm(true);
   };

   const openAddForm = () => {
      setSelectedStudent(null);
      setShowForm(true);
   };

   const deleteStudent = async (id) => {
      if (!window.confirm("هل أنت متأكد من حذف هذا الطالب؟")) return;
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (res.ok) fetchStudents();
   };

   const handleSave = (savedStudent) => {
      setStudents((prev) => {
         const exists = prev.find((s) => s._id === savedStudent._id);
         if (exists) {
            return prev.map((s) =>
               s._id === savedStudent._id ? savedStudent : s
            );
         } else {
            return [...prev, savedStudent];
         }
      });
      setShowForm(false);
   };

   return (
      <div className="student-list-container">
         <h1>قائمة الطلاب</h1>
         <p className="hint-text">📌 انقر على بطاقة الطالب لتعديل معلوماته</p>
         <button className="add-btn" onClick={openAddForm}>
            ➕ إضافة طالب
         </button>

         {/* ✅ الفلاتر */}
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

         <div className="student-list">
            {filteredStudents.map((student) => (
               <div
                  key={student._id}
                  className="student-card"
                  data-level={student.level}
                  onClick={() => openEditForm(student)}
                  onDoubleClick={(e) => e.stopPropagation()}>
                  <div className="student-content">
                     <div className="student-info">
                        <div className="student-image">
                           <img
                              // src={student.photoUrl || "https://i.postimg.cc/rmPctkx2/photo-2025-07-08-12-27-21.jpg"}
                              // src={student.photoUrl || "https://res.cloudinary.com/djzabi2fn/image/upload/v1752014444/photo_%D9%A2%D9%A0%D9%A2%D9%A3-%D9%A0%D9%A2-%D9%A2%D9%A3_%D9%A0%D9%A9-%D9%A2%D9%A8-%D9%A5%D9%A5_ljxkhd.jpg"}
                              src={student.photoUrl || "../logo192.png"}
                              alt={student.name}
                              className="image"
                           />
                        </div>
                        <h3>{student.name}</h3>
                        <p>
                           <strong>المجموعة:</strong>{" "}
                           {student.group || "—"}
                        </p>
                        <p>
                           <strong>الصف:</strong> {student.grade || "—"}
                        </p>
                        <p>
                           <strong>النقاط الحالية:</strong>{" "}
                           {student.points || "—"}
                        </p>
                     </div>
                     <div className="student-data">
                        <p>
                           <strong>الحالة العامة:</strong>{" "}
                           {student.generalStatus || "—"}
                        </p>
                        <p>
                           <strong>الانضباط:</strong>{" "}
                           {student.disciplinedStatus || "—"}
                        </p>
                        <p>
                           <strong>الحضور:</strong>{" "}
                           {student.currentAttendanceStatus || "—"}
                        </p>
                        <p>
                           <strong>المحفوظ:</strong>{" "}
                           {student.hasMemorized || "—"}
                        </p>
                        <p>
                           <strong>درجة التجويد:</strong>{" "}
                           {student.tajweedDegre || "—"}
                        </p>
                        <p>
                           <strong>رقم الأهل:</strong>{" "}
                           {student.parentContact || "—"}
                        </p>
                        <p>
                           <strong>ملاحظات:</strong> {student.notes || "—"}
                        </p>
                     </div>
                  </div>
                  {/* ❌ زر الحذف (كـ after) */}
                  <span
                     className="delete-x"
                     onClick={(e) => {
                        e.stopPropagation();
                        deleteStudent(student._id);
                     }}></span>
               </div>
            ))}
         </div>

         {showForm && (
            <StudentForm
               existingStudent={selectedStudent}
               onClose={() => {
                  setShowForm(false);
                  fetchStudents();
               }}
               onSave={handleSave}
            />
         )}
      </div>
   );
};

export default StudentListPage;
