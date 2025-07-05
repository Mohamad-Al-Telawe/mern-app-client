import React, { useEffect, useState } from "react";
import "./styles/StudentListPage.css";
import "./styles/StudentForm.css";
import StudentForm from "../components/StudentForm";

const API =
   "https://mern-app-server-production-457d.up.railway.app/api/students";

const StudentListPage = () => {
   const [students, setStudents] = useState([]);
   const [selectedStudent, setSelectedStudent] = useState(null);
   const [showForm, setShowForm] = useState(false);

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
            return prev.map((s) => (s._id === savedStudent._id ? savedStudent : s));
         } else {
            return [...prev, savedStudent];
         }
      });
      setShowForm(false);
   };

   return (
      <div className="student-list-container">
         <h1>قائمة الطلاب</h1>
         <button className="add-btn" onClick={openAddForm}>
            ➕ إضافة طالب
         </button>

         <div className="student-list">
            {students.map((student) => (
               <div key={student._id} className="student-card">
                  <img
                     src={student.photoUrl || "../logo192.png"}
                     alt={student.name}
                     className="student-image"
                  />
                  <div className="student-info">
                     <h3>{student.name}</h3>
                     <p>
                        <strong>المستوى:</strong> {student.level}
                     </p>
                     <p>
                        <strong>المجموعة:</strong>{" "}
                        {student.group || "غير محددة"}
                     </p>
                     <p>
                        <strong>الصف:</strong> {student.grade || "—"}
                     </p>
                     <p>
                        <strong>الحضور:</strong>{" "}
                        {student.currentAttendanceStatus || "—"}
                     </p>

                     <div className="actions">
                        <button onClick={() => openEditForm(student)}>
                           تعديل
                        </button>
                        <button
                           className="delete-btn"
                           onClick={() => deleteStudent(student._id)}>
                           حذف
                        </button>
                     </div>
                  </div>
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
               onSave={handleSave}  // <=== هنا تمرر الدالة
            />
         )}
      </div>
   );
};

export default StudentListPage;
