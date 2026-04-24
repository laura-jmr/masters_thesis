import PageLayout from '../PageLayout';
import './ConsentRequests.css';
import { useNavigate } from "react-router-dom";

function ConsentRequests() {
    const navigate = useNavigate();

    return (
        <PageLayout>
            <div id='consent-requests'>
                <div className="hub-header">
                    <h1>AI Decision Support</h1>
                    <p>Study Hub</p>
                </div>

                <div className='consent-request-box'>
                    <div className="consent-request" onClick={() => navigate("/reasonaid-consent1")}>
                        <p><span className='bold'>Einwilligungsfrage 1:</span> Forschungsprojekt eines privaten Pharmaunternehmens</p>
                    </div>

                    <div className="consent-request" onClick={() => navigate("/reasonaid--consent2")}>
                        <p><span className='bold'>Einwilligungsfrage 2:</span> Forschungsprojekt des Militärs</p>
                    </div>

                    <div className="consent-request" onClick={() => navigate("/reasonaid--consent3")}>
                        <p><span className='bold'>Einwilligungsfrage 3:</span> Daten zur psychischen Gesundheit für Pandemieforschung</p>
                    </div>
                </div>
            </div>
        </PageLayout >
    );
}

export default ConsentRequests;
