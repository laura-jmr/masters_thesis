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
      <Route path="/reasonaid-consent1" element={<ReasonAId selectedConsent={0}/>} />
      <Route path="/reasonaid-consent2" element={<ReasonAId selectedConsent={1}/>} />
      <Route path="/reasonaid-consent3" element={<ReasonAId selectedConsent={2}/>} />
      <Route path="/outro" element={<Outro/>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;