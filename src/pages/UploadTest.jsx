import React, { useState } from "react";

const CLOUD_NAME = "djzabi2fn"; // ✏️ غيّره حسب حسابك
const UPLOAD_PRESET = "student_uploads"; // ✏️ غيّره حسب البريسيت الذي أنشأته

const UploadTest = () => {
   const [file, setFile] = useState(null);
   const [imageUrl, setImageUrl] = useState("");
   const [loading, setLoading] = useState(false);

   const handleUpload = async () => {
      if (!file) return alert("اختر صورة أولاً");

      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      try {
         const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData,
         });

         const data = await res.json();
         console.log("✅ تم الرفع:", data);
         setImageUrl(data.secure_url);
      } catch (err) {
         alert("❌ فشل الرفع");
         console.error(err);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div style={{ padding: "20px", textAlign: "center" }}>
         <h2>تجربة رفع صورة إلى Cloudinary</h2>

         <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
         />

         <br /><br />
         <button onClick={handleUpload} disabled={loading}>
            {loading ? "جارٍ الرفع..." : "📤 رفع الصورة"}
         </button>

         {imageUrl && (
            <div style={{ marginTop: "20px" }}>
               <h4>📸 الصورة المرفوعة:</h4>
               <img src={imageUrl} alt="Uploaded" style={{ width: "200px", borderRadius: "8px" }} />
               <p>{imageUrl}</p>
            </div>
         )}
      </div>
   );
};

export default UploadTest;
