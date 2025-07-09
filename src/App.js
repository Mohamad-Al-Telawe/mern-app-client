import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MokathafaInput from "./pages/MokathafaInput";
import ViewSessions from "./pages/ViewSessions";
import OldSessionsUploader from "./pages/OldSessionsUploader";
import AttendancePage from "./pages/AttendancePage";
import StudentListPage from "./pages/StudentListPage.js";
import ImportStudentsPage from "./pages/ImportStudentsJSON.js";
import UploadTest from "./pages/UploadTest";

function App() {
   // return <MokathafaInput />;
   // return <ViewSessions />;
   return (
      <Router>
         <Routes>
            <Route path="/input" element={<MokathafaInput />} />
            <Route path="/view" element={<ViewSessions />} />
            <Route path="/old-sessions" element={<OldSessionsUploader />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/student-list" element={<StudentListPage />} />
            <Route path="/import-students" element={<ImportStudentsPage />} />
            <Route path="/upload-test" element={<UploadTest />} />
         </Routes>
      </Router>
   );
}

export default App;
