import React, { useState, useEffect } from "react";

const API_STUDENTS =
   "https://mern-app-server-production-457d.up.railway.app/api/students";
const CLOUD_NAME = "djzabi2fn";
const UPLOAD_PRESET = "student_uploads";

const StudentForm = ({ onClose, onSave, existingStudent }) => {
   const [formData, setFormData] = useState({
      name: "",
      level: "B",
      group: "",
      grade: "",
      parentContact: "",
      birthDay: "",
      photoUrl: "",
      generalStatus: "جيد",
      currentAttendanceStatus: "يحضر",
      disciplinedStatus: "عادي",
      tajweedDegre: 0,
      hasMemorized: "",
      hasHomework: "",
      notes: "",
   });

   const [uploading, setUploading] = useState(false);

   useEffect(() => {
      if (existingStudent) {
         setFormData({
            ...existingStudent,
            birthDay: existingStudent.birthDay?.substring(0, 10) || "",
         });
      }
   }, [existingStudent]);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
   };

   const handleImageUpload = async (file) => {
  if (!file) {
    alert("يرجى اختيار صورة");
    return;
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  setUploading(true);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (data.secure_url) {
      setFormData((prev) => ({ ...prev, photoUrl: data.secure_url }));
    } else {
      alert("فشل في رفع الصورة");
    }
  } catch (err) {
    console.error(err);
    alert("خطأ في الاتصال بـ Cloudinary");
  } finally {
    setUploading(false);
  }
};


   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const method = existingStudent ? "PATCH" : "POST";
         const url = existingStudent
            ? `${API_STUDENTS}/${existingStudent._id}`
            : API_STUDENTS;

         const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });

         if (res.ok) {
            const savedStudent = await res.json();
            onSave(savedStudent);
            onClose();
         } else {
            alert("فشل في حفظ بيانات الطالب");
         }
      } catch (err) {
         console.error(err);
         alert("خطأ في الاتصال بالسيرفر");
      }
   };

   return (
      <div className="student-form-overlay">
         <form className="student-form" onSubmit={handleSubmit}>
            <h2>{existingStudent ? "تعديل طالب" : "إضافة طالب جديد"}</h2>

            <label>الاسم</label>
            <input
               name="name"
               value={formData.name}
               onChange={handleChange}
               required
            />

            <label>المستوى</label>
            <select name="level" value={formData.level} onChange={handleChange}>
               <option value="مكثفة">مكثفة</option>
               <option value="A">A</option>
               <option value="B">B</option>
            </select>

            <label>المجموعة</label>
            <input
               name="group"
               value={formData.group}
               onChange={handleChange}
            />

            <label>الصف</label>
            <input
               name="grade"
               type="number"
               value={formData.grade}
               onChange={handleChange}
            />

            <label>رقم ولي الأمر</label>
            <input
               name="parentContact"
               type="number"
               value={formData.parentContact}
               onChange={handleChange}
            />

            <label>تاريخ الميلاد</label>
            <input
               name="birthDay"
               type="date"
               value={formData.birthDay}
               onChange={handleChange}
            />

            <label>رفع صورة الطالب</label>
            <input
               type="file"
               accept="image/*"
               onChange={(e) => handleImageUpload(e.target.files[0])}
               disabled={uploading}
            />
            {uploading && <p>📤 جاري رفع الصورة...</p>}

            <label>الحالة العامة</label>
            <select
               name="generalStatus"
               value={formData.generalStatus}
               onChange={handleChange}>
               <option value="ممتاز">ممتاز</option>
               <option value="جيد">جيد</option>
               <option value="غير جيد">غير جيد</option>
            </select>

            <label>حالة الحضور الحالية</label>
            <select
               name="currentAttendanceStatus"
               value={formData.currentAttendanceStatus}
               onChange={handleChange}>
               <option value="يحضر">يحضر</option>
               <option value="لا يحضر">لا يحضر</option>
            </select>

            <label>حالة الانضباط</label>
            <select
               name="disciplinedStatus"
               value={formData.disciplinedStatus}
               onChange={handleChange}>
               <option value="منضبط">منضبط</option>
               <option value="عادي">عادي</option>
               <option value="غير منضبط">غير منضبط</option>
            </select>

            <label>درجة التجويد</label>
            <input
               name="tajweedDegre"
               type="number"
               value={formData.tajweedDegre}
               onChange={handleChange}
            />

            <label>هل حفظ</label>
            <input
               name="hasMemorized"
               value={formData.hasMemorized}
               onChange={handleChange}
            />

            <label>هل لديه واجب</label>
            <input
               name="hasHomework"
               value={formData.hasHomework}
               onChange={handleChange}
            />

            <label>ملاحظات</label>
            <textarea
               name="notes"
               value={formData.notes}
               onChange={handleChange}
            />

            <button type="submit" disabled={uploading}>
               {existingStudent ? "حفظ التعديل" : "إضافة الطالب"}
            </button>
            <button type="button" onClick={onClose}>
               إلغاء
            </button>
         </form>
      </div>
   );
};

export default StudentForm;
