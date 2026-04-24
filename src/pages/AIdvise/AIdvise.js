import ChatBox from '../../components/Chatbox/Chatbox';
import { SquareChevronUpIcon } from '../../components/Icons/SquareChevronUpAnimated';
import Questionnaire from '../../components/Questionnaire/Questionnaire';
import Sidemenu from '../../components/Sidemenu/Sidemenu';
import Tooltip from '../../components/Tooltip/Tooltip';
import PageLayout from '../PageLayout';
import './AIdvise.css';
import { useState } from "react";

function AIdvise() {
  const [openSections, setOpenSections] = useState({});

  const personalSections = [
    "demographics",
    "diagnosen",
    "medical_history",
    "hospitalization",
    "medikamente"
  ];

  const requestSections = [
    "requester",
    "requested_data",
    "data_handling",
    "data_storage_duration"
  ];

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const collapseAll = (sections) => {
    const newState = {};
    sections.forEach((s) => {
      newState[s] = false;
    });

    setOpenSections((prev) => ({
      ...prev,
      ...newState
    }));
  };

  return (
    <PageLayout>
      <div id='aidvise'>
        <Questionnaire />
        <div className='information-container'>

          <div className='information-data-container'>
            <h2><i class="fa fa-address-card"></i> Your Data
              <div className="section-controls">
                <Tooltip text={"Close all"} align={"left"}>
                  <button onClick={() => collapseAll(personalSections)}><SquareChevronUpIcon /></button>
                </Tooltip>
              </div>
            </h2>
            <ul className='information-personal-data'>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("demographics")}>Demographics <i className={`fa fa-chevron-right chevron ${openSections["demographics"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["demographics"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>Name</span>Beatty507</li>
                  <li className='information-personal-item'><span>Vorname</span>Jerry654</li>
                  <li className='information-personal-item'><span>Age</span>18</li>
                  <li className='information-personal-item'><span>Birth Date</span>2007-11-04</li>
                  <li className='information-personal-item'><span>Ethnicity</span>Hispanic</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("conditions")}>Conditions <i className={`fa fa-chevron-right chevron ${openSections["conditions"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["conditions"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>2026-01-11 - 2026-01-11</span>Gingival disease (disorder)</li>
                  <li className='information-personal-item'><span>2025-12-28 -           </span>Stress (finding)</li>
                  <li className='information-personal-item'><span>2025-12-28 -           </span>Unemployed (finding)</li>
                  <li className='information-personal-item'><span>2024-12-01 - 2025-06-29</span>Normal pregnancy (finding)</li>
                  <li className='information-personal-item'><span>2024-03-22 - 2024-04-04</span>Acute bronchitis (disorder)</li>
                  <li className='information-personal-item'><span>2024-01-07 - 2024-05-02</span>Fracture of forearm (disorder)</li>
                  <li className='information-personal-item'><span>2020-01-31 - 2025-11-09</span>Child attention deficit disorder (disorder)</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("reports")}>Reports <i className={`fa fa-chevron-right chevron ${openSections["reports"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["reports"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>2025-12-28</span>Alcohol Use Disorder Identification Test - Consumption [AUDIT-C]<br /> - Total score [AUDIT-C]: 1.0 [score]</li>
                  <li className='information-personal-item'><span>2025-12-28</span>Humiliation, Afraid, Rape, and Kick questionnaire [HARK]<br />- Total score [HARK]: 0.0 [score]</li>
                  <li className='information-personal-item'><span>2025-12-28</span>Generalized anxiety disorder 7 item (GAD-7)<br />- Generalized anxiety disorder 7 item (GAD-7) total score [Reported.PHQ] 1.0 [score]</li>
                  <li className='information-personal-item'><span>2024-03-31</span>Morse Fall Scale panel<br />- Fall risk total [Morse Fall Scale]: 39.0 (#)<br />- Fall risk level [Morse Fall Scale]: Moderate Risk (MFS Score 25 - 45)</li>
                  <li className='information-personal-item'><span>2023-12-17</span>CBC panel - Blood by Automated count<br />- Leukocytes [#/volume] in Blood by Automated count: 5.2 10*3/uL<br />- Erythrocytes [#/volume] in Blood by Automated count: 5.1 10*6/uL<br />- Hemoglobin [Mass/volume] in Blood: 13.7 g/dL<br />- Hematocrit [Volume Fraction] of Blood by Automated count: 41.1 %<br />- MCV [Entitic mean volume] in Red Blood Cells by Automated count: 81.3 fL<br />- MCH [Entitic mass] by Automated count: 27.2 pg<br />- MCHC [Entitic Mass/volume] in Red Blood Cells by Automated count: 34.7 g/dL<br />- Erythrocyte [DistWidth] in Blood by Automated count: 40.4 fL<br />- Platelets [#/volume] in Blood by Automated count: 320.3 10*3/uL<br />- Platelet distribution width [Entitic volume] in Blood by Automated count: 263.0 fL<br />- Platelet [Entitic mean volume] in Blood by Automated count: 11.4 fL</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("observations")}>Observations <i className={`fa fa-chevron-right chevron ${openSections["observations"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["observations"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>2025-12-28</span>Protocol for Responding to and Assessing Patients' Assets, Risks, and Experiences [PRAPARE]<br />- Within the last year, have you been afraid of your partner or ex-partner: No<br />- Do you feel physically and emotionally safe where you currently live [PRAPARE]: Yes<br />- Are you a refugee: No<br />- Have you spent more than 2 nights in a row in a jail, prison, detention center, or juvenile correctional facility in past 1 year [PRAPARE]: No<br />- Stress level: A little bit<br />- How often do you see or talk to people that you care about and feel close to [PRAPARE]: 3 to 5 times a week<br />- Has lack of transportation kept you from medical appointments, meetings, work, or from getting things needed for daily living: No<br />- Have you or any family members you live with been unable to get any of the following when it was really needed in past 1 year [PRAPARE]: Utilities<br />- What was your best estimate of the total income of all family members from all sources, before taxes, in last year [PhenX]: 10819 /a<br />- Primary insurance: Medicaid<br />- Employment status - current: Unemployed<br />- Highest level of education: Less than high school degree<br />- Address: 728 Klein Overpass Apt 42<br />- Are you worried about losing your housing [PRAPARE]: Yes<br />- Housing status: I have housing<br />- How many people are living or staying at this address [#]: 3.0 (#)<br />- Preferred language: English<br />- Discharged from the U.S. Armed Forces: No<br />- Has season or migrant farm work been your or your family's main source of income at any point in past 2 years [PRAPARE]: No<br />- Race: White<br />- Hispanic or Latino: No</li>
                  <li className='information-personal-item'><span>Tobacco smoking status</span>Never smoked tobacco (finding)</li>
                  <li className='information-personal-item'><span>Heart rate</span>86.0 /min</li>
                  <li className='information-personal-item'><span>Blood pressure panel with all children optional</span>- Diastolic Blood Pressure: 84.0 mm[Hg]<br />- Systolic Blood Pressure: 107.0 mm[Hg]</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className='information-data-container'>
            <h2><i class="fa fa-envelope-open"></i> Consent Request
              <div className="section-controls">
                <Tooltip text={"Close all"} align={"left"}>
                  <button onClick={() => collapseAll(requestSections)}><SquareChevronUpIcon /></button>
                </Tooltip>
              </div>
            </h2>

            <ul className='information-personal-data'>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("requester")}>Requesting organization <i className={`fa fa-chevron-right chevron ${openSections["requester"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["requester"] ? "open" : ""}`}>
                  <li className='information-personal-item'>Charité – Universitätsmedizin Berlin<br />Research collaboration with the European Alzheimer’s Research Consortium</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("purpose")}>Purpose <i className={`fa fa-chevron-right chevron ${openSections["purpose"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["purpose"] ? "open" : ""}`}>
                  <li className='information-personal-item'>Researchers are studying ways to detect Alzheimer’s disease years before symptoms appear. Early detection may improve treatment and quality of life for future patients.</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("data_requested")}>Data requested <i className={`fa fa-chevron-right chevron ${openSections["data_requested"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["data_requested"] ? "open" : ""}`}>
                  <li className='information-personal-item'>If you agree, the following data may be shared with the research team:<br />- Diagnoses and medical history<br />- Laboratory results and imaging reports<br />- Medication history<br />- Basic demographic data (age range, gender)<br />All identifying information (such as your name and address) will be removed before sharing.</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("benefits")}>Potential benefits <i className={`fa fa-chevron-right chevron ${openSections["benefits"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["benefits"] ? "open" : ""}`}>
                  <li className='information-personal-item'>You will not directly benefit. However, your data may help improve early diagnosis and treatment for future patients.</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("risks")}>Possible risks <i className={`fa fa-chevron-right chevron ${openSections["risks"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["risks"] ? "open" : ""}`}>
                  <li className='information-personal-item'>Although the data is pseudonymized, there remains a small risk that individuals could be re-identified if datasets are combined.<br />Research findings may also contribute to commercial medical products in the future.</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("data_storage")}>Data storage <i className={`fa fa-chevron-right chevron ${openSections["data_storage"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["data_storage"] ? "open" : ""}`}>
                  <li className='information-personal-item'>Your pseudonymized data may be stored and used for research for up to 15 years.</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("data_sharing")}>Data sharing <i className={`fa fa-chevron-right chevron ${openSections["data_sharing"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["data_sharing"] ? "open" : ""}`}>
                  <li className='information-personal-item'>Your pseudonymized data may be shared with collaborating academic institutions involved in this research project.<br />These institutions must follow strict data protection and research ethics regulations.</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("commercial_use")}>Commercial use <i className={`fa fa-chevron-right chevron ${openSections["commercial_use"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["commercial_use"] ? "open" : ""}`}>
                  <li className='information-personal-item'>Research results may lead to the development of commercial diagnostic tools.<br />You will not receive financial compensation if such products are developed.</li>
                </ul>
              </li>
            </ul>

          </div>

        </div>

      </div>
    </PageLayout >
  );
}

export default AIdvise;
