import React, { useEffect, useState } from "react";
import "./ViewSessions.css";

const API_URL =
   "https://mern-app-server-production-457d.up.railway.app/api/sessions";

const ViewSessions = () => {
   const [groupedSessions, setGroupedSessions] = useState({});
   const [studentsPoints, setStudentsPoints] = useState([]);

   useEffect(() => {
      fetch(API_URL)
         .then((res) => res.json())
         .then((data) => {
            const grouped = {};
            const pointsList = {};

            data.forEach((session) => {
               const name = session.studentId?.name || "غير معروف";
               const page = session.pageNumber;
               const type = session.type;

               if (!grouped[name]) {
                  grouped[name] = { new: [], review: [] };
                  pointsList[name] = { new: 0, review: 0 };
               }

               if (type === "جديد") {
                  grouped[name].new.push(page);
                  pointsList[name].new += 1;
               } else if (type === "مراجعة") {
                  grouped[name].review.push(page);
                  pointsList[name].review += 1;
               }
            });

            // ترتيب الصفحات تصاعديًا
            for (const name in grouped) {
               grouped[name].new.sort((a, b) => a - b);
               grouped[name].review.sort((a, b) => a - b);
            }

            // حساب النقاط النهائية
            const finalPoints = Object.entries(pointsList).map(
               ([name, counts]) => ({
                  name,
                  new: counts.new,
                  review: counts.review,
                  total: counts.new * 10 + counts.review * 5,
               })
            );

            // ترتيبهم تنازليًا حسب المجموع
            finalPoints.sort((a, b) => b.total - a.total);

            setGroupedSessions(grouped);
            setStudentsPoints(finalPoints);
         })
         .catch((err) => console.error("خطأ في جلب الجلسات:", err));
   }, []);

   const compressPages = (pagesArray) => {
      const result = [];
      if (!pagesArray || pagesArray.length === 0) return result;

      let start = pagesArray[0];
      let end = start;

      for (let i = 1; i <= pagesArray.length; i++) {
         if (pagesArray[i] === end + 1) {
            end = pagesArray[i];
         } else {
            if (start === end) {
               result.push(`${start}`);
            } else {
               result.push(`${start} -> ${end}`);
            }
            start = pagesArray[i];
            end = start;
         }
      }

      return result;
   };

   return (
      <div className="view-sessions-container">
         <h1>عرض تسميعات الطلاب</h1>

         {Object.entries(groupedSessions).map(([studentName, pages]) => {
            const newRanges = compressPages(pages.new);
            const reviewRanges = compressPages(pages.review);

            return (
               <div className="student-block" key={studentName}>
                  <h2>{studentName}</h2>
                  <div className="table-wrapper">
                     <div className="header-row">
                        <div className="column-title">جديد</div>
                        <div className="column-title">مراجعة</div>
                     </div>
                     <div className="pages-grid">
                        {Array.from(
                           {
                              length: Math.max(
                                 newRanges.length,
                                 reviewRanges.length
                              ),
                           },
                           (_, i) => (
                              <div className="row" key={i}>
                                 <div className="cell">
                                    {newRanges[i] || ""}
                                 </div>
                                 <div className="cell">
                                    {reviewRanges[i] || ""}
                                 </div>
                              </div>
                           )
                        )}
                     </div>
                  </div>
                  <div className="totals">
                     <span>✅ المجموع جديد: {pages.new.length} صفحات</span>
                     <span>🔁 المجموع مراجعة: {pages.review.length} صفحات</span>
                  </div>
                  <div className="totals-points">
                     مجموع النقاط = 
                      {pages.review.length} * 5 + {pages.new.length} * 10 
                     <br></br>
                     {pages.new.length * 10 + pages.review.length * 5} = 
                  </div>
               </div>
            );
         })}

         {/* جدول النقاط النهائي */}
         <div className="summary-table">
            <h2>🏆 ترتيب الطلاب حسب النقاط</h2>
            <table>
               <thead>
                  <tr>
                     <th>الترتيب</th>
                     <th>الاسم</th>
                     <th>جديد</th>
                     <th>مراجعة</th>
                     <th>مجموع النقاط</th>
                  </tr>
               </thead>
               <tbody>
                  {studentsPoints.map((student, i) => (
                     <tr key={student.name}>
                        <td>{i + 1}</td>
                        <td>{student.name}</td>
                        <td>{student.new}</td>
                        <td>{student.review}</td>
                        <td>{student.total}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

export default ViewSessions;
