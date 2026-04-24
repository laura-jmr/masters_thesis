import { useState, useRef, useEffect } from "react";
import './Chatbox.css';
import { SendIcon } from "lucide-react";

function ChatBox({ messages, setMessages, loading, setLoading }) {
  const [message, setMessage] = useState("");
  const [openSections, setOpenSections] = useState({});
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
      { role: "user", text: userMessage, time: new Date() }
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

      const botReply = data.reply || "No response received.";

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: botReply, time: new Date() }
      ]);

    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error while contacting the server.", time: new Date() }
      ]);

    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  return (
    <div className="chatbox">

      <div className="chatbox-messages" ref={messagesRef}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.role === "user" ? "message user-message" : "message chatbot-message"}>
            {msg.type === "summary" ? (
              <div>
                <div className="summary-message">
                  {msg.topics.map((topic, index) => (
                    <div key={index} className="topic">
                      <p className={`topic-title ${openSections[topic.topic] ? "open" : ""}`} onClick={() => toggleSection(topic.topic)}>{topic.topic}</p>
                      <ul className={`topic-summary ${openSections[topic.topic] ? "open" : ""}`}>
                        {topic.summaryPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <p className="closing-question">Wenn du möchtest, kannst du auf ein Thema klicken, um eine Zusammenfassung dessen zu erhalten, worüber wir in diesem Thema gesprochen haben.<br /><br />
                    <span>Hast du das Gefühl, dass wir alle Aspekte berücksichtigt haben, die für deine Entscheidung wichtig sind?</span>
                  </p>

                  <div className="summary-buttons">
                    <button>Yes</button>
                    <button>No</button>
                  </div>
                </div>
              </div>
            ) : (
              <p>{msg.text}</p>
            )}
            <p className="message-role">{msg.role === "user" ? "You" : "ReasonAId"} {msg.time && msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button className="chatbox-send-button" onClick={sendMessage} disabled={loading}>
            <SendIcon size={"3rem"} />
          </button>
        </div>

        <p className="chatbox-hint">ReasonAId basiert auf GPT 4o (mini). Die KI macht Fehler.</p>
      </div>
    </div>
  );
}

export default ChatBox;