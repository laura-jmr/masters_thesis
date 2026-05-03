import PageLayout from '../PageLayout';
import './ConsentRequests.css';
import { useNavigate } from "react-router-dom";

function ConsentRequests() {
    const navigate = useNavigate();

    const handleSelectConsent = (id) => {
        navigate(`/reasonaid/${id}`);
      };

    return (
        <PageLayout>
            <div id='consent-requests'>
                <div className="hub-header">
                    <p>Study Hub</p>
                </div>

                <div className='consent-request-box'>
                    <div className="consent-request" onClick={() => handleSelectConsent(1)}>
                        <p><span className='bold'>Einwilligungsfrage 1:</span> Forschungsprojekt eines privaten Pharmaunternehmens</p>
                    </div>

                    <div className="consent-request" onClick={() => handleSelectConsent(2)}>
                        <p><span className='bold'>Einwilligungsfrage 2:</span> Forschungsprojekt des Militärs</p>
                    </div>

                    <div className="consent-request" onClick={() => handleSelectConsent(3)}>
                        <p><span className='bold'>Einwilligungsfrage 3:</span> Daten zur psychischen Gesundheit für Pandemieforschung</p>
                    </div>
                </div>
            </div>
        </PageLayout >
    );
}

export default ConsentRequests;
