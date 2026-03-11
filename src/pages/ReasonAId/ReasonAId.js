import ChatBox from '../../components/Chatbox/Chatbox';
import Sidemenu from '../../components/Sidemenu/Sidemenu';
import PageLayout from '../PageLayout';
import './ReasonAId.css';
import { useState } from "react";

function ReasonAId() {
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
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

  const expandAll = (sections) => {
    const newState = {};
    sections.forEach((s) => {
      newState[s] = true;
    });

    setOpenSections((prev) => ({
      ...prev,
      ...newState
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

  async function testBackend() {
    try {
      const res = await fetch("http://localhost:5050/api/test");
      const data = await res.json();
      setReply(JSON.stringify(data, null, 2));
      console.log("Backend test:", data);
    } catch (error) {
      console.error("Backend test failed:", error);
      setReply("Error: " + error.message);
    }
  }

  return (
    <PageLayout>
      <div id='reasonaid'>
        <Sidemenu />
        <ChatBox />

        <div className='information-container'>

          <div className='information-data-container'>
            <h2><i class="fa fa-address-card"></i> Your Data
              <div className="section-controls">
                <button onClick={() => expandAll(personalSections)}>Expand all</button>
                <button onClick={() => collapseAll(personalSections)}>Close all</button>
              </div>
            </h2>
            <ul className='information-personal-data'>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("demographics")}>Demographics <i className={`fa fa-chevron-right chevron ${openSections["demographics"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["demographics"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>Name</span>Mustermann</li>
                  <li className='information-personal-item'><span>Vorname</span>Max</li>
                  <li className='information-personal-item'><span>Age</span>39</li>
                  <li className='information-personal-item'><span>Adresse</span>Musterstrasse 20, 10000 Berlin</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("diagnosen")}>Diagnosen <i className={`fa fa-chevron-right chevron ${openSections["diagnosen"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["diagnosen"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>Test</span>Test</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("medical_history")}>Medical History <i className={`fa fa-chevron-right chevron ${openSections["medical_history"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["medical_history"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>Test</span>Test</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("hospitalization")}>Hospitalization <i className={`fa fa-chevron-right chevron ${openSections["hospitalization"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["hospitalization"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>Test</span>Test</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("medikamente")}>Medikamente <i className={`fa fa-chevron-right chevron ${openSections["medikamente"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["medikamente"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>Test</span>Test</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className='information-data-container'>
            <h2><i class="fa fa-envelope-open"></i> Consent Request
              <div className="section-controls">
                <button onClick={() => expandAll(requestSections)}>Expand all</button>
                <button onClick={() => collapseAll(requestSections)}>Close all</button>
              </div>
            </h2>

            <ul className='information-personal-data'>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("requester")}>Requester <i className={`fa fa-chevron-right chevron ${openSections["requester"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["requester"] ? "open" : ""}`}>
                  <li className='information-personal-item'>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("requested_data")}>Requested Data <i className={`fa fa-chevron-right chevron ${openSections["requested_data"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["requested_data"] ? "open" : ""}`}>
                  <li className='information-personal-item'>Data 1</li>
                  <li className='information-personal-item'>Data 2</li>
                  <li className='information-personal-item'>Data 3</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("data_handling")}>Data Handling <i className={`fa fa-chevron-right chevron ${openSections["data_handling"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["data_handling"] ? "open" : ""}`}>
                  <li className='information-personal-item'>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("data_storage_duration")}>Data Storage Duration <i className={`fa fa-chevron-right chevron ${openSections["data_storage_duration"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["data_storage_duration"] ? "open" : ""}`}>
                  <li className='information-personal-item'>1 year and 3 months.</li>
                </ul>
              </li>
            </ul>

          </div>

        </div>

      </div>
    </PageLayout >
  );
}

export default ReasonAId;
