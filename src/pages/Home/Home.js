import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from '../PageLayout';
import './Home.css';

function Home() {
    const [hintIndex, setHintIndex] = useState(0);
    const navigate = useNavigate();

    const hints = [
        <>
            <p>ReasonAId is an AI powered chatbot, that will try to help you in your decision making.</p>
            <br />
            <p>Feel free to interact with ReasonAId as long as you wish to.</p>
        </>,
        <>
            <p>You will go through <span className='bold'>two consent requests</span>, where you will receive different kind of AI decision support.</p>
            <br />
            <p>In the end, you decide for each consent request, if you want to share your fictive data or not.</p>
        </>,
        <>
            <p>After finishing the first consent request, you will get back to this page to proceed with the second consent request.</p>
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
                <div className="hint">
                    {hints[hintIndex]}
                </div>

                <a className='button' onClick={handleContinue}>Continue</a>
            </div>
        </PageLayout >
    );
}

export default Home;
