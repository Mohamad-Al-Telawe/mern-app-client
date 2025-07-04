import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MokathafaInput from "./pages/MokathafaInput";
import ViewSessions from "./pages/ViewSessions";
import OldSessionsUploader from "./pages/OldSessionsUploader";

function App() {
   // return <MokathafaInput />;
   // return <ViewSessions />;
   return (
      <Router>
         <Routes>
            <Route path="/input" element={<MokathafaInput />} />
            <Route path="/view" element={<ViewSessions />} />
            <Route path="/old-sessions" element={<OldSessionsUploader />} />

         </Routes>
      </Router>
   );
}

export default App;
