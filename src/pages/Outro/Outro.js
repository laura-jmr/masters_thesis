import { MailCheckIcon } from '../../components/Icons/MailCheckIconAnimated';
import PageLayout from '../PageLayout';
import './Outro.css';

function Outro() {

    return (
        <PageLayout>
            <div id='outro'>
                <svg viewBox="0 0 200 200" className="circle-svg">
                    <defs>
                        <path
                            id="circlePath"
                            d="M 100, 100
               m -75, 0
               a 75,75 0 1,1 150,0
               a 75,75 0 1,1 -150,0"
                        />
                    </defs>

                    <text className="rotating-text">
                        <textPath href="#circlePath" startOffset="0%">
                            Danke fürs Teilnehmen • Danke fürs Teilnehmen • Danke fürs Teilnehmen •
                        </textPath>

                    </text>
                </svg>
                <MailCheckIcon size={"5rem"} className="outro-check"/>
            </div>
        </PageLayout>
    );
}

export default Outro;
