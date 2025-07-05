import React, { useState, useEffect } from "react";

const API =
   "https://mern-app-server-production-457d.up.railway.app/api/students";

export default function ImportStudentsPage() {
   const [fileData, setFileData] = useState([]);
   const [existingStudents, setExistingStudents] = useState([]);
   const [newStudents, setNewStudents] = useState([]);
   const [duplicateStudents, setDuplicateStudents] = useState([]);
   const [loading, setLoading] = useState(false);

   // جلب الطلاب الموجودين من السيرفر
   useEffect(() => {
      fetch(API)
         .then((res) => res.json())
         .then((data) => setExistingStudents(data))
         .catch(console.error);
   }, []);

   // قراءة الملف JSON عند رفعه
   const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
         try {
            const json = JSON.parse(evt.target.result);
            setFileData(json);
            compareStudents(json);
         } catch {
            alert("الملف ليس بصيغة JSON صحيحة");
         }
      };
      reader.readAsText(file);
   };

   // مقارنة بيانات الملف مع الموجود
   const compareStudents = (uploadedStudents) => {
      const newOnes = [];
      const duplicates = [];

      uploadedStudents.forEach((stuFromFile) => {
         // بحث في الموجودين عن اسم مطابق
         const match = existingStudents.find(
            (es) =>
               es.name.trim().toLowerCase() ===
               stuFromFile.name.trim().toLowerCase()
         );
         if (match) {
            duplicates.push({ existing: match, uploaded: stuFromFile });
         } else {
            newOnes.push(stuFromFile);
         }
      });

      setNewStudents(newOnes);
      setDuplicateStudents(duplicates);
   };

   // إضافة الطلاب الجدد دفعة واحدة
   const addNewStudents = async () => {
      setLoading(true);
      for (const student of newStudents) {
         try {
            const res = await fetch(API, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(student),
            });
            if (!res.ok) {
               console.error(`فشل إضافة: ${student.name}`);
            }
         } catch (err) {
            console.error(err);
         }
      }
      alert("تمت إضافة الطلاب الجدد");
      setLoading(false);
   };

   return (
      <div style={{ padding: 20 }}>
         <h2>استيراد طلاب من ملف JSON</h2>
         <input type="file" accept=".json" onChange={handleFileChange} />

         <h3>الطلاب الجدد</h3>
         {newStudents.length === 0 ? (
            <p>لا يوجد طلاب جدد</p>
         ) : (
            <>
               <ul>
                  {newStudents.map((s, i) => (
                     <li key={i}>{s.name}</li>
                  ))}
               </ul>
               <button onClick={addNewStudents} disabled={loading}>
                  {loading ? "جاري الإضافة..." : "إضافة الكل"}
               </button>
            </>
         )}

         <h3>الطلاب المكررين</h3>
         {duplicateStudents.length === 0 ? (
            <p>لا يوجد طلاب مكررين</p>
         ) : (
            <table border={1} cellPadding={5} style={{ width: "100%" }}>
               <thead>
                  <tr>
                     <th>الاسم</th>
                     <th>بيانات في الموقع</th>
                     <th>بيانات في الملف</th>
                  </tr>
               </thead>
               <tbody>
                  {duplicateStudents.map(({ existing, uploaded }, i) => (
                     <tr key={i}>
                        <td>{existing.name}</td>
                        <td>
                           {Object.entries(existing).map(([k, v]) => (
                              <div key={k}>
                                 <b>{k}</b>: {String(v)}
                              </div>
                           ))}
                        </td>
                        <td>
                           {Object.entries(uploaded).map(([k, v]) => (
                              <div key={k}>
                                 <b>{k}</b>: {String(v)}
                              </div>
                           ))}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         )}
      </div>
   );
}
