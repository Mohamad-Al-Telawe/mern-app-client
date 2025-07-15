import React, { useEffect, useState } from "react";
import "./styles/OldSessionsUploader.css";

const API_STUDENTS =
   "https://mern-app-server-production-457d.up.railway.app/api/students";
const API_SESSIONS =
   "https://mern-app-server-production-457d.up.railway.app/api/sessions/bulk";

const OLD_START_DATE = new Date("2025-07-01");
const NEW_DAYS = ["Sunday", "Monday", "Tuesday"];
const REVIEW_DAYS = ["Wednesday", "Thursday"];

const OldSessionsUploader = () => {
   const [students, setStudents] = useState([]);
   const [ranges, setRanges] = useState({});
   const [generatedSessions, setGeneratedSessions] = useState([]);
   const [submitted, setSubmitted] = useState(false);

   useEffect(() => {
      fetch(API_STUDENTS)
         .then((res) => res.json())
         .then((data) => setStudents(data));
   }, []);

   const handleRangeChange = (studentId, type, field, value) => {
      setRanges((prev) => ({
         ...prev,
         [studentId]: {
            ...prev[studentId],
            [type]: {
               ...prev[studentId]?.[type],
               [field]: Number(value),
            },
         },
      }));
   };

   const generateDates = (start, targetDays, count) => {
      const dates = [];
      const current = new Date(start);

      while (dates.length < count) {
         const dayName = current.toLocaleDateString("en-US", {
            weekday: "long",
         });
         if (targetDays.includes(dayName)) {
            dates.push(new Date(current));
         }
         current.setDate(current.getDate() + 1);
      }

      return dates;
   };

   const splitPages = (start, end, slotsCount) => {
      const total = end - start + 1;
      const avg = Math.floor(total / slotsCount);
      const extra = total % slotsCount;

      const result = [];
      let current = start;

      for (let i = 0; i < slotsCount; i++) {
         const count = i < extra ? avg + 1 : avg;
         const pages = Array.from({ length: count }, () => current++);
         result.push(pages);
      }

      return result;
   };

   const generateSessions = () => {
      const sessions = [];

      students.forEach((student) => {
         const config = ranges[student._id];
         if (!config) return;

         // جديد
         const newFrom = config.new?.from;
         const newTo = config.new?.to;
         if (newFrom && newTo && newTo >= newFrom) {
            const newDates = generateDates(OLD_START_DATE, NEW_DAYS, 6);
            const newPages = splitPages(newFrom, newTo, newDates.length);
            newPages.forEach((pages, i) => {
               pages.forEach((page) => {
                  sessions.push({
                     studentId: student._id,
                     pageNumber: page,
                     tajweedMark: 4,
                     hifzMark: 4,
                     type: "جديد",
                     date: newDates[i].toISOString().split("T")[0],
                  });
               });
            });
         }

         // مراجعة
         const reviewFrom = config.review?.from;
         const reviewTo = config.review?.to;
         if (reviewFrom && reviewTo && reviewTo >= reviewFrom) {
            const reviewDates = generateDates(OLD_START_DATE, REVIEW_DAYS, 4);
            const reviewPages = splitPages(
               reviewFrom,
               reviewTo,
               reviewDates.length
            );
            reviewPages.forEach((pages, i) => {
               pages.forEach((page) => {
                  sessions.push({
                     studentId: student._id,
                     pageNumber: page,
                     tajweedMark: 4,
                     hifzMark: 4,
                     type: "مراجعة",
                     date: reviewDates[i].toISOString().split("T")[0],
                  });
               });
            });
         }
      });

      setGeneratedSessions(sessions);
   };

   const sendSessions = async () => {
      try {
         const res = await fetch(API_SESSIONS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessions: generatedSessions }),
         });

         if (res.ok) {
            setSubmitted(true);
            alert("✅ تم إرسال التسميعات بنجاح");
         } else {
            alert("❌ حدث خطأ أثناء الإرسال");
         }
      } catch (err) {
         console.error(err);
         alert("⚠️ فشل في الاتصال بالسيرفر");
      }
   };

   return (
      <div className="old-sessions-uploader">
         <h1>إدخال التسميعات القديمة</h1>

         {students.map((student) => (
            <div className="student-range" key={student._id}>
               <h3>{student.name}</h3>
               <div className="range-inputs">
                  <label>
                     جديد: من
                     <input
                        type="number"
                        onChange={(e) =>
                           handleRangeChange(
                              student._id,
                              "new",
                              "from",
                              e.target.value
                           )
                        }
                     />
                     إلى
                     <input
                        type="number"
                        onChange={(e) =>
                           handleRangeChange(
                              student._id,
                              "new",
                              "to",
                              e.target.value
                           )
                        }
                     />
                  </label>

                  <label>
                     مراجعة: من
                     <input
                        type="number"
                        onChange={(e) =>
                           handleRangeChange(
                              student._id,
                              "review",
                              "from",
                              e.target.value
                           )
                        }
                     />
                     إلى
                     <input
                        type="number"
                        onChange={(e) =>
                           handleRangeChange(
                              student._id,
                              "review",
                              "to",
                              e.target.value
                           )
                        }
                     />
                  </label>
               </div>
            </div>
         ))}

         <button className="generate-btn" onClick={generateSessions}>
            توليد الجلسات
         </button>

         {generatedSessions.length > 0 && (
            <>
               <h2>📋 الجلسات الناتجة ({generatedSessions.length})</h2>
               <div className="sessions-preview">
                  {generatedSessions.map((s, i) => (
                     <div key={i} className="session-line">
                        {s.date} | {s.pageNumber} | {s.type}
                     </div>
                  ))}
               </div>
               {!submitted && (
                  <button className="submit-btn" onClick={sendSessions}>
                     إرسال التسميعات
                  </button>
               )}
            </>
         )}
      </div>
   );
};

export default OldSessionsUploader;
