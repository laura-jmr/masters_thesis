import { useState, useRef, useEffect } from "react";
import './Chatbox.css';
import { SendIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

function ChatBox({ messages, setMessages, loading, setLoading, activeConsent, consentId }) {
  const [message, setMessage] = useState("");
  const [openSections, setOpenSections] = useState({});
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const saveMessage = async (message) => {
    await fetch("http://localhost:5050/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  };

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      { role: "user", typ: "chat", text: userMessage, time: new Date() }
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage, consentId: consentId }),
      });

      const data = await res.json();

      const botReply = data.reply || "No response received.";

      setMessages((prev) => [
        ...prev,
        { role: "bot", typ: "chat", text: botReply, time: new Date() }
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

  const handleFinalYes = () => {
    const newMsg = {
      role: "system",
      typ: "chat",
      text: (
        <>
          Du möchtest deine finale Antwort geben.
          <br /><br />
          Für die folgende Einwilligungsanfrage, <strong>wie entscheidest du dich?</strong>
          <br />
          <div className="final-consent">
            <h3>{activeConsent.title}</h3>
            {activeConsent.recipient}
            <br /><br />
            {activeConsent.purpose}
            <br /><br />
            {activeConsent.dataType}
            <br /><br />
            {activeConsent.potentialBenefit}
            <br /><br />
            {activeConsent.potentialRisk}
            <br /><br />
            {activeConsent.dataRegulation}
          </div>
          <div className="final-buttons final-decision-buttons">
            <button onClick={() => navigate("/outro")}>Ich erlaube die Nutzung meiner Daten.</button>
            <button onClick={() => navigate("/outro")}>Ich verweigere die Nutzung meiner Daten.</button>
          </div>
          <p className="final-decision-hint">Hinweis: Wenn du dir doch unsicher bist, kannst du einfach weiter mit ReasonAId schreiben.</p>
        </>
      ),
      rawText: `Du möchtest deine finale Antwort geben. Für die folgende Einwilligungsanfrage, wie entscheidest du dich? ${activeConsent.title}. ${activeConsent.recipient} ${activeConsent.purpose} ${activeConsent.dataType} ${activeConsent.potentialBenefit} ${activeConsent.potentialRisk} ${activeConsent.dataRegulation} A: Ich erlaube die Nutzung meiner Daten. B: Ich verweigere die Nutzung meiner Daten. Hinweis: Wenn du dir doch unsicher bist, kannst du einfach weiter mit ReasonAId schreiben.`
    };

    setMessages((prev) => [
      ...prev,
      newMsg
    ]);

    saveMessage({
      role: newMsg.role,
      text: newMsg.rawText
    })
  };

  const handleFinalNo = () => {
    const newMsg = {
      role: "bot",
      typ: "chat",
      text: (
        <>
          Ok, kein Problem.
          <br /> <br />
          <strong>Was fehlt dir noch, um deine Entscheidung zu treffen?</strong>
        </>
      ),
      rawText: "Ok, kein Problem. Was fehlt dir noch, um deine Entscheidung zu treffen?",
      time: new Date()
    };

    setMessages((prev) => [
      ...prev,
      newMsg
    ]);

    saveMessage({
      role: newMsg.role,
      text: newMsg.rawText
    })
  };

  return (
    <div className="chatbox">

      <div className="chatbox-messages" ref={messagesRef}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.role === "user" ? "message user-message"
            : msg.role === "bot" ? "message chatbot-message"
              : "message system-message"}>
            {msg.typ === "final-summary" && (
              <div>
                <div className="summary-message">
                  {msg.themen.map((topic, index) => (
                    <div key={index} className="topic">
                      <p className={`topic-title ${openSections[topic.thema] ? "open" : ""}`} onClick={() => toggleSection(topic.thema)}>{topic.thema}</p>
                      <ul className={`topic-summary ${openSections[topic.thema] ? "open" : ""}`}>
                        {topic.punkte.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <p className="closing-question">Wenn du möchtest, kannst du auf ein Thema klicken, um eine Zusammenfassung dessen zu erhalten, worüber wir in diesem Thema gesprochen haben.<br /><br />
                    <span>Hast du das Gefühl, dass wir alle Aspekte berücksichtigt haben, die für deine Entscheidung wichtig sind?</span>
                  </p>
                </div>
              </div>
            )}

            {msg.typ === "final-check" && (
              <div className="final-buttons">
                <button onClick={handleFinalYes}>Ja.</button>
                <button onClick={handleFinalNo}>Nein.</button>
              </div>
            )}

            {msg.typ === "chat" && (
              <p>{msg.text}</p>
            )}

            {msg.typ === "summary" && (
              <div>
                <div className="summary-message">
                  {msg.themen.map((topic, index) => (
                    <div key={index} className="topic">
                      <p className={`topic-title ${openSections[topic.thema] ? "open" : ""}`} onClick={() => toggleSection(topic.thema)}>{topic.thema}</p>
                      <ul className={`topic-summary ${openSections[topic.thema] ? "open" : ""}`}>
                        {topic.punkte.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  <p className="closing-question">Wenn du möchtest, kannst du auf ein Thema klicken, um eine Zusammenfassung dessen zu erhalten, worüber wir in diesem Thema gesprochen haben.<br /><br />
                    <span>Was sind deine Gedanken zu den Punkten?</span>
                  </p>

                </div>
              </div>
            )}

            {msg.typ === "perspective" && (
              <div>
                <div className="perspective-message">
                  Hier ist eine Übersicht über relevante Themen:
                  {msg.themen.map((topic, index) => (
                    <div key={index} className="topic">
                      <p className={`topic-title ${topic.status === "besprochen" ? "besprochen" : "unbesprochen"}`}>{topic.thema}</p>
                    </div>
                  ))}

                  <p className="closing-question"><br /><br />
                    <span>Möchtest du mit einem der Themen weitermachen?</span>
                  </p>



                </div>
              </div>
            )}

            <p className="message-role">{msg.role === "user" ? "You" : msg.role === "bot" ? "ReasonAId" : ""} {msg.time && msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        ))}
      </div>

      <div className="chatbox-input-section">
        <div className="chatbox-input-field">
          <textarea
            ref={inputRef}
            value={message}
            placeholder="Schreibe deine Nachricht..."
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