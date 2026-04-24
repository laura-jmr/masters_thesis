import { FilePenLineIcon } from '../Icons/FilePenLineAnimated';
import { GavelIcon } from '../Icons/GavelAnimated';
import { TelescopeIcon } from '../Icons/TelescopeAnimated';
import Tooltip from '../Tooltip/Tooltip';
import './Sidemenu.css';
import { useState } from 'react';

function Sidemenu({ setMessages, loading, setLoading }) {
    const sendSummaryMessage = async () => {
        if (loading) return;

        setLoading(true);

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                text: (
                    <>
                        <i className="fa fa-file"></i> Konversation zusammenfassen lassen.
                    </>
                ),
                time: new Date()
            }
        ]);

        try {
            const res = await fetch("http://localhost:5050/api/summary", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            const botReply = data.overallSummary || "No response received.";

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

    const sendPerspectiveMessage = async () => {
        if (loading) return;

        setLoading(true);

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                text: (
                    <>
                        <i className="fa fa-star"></i> Perspektive erweitern lassen.
                    </>
                ),
                time: new Date()
            }
        ]);

        try {
            const res = await fetch("http://localhost:5050/api/perspective", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            const botReply = data.question || "No response received.";

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

    const sendFinalDecisionMessage = async () => {
        if (loading) return;

        setLoading(true);

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                text: (
                    <>
                        <i className="fa fa-gavel"></i> Ich möchte meine finale Entscheidung treffen.
                    </>
                ),
                time: new Date()
            }
        ]);

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
                    type: "summary",
                    topics: data.summary.topics,
                    closingQuestion: data.summary.closingQuestion,
                    time: new Date()
                }
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

    return (
        <div className='sidemenu'>
            <div className='sidemenu-buttons'>
                <Tooltip text={"Zusammenfassung der Konversation"}>
                    <FilePenLineIcon size={"3rem"} onClick={sendSummaryMessage} className="sidemenu-button" />
                </Tooltip>
                <Tooltip text={"Perspektive erweitern"}>
                    <TelescopeIcon size={"3rem"} onClick={sendPerspectiveMessage} className="sidemenu-button" />
                </Tooltip>
                <Tooltip text={"Finale Entscheidung treffen"}>
                    <GavelIcon size={"3rem"} onClick={sendFinalDecisionMessage} className="sidemenu-button" />
                </Tooltip>
            </div>
        </div>
    );
}

export default Sidemenu;
