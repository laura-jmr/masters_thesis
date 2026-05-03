import { FilePenLineIcon } from '../Icons/FilePenLineAnimated';
import { GavelIcon } from '../Icons/GavelAnimated';
import { TelescopeIcon } from '../Icons/TelescopeAnimated';
import Tooltip from '../Tooltip/Tooltip';
import './Sidemenu.css';
import { useState } from 'react';

function Sidemenu({ setMessages, loading, setLoading, consentId }) {
    const saveMessage = async (message) => {
        await fetch("http://localhost:5050/api/message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });
    };

    const sendSummaryMessage = async () => {
        if (loading) return;

        setLoading(true);

        const newMsg = {
            role: "user",
            typ: "chat",
            text: (
                <>
                    <i className="fa fa-file"></i> Konversation zusammenfassen lassen.
                </>
            ),
            rawText: "BEFEHL: Konversation zusammenfassen lassen.",
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

        try {
            const res = await fetch("http://localhost:5050/api/summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            const botReply = data.gesamteZusammenfassung || "No response received.";

            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    typ: "summary",
                    themen: data.themen,
                    gesamteZusammenfassung: data.gesamteZusammenfassung,
                    time: new Date()
                }
            ]);

        } catch (err) {
            console.error(err);

            setMessages((prev) => [
                ...prev,
                { role: "bot", typ: "chat", text: "Error while contacting the server.", time: new Date() }
            ]);

        } finally {
            setLoading(false);
        }
    };

    const sendPerspectiveMessage = async () => {
        if (loading) return;

        setLoading(true);

        const newMsg = {
            role: "user",
            typ: "chat",
            text: (
                <>
                    <i className="fa fa-star"></i> Perspektive erweitern lassen.
                </>
            ),
            rawText: "BEFEHL: Perspektive erweitern lassen.",
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

        try {
            const res = await fetch("http://localhost:5050/api/perspective", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ consentId })
            });

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    typ: "perspective",
                    themen: data.themen,
                    time: new Date()
                }
            ]);

        } catch (err) {
            console.error(err);

            setMessages((prev) => [
                ...prev,
                { role: "bot", typ: "chat", text: "Error while contacting the server.", time: new Date() }
            ]);

        } finally {
            setLoading(false);
        }
    };

    const sendFinalDecisionMessage = async () => {
        if (loading) return;

        setLoading(true);

        const newMsg = {
            role: "user",
            typ: "chat",
            text: (
                <>
                    <i className="fa fa-gavel"></i> Finale Entscheidung treffen.
                </>
            ),
            rawText: "BEFEHL: Perspektive erweitern lassen.",
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

        try {
            const res = await fetch("http://localhost:5050/api/finaldecision", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: "bot",
                    typ: "final-summary",
                    themen: data.summary.themen,
                    abschließendeFrage: data.summary.abschließendeFrage,
                    time: new Date()
                }
            ]);

            setMessages((prev) => [
                ...prev,
                {
                    role: "system",
                    typ: "final-check"
                }
            ]);

        } catch (err) {
            console.error(err);

            setMessages((prev) => [
                ...prev,
                { role: "bot", typ: "chat", text: "Error while contacting the server.", time: new Date() }
            ]);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='sidemenu'>
            <div className='sidemenu-buttons'>
                <Tooltip text={"Zusammenfassung der Konversation"}>
                    <FilePenLineIcon size={"3rem"} onClick={sendSummaryMessage} className="sidemenu-button" />
                </Tooltip>

                <Tooltip text={"Perspektive erweitern"}>
                    <TelescopeIcon
                        size={"3rem"}
                        onClick={sendPerspectiveMessage}
                        className="sidemenu-button"
                    />
                </Tooltip>

                <Tooltip text={"Finale Entscheidung treffen"}>
                    <GavelIcon size={"3rem"} onClick={sendFinalDecisionMessage} className="sidemenu-button" />
                </Tooltip>
            </div>
        </div>
    );
}

export default Sidemenu;
