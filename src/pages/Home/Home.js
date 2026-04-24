import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from '../PageLayout';
import './Home.css';

function Home() {
    const [hintIndex, setHintIndex] = useState(0);
    const navigate = useNavigate();

    const hints = [
        <>
            <h1>Willkommen zur Nutzerstudie von Laura's Masterarbeit</h1>
            <br />
            <p>Diese Studie ist über KI-unterstütztes Entscheiden im Kontext der Freigabe von Gesundheitsdaten.</p>
        </>,
        <>
            <p>Du wirst <span className='bold'>zwei Consent Requests</span> durchgehen, in denen Du jeweils verschiedene Arten von KI-Unterstützung erhalten wirst.</p>
            <br />
            <p>Am Ende triffst Du die finale Entscheidung über Deine Gesundheitsdaten. Alle Daten und Consent Requests sind fiktiv.</p>
        </>,
        <>
            <p>Jeder Consent Request leitet Dich zu einer einzigartigen Seite.
                <br/>
                Nachdem du den ersten Consent Request erledigt hast, wirst Du zu dieser Seite zurückgeleitet, wo Du dann auf den
            </p>
        </>
    ];

    const handleContinue = () => {
        if (hintIndex < hints.length - 1) {
            setHintIndex(hintIndex + 1);
        } else {
            navigate("/consent-requests");
        }
    };

    return (
        <PageLayout>
            <div id='home'>
                <div className="home-header">
                    <h1>AI Decision Support</h1>
                    <p>Study Hub</p>
                </div>
                <div className="hint">
                    {hints[hintIndex]}
                </div>

                <a className='button' onClick={handleContinue}>Weiter</a>
            </div>
        </PageLayout >
    );
}

export default Home;
