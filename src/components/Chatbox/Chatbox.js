import { useState, useRef, useEffect } from "react";
import './Chatbox.css';

function ChatBox() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage }
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
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
    <div className="chatbox">

      <div className="chatbox-messages" ref={messagesRef}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.role === "user" ? "message user-message" : "message chatbot-message"}>
            <p>{msg.text}</p>
            <p className="message-role">{msg.role === "user" ? "You" : "ReasonAId"}</p>
          </div>
        ))}
      </div>

      <div className="chatbox-input-section">
        <div className="chatbox-input-field">
          <textarea
            value={message}
            placeholder="Write your message..."
            rows={5}
            disabled={loading}
            onChange={(e) => {
              if (!loading) setMessage(e.target.value);
            }}
          />

          <button className="chatbox-send-button" onClick={sendMessage} disabled={loading}>
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>

        <p className="chatbox-hint">ReasonAId is based on GPT 5. The AI makes errors.</p>
      </div>
    </div>
  );
}

export default ChatBox;