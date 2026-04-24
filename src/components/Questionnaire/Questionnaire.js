import { useState } from "react";
import './Questionnaire.css';

function Questionnaire() {
    const [formData, setFormData] = useState({
        discrimination: 4,
        privacy: 4,
        trust: 4,
        prosocial: 4,
        personalBenefit: 4,
        scientificprogress: 4,
        reciprocity: 4,

        legal: 4,
        purpose: 4,
        datatype: 4,
        organization: 4,
        commercialuse: 4,
        identifiability: 4,
        medicaldomain: 4,
        healthconditions: 4,
        consentvalid: 4,
        duration: 4,
        placeOfCollection: 4,
        timeframeOfCollection: 4,

        age: '',
        gender: '',
        education: '',
        location: '',
    });

    const [result, setResult] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [finalDecision, setFinalDecision] = useState(null);

    function handleChange(event) {
        const { name, value, type } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' || type === 'range' ? Number(value) : value,
        }));
    }

    function mapLikertToPoints(value) {
        return Number(value) - 4;
    }

    function calculatePrediction(data) {
        const contributions = [
            {
                label: 'Discrimination Concerns',
                value: mapLikertToPoints(data.discrimination) * -1,
            },
            {
                label: 'Privacy Concerns',
                value: mapLikertToPoints(data.privacy) * -1,
            },
            {
                label: 'Trust in Data Use',
                value: mapLikertToPoints(data.trust),
            },
            {
                label: 'Pro-Social Motives',
                value: mapLikertToPoints(data.prosocial),
            },
            {
                label: 'Personal Benefit',
                value: mapLikertToPoints(data.personalBenefit),
            },
            {
                label: 'Scientific Progress',
                value: mapLikertToPoints(data.scientificprogress),
            },
            {
                label: 'Reciprocity',
                value: mapLikertToPoints(data.reciprocity),
            },
            {
                label: 'Legal Regulations',
                value: mapLikertToPoints(data.legal),
            },
            {
                label: 'Purpose of Use',
                value: mapLikertToPoints(data.purpose),
            },
            {
                label: 'Data Type',
                value: mapLikertToPoints(data.datatype),
            },
            {
                label: 'Organization Type',
                value: mapLikertToPoints(data.organization),
            },
            {
                label: 'Commercial Use',
                value: mapLikertToPoints(data.commercialuse) * -1,
            },
            {
                label: 'Identifiability',
                value: mapLikertToPoints(data.identifiability) * -1,
            },
            {
                label: 'Medical Domain',
                value: mapLikertToPoints(data.medicaldomain),
            },
            {
                label: 'Health Conditions',
                value: mapLikertToPoints(data.healthconditions),
            },
            {
                label: 'Consent Validity',
                value: mapLikertToPoints(data.consentvalid),
            },
            {
                label: 'Duration of Use',
                value: mapLikertToPoints(data.duration),
            },
            {
                label: 'Place of Collection',
                value: mapLikertToPoints(data.placeOfCollection),
            },
            {
                label: 'Timeframe of Collection',
                value: mapLikertToPoints(data.timeframeOfCollection),
            },
        ];

        const score = contributions.reduce((sum, item) => sum + item.value, 0);

        const sortedReasons = [...contributions]
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
            .slice(0, 3);

        let prediction = '';
        if (score > 0) {
            prediction = 'Consent recommended';
        } else {
            prediction = 'Consent not recommended';
        }

        const explanation = buildExplanation(prediction, sortedReasons, score);

        return {
            score,
            prediction,
            explanation,
            reasons: sortedReasons,
        };
    }

    function buildExplanation(prediction, reasons, score) {
        const positive = reasons.filter((r) => r.value > 0).map((r) => r.label);
        const negative = reasons.filter((r) => r.value < 0).map((r) => r.label);

        if (prediction === 'Consent recommended') {
            return `The total score is ${score}. The strongest factors supporting consent were ${positive.join(', ')}${negative.length ? `, while ${negative.join(', ')} spoke against it.` : '.'
                }`;
        }

        return `The total score is ${score}. The strongest factors against consent were ${negative.join(', ')}${positive.length ? `, while ${positive.join(', ')} supported it.` : '.'
            }`;
    }

    function handleSubmit(event) {
        event.preventDefault();

        const predictionResult = calculatePrediction(formData);
        setResult(predictionResult);
        setShowModal(true);
        setFinalDecision(null);
    }

    function handleFinalDecision(decision) {
        setFinalDecision(decision);
    }

    return (
        <div className="questionnaire">
            <form onSubmit={handleSubmit}>
                <h2>Your Factors:</h2>
                <div id='personal_factors'>
                    <div>
                        <p>"I have concerns about being discriminated."</p>
                        <input type="range" id="discrimination" name="discrimination" min="0" max="7" step="1" value={formData.discrimination} onChange={handleChange}></input>
                        <label for="discrimination">Discrimination Concerns</label>
                    </div>

                    <div>
                        <p>"I have concerns privacy concerns."</p>
                        <input type="range" id="privacy" name="privacy" min="0" max="7" step="1" value={formData.privacy} onChange={handleChange}></input>
                        <label for="privacy">Privacy Concerns</label>
                    </div>

                    <div>
                        <p>"I trust in the data use."</p>
                        <input type="range" id="trust" name="trust" min="0" max="7" step="1" value={formData.trust} onChange={handleChange}></input>
                        <label for="trust">Trust in Data Use</label>
                    </div>

                    <div>
                        <p>"I want to help society."</p>
                        <input type="range" id="prosocial" name="prosocial" min="0" max="7" step="1" value={formData.prosocial} onChange={handleChange}></input>
                        <label for="prosocial">Pro-Social Motives</label>
                    </div>

                    <div>
                        <p>"I want to advance science"</p>
                        <input type="range" id="scientificprogress" name="scientificprogress" min="0" max="7" step="1" value={formData.scientificprogress} onChange={handleChange}></input>
                        <label for="scientificprogress">Scientific Progress</label>
                    </div>

                    <div>
                        <p>"I want to give back to the medical system."</p>
                        <input type="range" id="reciprocity" name="reciprocity" min="0" max="7" step="1" value={formData.reciprocity} onChange={handleChange}></input>
                        <label for="reciprocity">Reciprocity</label>
                    </div>
                </div>

                <h2>Decision Dimensions:</h2>
                <div id='data_factors'>
                    <div>
                        <p>"I agree with the legal regulations."</p>
                        <input type="range" id="legal" name="legal" min="0" max="7" step="1" value={formData.legal} onChange={handleChange}></input>
                        <label for="legal">Legal regulations</label>
                    </div>

                    <div>
                        <p>"I agree with the purpose of use."</p>
                        <input type="range" id="purpose" name="purpose" min="0" max="7" step="1" value={formData.purpose} onChange={handleChange}></input>
                        <label for="purpose">Purpose of Use</label>
                    </div>

                    <div>
                        <p>"I agree with the data type."</p>
                        <input type="range" id="datatype" name="datatype" min="0" max="7" step="1" value={formData.datatype} onChange={handleChange}></input>
                        <label for="datatype">Data Type</label>
                    </div>

                    <div>
                        <p>"I agree with the organization."</p>
                        <input type="range" id="organization" name="organization" min="0" max="7" step="1" value={formData.organization} onChange={handleChange}></input>
                        <label for="organization">Organization Type</label>
                    </div>

                    <div>
                        <p>"I agree with the commercial use."</p>
                        <input type="range" id="commercialuse" name="commercialuse" min="0" max="7" step="1" value={formData.commercialuse} onChange={handleChange}></input>
                        <label for="commercialuse">Commercial Use</label>
                    </div>

                    <div>
                        <p>"I agree with being identifiable."</p>
                        <input type="range" id="identifiability" name="identifiability" min="0" max="7" step="1" value={formData.identifiability} onChange={handleChange}></input>
                        <label for="identifiability">Identifiability</label>
                    </div>

                    <div>
                        <p>"I agree with the medical domain."</p>
                        <input type="range" id="medicaldomain" name="medicaldomain" min="0" max="7" step="1" value={formData.medicaldomain} onChange={handleChange}></input>
                        <label for="medicaldomain">Medical Domain</label>
                    </div>

                    <div>
                        <p>"I agree with the my health conditions."</p>
                        <input type="range" id="healthconditions" name="healthconditions" min="0" max="7" step="1" value={formData.healthconditions} onChange={handleChange}></input>
                        <label for="healthconditions">Health Conditions</label>
                    </div>

                    <div>
                        <p>"I agree with the consent validity."</p>
                        <input type="range" id="consentvalid" name="consentvalid" min="0" max="7" step="1" value={formData.consentvalid} onChange={handleChange}></input>
                        <label for="consentvalid">Consent Validity</label>
                    </div>

                    <div>
                        <p>"I agree with the duration of use."</p>
                        <input type="range" id="duration" name="duration" min="0" max="7" step="1" value={formData.duration} onChange={handleChange}></input>
                        <label for="duration">Duration of Use</label>
                    </div>
                </div>

                <h2>Your Characteristics:</h2>
                <div id='characteristics'>
                    <div>
                        <input type='number' id='age' name='age' min={18} max={120} value={formData.age} onChange={handleChange}></input>
                        <label for="age">Age</label>
                    </div>

                    <fieldset>
                        <legend>Select the gender you identify with</legend>
                        <div>
                            <input type='radio' id='female' name='gender' value="female" checked={formData.gender === 'female'} onChange={handleChange}></input>
                            <label for="female">Female</label>
                        </div>

                        <div>
                            <input type='radio' id='male' name='gender' value="male" checked={formData.gender === 'male'} onChange={handleChange}></input>
                            <label for="male">Male</label>
                        </div>

                        <div>
                            <input type='radio' id='diverse' name='gender' value="diverse" checked={formData.gender === 'diverse'} onChange={handleChange}></input>
                            <label for="diverse">Diverse</label>
                        </div>

                        <div>
                            <input type='radio' id='no' name='gender' value="no" checked={formData.gender === 'no'} onChange={handleChange}></input>
                            <label for="no">No Answer</label>
                        </div>
                    </fieldset>


                    <fieldset>
                        <legend>Select your current education:</legend>
                        <div>
                            <input type='radio' id='hauptschule' name='education' value="hauptschule" checked={formData.education === 'hauptschule'} onChange={handleChange}></input>
                            <label for="hauptschule">Hauptschulabschluss</label>
                        </div>

                        <div>
                            <input type='radio' id='realschule' name='education' value="realschule" checked={formData.education === 'realschule'} onChange={handleChange}></input>
                            <label for="realschule">Realschulabschluss</label>
                        </div>

                        <div>
                            <input type='radio' id='highschool' name='education' value="highschool" checked={formData.education === 'highschool'} onChange={handleChange}></input>
                            <label for="highschool">Highschool Degree (Abitur)</label>
                        </div>

                        <div>
                            <input type='radio' id='university' name='education' value="universityfirst" checked={formData.education === 'universityfirst'} onChange={handleChange}></input>
                            <label for="university">First University Degree (Bachelor)</label>
                        </div>

                        <div>
                            <input type='radio' id='universitysecond' name='education' value="universitysecond" checked={formData.education === 'universitysecond'} onChange={handleChange}></input>
                            <label for="universitysecond">Second University Degree (Master)</label>
                        </div>

                        <div>
                            <input type='radio' id='universitythird' name='education' value="universitythird" checked={formData.education === 'universitythird'} onChange={handleChange}></input>
                            <label for="universitythird">Third Univerity Degree (Doctor)</label>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Where do you live?</legend>
                        <div>
                            <input type='radio' id='countyside' name='location' value="countyside" checked={formData.location === 'countyside'} onChange={handleChange}></input>
                            <label for="countyside">Country side</label>
                        </div>

                        <div>
                            <input type='radio' id='city' name='location' value="city" checked={formData.location === 'city'} onChange={handleChange}></input>
                            <label for="city">City</label>
                        </div>

                        <div>
                            <input type='radio' id='bigcity' name='location' value="bigcity" checked={formData.location === 'bigcity'} onChange={handleChange}></input>
                            <label for="bigcity">Big City</label>
                        </div>
                    </fieldset>
                </div>

                <input type='submit' />
            </form>

            {showModal && result && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>AIdvice's recommendation:</h2>
                        <p className="prediction">{result.prediction}</p>
                        <p className="explanation">{result.explanation}</p>

                        <div className="reason-list">
                            <h3>Main factors</h3>
                            <ul>
                                {result.reasons.map((reason) => (
                                    <li key={reason.label}>
                                        {reason.label} ({reason.value > 0 ? 'supports consent' : 'speaks against consent'})
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="decision-buttons">
                            <button type="button" onClick={() => handleFinalDecision('consent')}>
                                Consent
                            </button>
                            <button type="button" onClick={() => handleFinalDecision('not-consent')}>
                                Not Consent
                            </button>
                        </div>

                        {finalDecision && (
                            <p className="final-decision">
                                Your choice: {finalDecision === 'consent' ? 'Consent' : 'Not Consent'}
                            </p>
                        )}

                        <button type="button" className="close-button" onClick={() => setShowModal(false)}>
                            x
                        </button>
                    </div>
                    <div className="darken"></div>
                </div>
            )}
        </div>
    );
}

export default Questionnaire;

/*
Patient Factors:
Discrimination Concerns
Privacy Concerns
Trust in Data Use
Pro-Social Motives
Personal Benefit
Scientific Progress
Reciprocity

Patient Characteristics:
age
gender
education
location

Decision Dimension (Data):
Legal regulations
Purpose of Use
Data Type
Organization Type
Commercial Use
Identifiability
-
Medical Domain
Health Conditions
Consent Validity
Duration of Use
Place of Collection
Timeframe of Collection
*/