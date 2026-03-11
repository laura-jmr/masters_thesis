import './Sidemenu.css';
import { useState } from 'react';

function Sidemenu() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendFinalDecisionMessage = async () => {
        setLoading(true);

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                text: (
                    <>
                        <i className="fa fa-gavel"></i> Final decision requested
                    </>
                )
            }
        ]);

        try {
            const res = await fetch("http://localhost:5050/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "GAVEL" }),
            });

            const data = await res.json();

            const parser = new DOMParser();
            const doc = parser.parseFromString(data.reply, "text/html");
            const paragraph = doc.querySelector("p");

            const botReply = paragraph ? paragraph.textContent : "No response received.";

            setMessages((prev) => [
                ...prev,
                { role: "bot", text: botReply }
            ]);

        } catch (err) {
            console.error(err);

            setMessages((prev) => [
                ...prev,
                { role: "bot", text: "Error while contacting the server." }
            ]);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='sidemenu'>
            <h2>Action Buttons</h2>
            <div className='sidemenu-buttons'>
                <i className="fa fa-file"></i>
                <i className="fa fa-search"></i>
                <i className="fa fa-gavel" onClick={sendFinalDecisionMessage}></i>
            </div>
        </div>
    );
}

export default Sidemenu;
