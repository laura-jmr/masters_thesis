import PageLayout from '../PageLayout';
import './ConsentRequests.css';
import { useNavigate } from "react-router-dom";

function ConsentRequests() {
    const navigate = useNavigate();

    return (
        <PageLayout>
            <div id='consent-requests'>
                <div className="consent-request" onClick={() => navigate("/reasonaid")}>
                    <h2>Consent Request 1 with ReasonAId</h2>
                </div>

                <div className="consent-request" onClick={() => navigate("/aidvice")}>
                    <h2>Consent Request 2 with AIdvice</h2>
                </div>
            </div>
        </PageLayout >
    );
}

export default ConsentRequests;
