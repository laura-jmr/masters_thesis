import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import NotFound from "./pages/NotFound/NotFound";
import ConsentRequests from "./pages/ConsentRequests/ConsentRequests";
import ReasonAId from "./pages/ReasonAId/ReasonAId";
import Outro from "./pages/Outro/Outro";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/consent-requests" element={<ConsentRequests />} />
      <Route path="/reasonaid/:id" element={<ReasonAId />} />
      <Route path="/outro" element={<Outro/>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;