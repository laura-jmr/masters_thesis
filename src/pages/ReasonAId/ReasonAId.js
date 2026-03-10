import ChatBox from '../../components/Chatbox/Chatbox';
import Sidemenu from '../../components/Sidemenu/Sidemenu';
import PageLayout from '../PageLayout';
import './ReasonAId.css';
import { useState } from "react";

function ReasonAId() {
    const [message, setMessage] = useState("");
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);


    async function testBackend() {
        try {
          const res = await fetch("http://localhost:5050/api/test");
          const data = await res.json();
          setReply(JSON.stringify(data, null, 2));
          console.log("Backend test:", data);
        } catch (error) {
          console.error("Backend test failed:", error);
          setReply("Error: " + error.message);
        }
      }

    return (
        <PageLayout>
            <div id='reasonaid'>
                <Sidemenu/>
                <ChatBox/>
            </div>
        </PageLayout >
    );
}

export default ReasonAId;
