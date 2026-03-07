import PageLayout from '../PageLayout';
import './Home.css';

function Home() {

    return (
        <PageLayout>
            <div id='home'>
                <div className='hint'>
                    <p>ReasonAId is an AI powered chatbot, that will try to help you in your decision making.
                    </p>
                    <br/>
                    <p>Feel free to interact with ReasonAId aslong as you wish to.</p>
                </div>
                <div className='hint'>
                    <p>You will go through <span className='bold'>two consent requests</span>, where you will receive different kind of AI decision support.
                    </p>
                    <br/>
                    <p>In the end, you decide for each consent request, if you want to share your fictive data or not.</p>
                </div>

                <div className='hint'>
                    <p>After finishing the first consent request, you will get back to this page to proceed with the second consent request.
                    </p>
                </div>
                <a className='button'>Continue</a>
            </div>
        </PageLayout >
    );
}

export default Home;
