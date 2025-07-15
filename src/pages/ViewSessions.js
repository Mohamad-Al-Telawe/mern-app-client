import React, { useEffect, useState } from "react";
import "./styles/ViewSessions.css";

const API =
   "https://mern-app-server-production-457d.up.railway.app/api/sessions";

const ViewSessions = () => {
   const [sessionsMap, setSessionsMap] = useState({});

   useEffect(() => {
      fetchSessions();
   }, []);

   const fetchSessions = async () => {
      const res = await fetch(API);
      const data = await res.json();
      const grouped = {};

      data.forEach((s) => {
         const name = s.studentId?.name || "غير معروف";
         if (!grouped[name]) grouped[name] = { new: [], review: [] };
         if (s.type === "جديد") grouped[name].new.push(s);
         if (s.type === "مراجعة") grouped[name].review.push(s);
      });

      for (const key in grouped) {
         grouped[key].new.sort((a, b) => a.pageNumber - b.pageNumber);
         grouped[key].review.sort((a, b) => a.pageNumber - b.pageNumber);
      }

      setSessionsMap(grouped);
   };
   const calculatePoints = () => {
      const results = [];

      Object.entries(sessionsMap).forEach(([name, { new: n, review: r }]) => {
         const newCount = n?.length || 0;
         const reviewCount = r?.length || 0;
         const total = newCount * 10 + reviewCount * 5;

         results.push({ name, newCount, reviewCount, total });
      });

      // ترتيب تنازلي حسب النقاط
      return results.sort((a, b) => b.total - a.total);
   };

   const handleAdd = async (studentName, type, value) => {
      const page = parseInt(value);
      if (!page) return;

      const studentSessions = sessionsMap[studentName];
      if (!studentSessions) return;

      const typeKey = type === "جديد" ? "new" : "review";
      const oppositeKey = typeKey === "new" ? "review" : "new";

      const isInCurrent = (studentSessions[typeKey] || []).find(
         (s) => s.pageNumber === page
      );

      const inOpposite = (studentSessions[oppositeKey] || []).find(
         (s) => s.pageNumber === page
      );

      // 🟡 إذا الصفحة موجودة بنفس العمود → نحذفها وننقلها للعمود الآخر
      if (isInCurrent) {
         // حذف من العمود الحالي
         await fetch(`${API}/${isInCurrent._id}`, { method: "DELETE" });

         // إضافة للعمود الآخر
         const studentId =
            studentSessions[oppositeKey][0]?.studentId?._id ||
            isInCurrent.studentId?._id;

         if (!studentId) {
            console.error("لم يتم العثور على studentId");
            return;
         }

         await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               studentId,
               pageNumber: page,
               tajweedMark: 4,
               hifzMark: 4,
               type: type === "جديد" ? "مراجعة" : "جديد", // نضيفها للنوع الآخر
               date: new Date().toISOString().split("T")[0],
            }),
         });

         fetchSessions();
         return;
      }

      // 🔁 إذا كانت في العمود الآخر → نحذفها من هناك
      if (inOpposite) {
         await fetch(`${API}/${inOpposite._id}`, { method: "DELETE" });
      }

      const studentId =
         studentSessions[typeKey][0]?.studentId?._id ||
         studentSessions[oppositeKey][0]?.studentId?._id;

      if (!studentId) {
         console.error("لم يتم العثور على studentId");
         return;
      }

      await fetch(API, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            studentId,
            pageNumber: page,
            tajweedMark: 4,
            hifzMark: 4,
            type,
            date: new Date().toISOString().split("T")[0],
         }),
      });

      fetchSessions();
   };

   const removeDuplicates = async (name, type) => {
      const arr = sessionsMap[name][type];
      const seen = new Set();
      for (const s of arr) {
         if (seen.has(s.pageNumber)) {
            await fetch(`${API}/${s._id}`, { method: "DELETE" });
         } else {
            seen.add(s.pageNumber);
         }
      }
      fetchSessions();
   };

   const compress = (arr) => {
      const nums = arr.map((s) => s.pageNumber);
      if (!nums.length) return [];
      const result = [];
      let [start, end] = [nums[0], nums[0]];

      for (let i = 1; i <= nums.length; i++) {
         if (nums[i] === end + 1) {
            end = nums[i];
         } else {
            result.push(start === end ? `${start}` : `${start} -> ${end}`);
            start = nums[i];
            end = nums[i];
         }
      }
      return result;
   };

   return (
      <div className="view-sessions">
         <h1>📚 تسميعات الطلاب</h1>

         {Object.entries(sessionsMap).map(
            ([name, { new: newPages, review: reviewPages }]) => (
               <div className="student-block" key={name}>
                  <h2>{name}</h2>

                  <div className="table-wrapper">
                     <div className="header-row">
                        <div>📘 جديد</div>
                        <div>🔁 مراجعة</div>
                     </div>
                     <div className="pages-row">
                        <div>{compress(newPages).join(" | ")}</div>
                        <div>{compress(reviewPages).join(" | ")}</div>
                     </div>
                     <div className="input-row">
                        <input
                           type="number"
                           placeholder="صفحة جديد"
                           onKeyDown={(e) =>
                              e.key === "Enter" &&
                              handleAdd(name, "جديد", e.target.value)
                           }
                        />
                        <input
                           type="number"
                           placeholder="صفحة مراجعة"
                           onKeyDown={(e) =>
                              e.key === "Enter" &&
                              handleAdd(name, "مراجعة", e.target.value)
                           }
                        />
                     </div>
                     <div className="action-row">
                        <button onClick={() => removeDuplicates(name, "new")}>
                           🗑 حذف تكرار الجديد
                        </button>
                        <button
                           onClick={() => removeDuplicates(name, "review")}>
                           🗑 حذف تكرار المراجعة
                        </button>
                     </div>
                  </div>
               </div>
            )
         )}
         <div className="summary-table">
            <h2>🏆 ترتيب الطلاب حسب النقاط</h2>
            <table>
               <thead>
                  <tr>
                     <th>#</th>
                     <th>الاسم</th>
                     <th>جديد</th>
                     <th>مراجعة</th>
                     <th>المجموع</th>
                  </tr>
               </thead>
               <tbody>
                  {calculatePoints().map((s, i) => (
                     <tr key={s.name}>
                        <td>{i + 1}</td>
                        <td>{s.name}</td>
                        <td>{s.newCount}</td>
                        <td>{s.reviewCount}</td>
                        <td>{s.total}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export default ViewSessions;
