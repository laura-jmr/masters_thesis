import ChatBox from '../../components/Chatbox/Chatbox';
import { SquareChevronUpIcon } from '../../components/Icons/SquareChevronUpAnimated';
import Sidemenu from '../../components/Sidemenu/Sidemenu';
import Tooltip from '../../components/Tooltip/Tooltip';
import PageLayout from '../PageLayout';
import './ReasonAId.css';
import { useState, useEffect } from "react";

function ReasonAId({ selectedConsent }) {
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [introActive, setIntroActive] = useState(false);
  const [introStep, setIntroStep] = useState(0);
  const [popupStyle, setPopupStyle] = useState({});
  const [overlayStyle, setOverlayStyle] = useState({});

  const saveMessage = async (message) => {
    await fetch("http://localhost:5050/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  };

  const introSteps = [
    {
      title: "Wilkommen bei ReasonAId",
      text: "Diese Seite bietet einen Chatbot namens ReasonAId, der Ihnen bei Ihrer Entscheidungsfindung hilft.",
    },
    {
      text: "Im Chat-Bereich kannst du mit ReasonAId interagieren.",
    },
    {
      text: "Dies sind die Action Buttons, die direkt eine Reaktion von ReasonAId auslösen.",
    },
    {
      text: "Dieser Button lässt ReasonAId eine Zusammenfassung des Gesprächs erstellen.",
    },
    {
      text: "Hier versucht ReasonAIds, Ihnen neue Perspektiven für Ihre Entscheidung aufzuzeigen. Nutzen Sie diesen Button, wenn Sie im Entscheidungsprozess nicht weiterkommen.",
    },
    {
      text: "Klicken Sie auf diesen Button, wenn Sie Ihre endgültige Entscheidung treffen möchten.",
    },
    {
      text: "Alle relevanten Informationen zu Ihren Daten und dem Consent Request finden Sie hier.",
    },
  ];

  const personalSections = [
    "demographics",
    "conditions",
    "reports",
    "observations"
  ];

  const requestSections = [
    "requester",
    "purpose",
    "data_requested",
    "benefits",
    "risks",
    "regulations"
  ];

  const consents = [
    {
      id: 0,
      title: "Forschungsprojekt eines privaten Pharmaunternehmens",
      recipient: "Sie werden gebeten, Ihre Gesundheitsdaten an ein privates Pharmaunternehmen weiterzugeben.",
      purpose: "Das Unternehmen hat sich zum Ziel gesetzt, personalisierte Therapien für chronische Erkrankungen zu entwickeln.",
      dataType: "Die angeforderten Daten umfassen Ihre medizinische Vorgeschichte inklusive der Behandlungsergebnisse und Ihre physiologische Daten (z.B. Blutdruck, Hormonspiegel). ",
      potentialBenefit: "Sie erhalten personalisierte Empfehlungen in Form von Therapiemaßnahmen und digitalen Gesundheitsberichten.",
      potentialRisk: "Es kann nicht ausgeschlossen werden, dass die Ergebnisse zur Entwicklung kommerzieller Produkte verwendet werden, was einer Verwendung über den ursprünglichen therapeutischen Zweck hinausgeht und die finanziellen Interessen des Unternehmens in den Vordergrund rückt.",
      dataRegulation: "Ihre Daten werden gemäß den geltenden Daten-schutzbestimmungen verarbeitet und gespeichert."
    },
    {
      id: 1,
      title: "Forschungsprojekt des Militärs",
      recipient: "Sie werden gebeten, Ihre Gesundheitsdaten für ein vom Militär finanziertes Forschungsprojekt zur Verfügung zu stellen. ",
      purpose: "Ziel des Projekts ist es, die medizinische Versorgung von Veteranen zu verbessern.",
      dataType: "Die angeforderten Daten umfassen Ihre medizinische Vorgeschichte inklusive der Behandlungsergebnisse und Ihre physiologische Daten (z.B. Blutdruck, Hormonspiegel).",
      potentialBenefit: "Die Ergebnisse können dazu beitragen, die Behandlung und Genesung von Veteranen nach Einsätzen zu verbessern und medizinische Fortschritte im Bereich der Rehabilitierung zu erzielen.",
      potentialRisk: "Es wird nicht ausgeschlossen, dass die gewonnenen Erkenntnisse zur Unterstützung militärischer Operationen und strategischer Planung genutzt werden können, was einer Nutzung über den ursprünglichen mediznischen Zweck hinausgeht.",
      dataRegulation: "Ihre Daten werden gemäß den geltenden Daten-schutzbestimmungen verarbeitet und gespeichert."
    },
    {
      id: 2,
      title: "Forschungsprojekt für die Pandemieforschung",
      recipient: "Sie werden gebeten, Ihre Gesundheitsdaten für ein staatlich finanziertes Forschungsprojekt an einer Universität zur Verfügung zu stellen.",
      purpose: "Ziel des Projekts ist es, zukünftige Pandemien effektiver zu bewältigen.",
      dataType: "Die angeforderten Daten umfassen Ihre  psychischen Gesundheitdaten (z.B. Diagnosen wie Depressionen oder Angststörungen) sowie Ihre genetischen Informationen (z.B. DNA-Test-Ergebnisse).",
      potentialBenefit: "Die Ergebnisse könnten dazu beitragen, frühzeitig Risikogruppen zu identifizieren, Präventionsmaßnahmen zu verbessern und die Reaktion auf zukünftige Gesundheitskrisen zu optimieren.",
      potentialRisk: "Ihre Daten werden anonymisiert, dennoch besteht insbesondere bei genetischen Informationen ein Restrisiko der Re-Identifikation.",
      dataRegulation: "Ihre Daten werden gemäß den geltenden Daten-schutzbestimmungen verarbeitet und gespeichert."
    }
  ];

  const activeConsent = consents.find(
    (consent) => consent.id === selectedConsent
  );

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("reasonaid-intro-seen");

    if (!hasSeenIntro) {
      setIntroActive(true);
      setIntroStep(0);
    } else {
      sendInitialBotMessage();
    }
  }, []);

  const sendInitialBotMessage = () => {
    const newMsg = {
      role: "bot",
      typ: "chat",
      text: (
        <>
          Hallo, ich bin <span className='cursive'>ReasonAId</span> - dein KI-Assistent bei der Entscheidung über deine Gesundheitsdaten.
          <br />
          Du betrachtest gerade die Anfrage über das <strong>{activeConsent?.title}</strong>.
          <br /><br />
          Wie stehst du zu dieser Einwilligungsanfrage?
        </>
      ),
      rawText: `Hallo, ich bin ReasonAId - dein KI-Assistent bei der Entscheidung über deine Gesundheitsdaten. Du betrachtest gerade die Anfrage über das ${activeConsent?.title}.  Wie stehst du zu dieser Einwilligungsanfrage?`,
      time: new Date()
    };

    setMessages((prev) => [
      ...prev,
      newMsg
    ]);

    saveMessage({
      role: newMsg.role,
      text: newMsg.rawText
    });
  };

  const handleNextIntroStep = () => {
    const nextStep = introStep + 1;

    if (nextStep < introSteps.length) {
      setIntroStep(nextStep);

      switch (nextStep) {
        case 0:
          setPopupStyle({
            top: "40vh",
            left: "calc(50vw - 250px)",
          });
          break;

        case 1:
          setPopupStyle({
            top: "20vh",
            left: "calc(50vw - 250px)",
          });
          break;

        case 2:
          setPopupStyle({
            top: "40vh",
            left: "6vw",
          });
          setOverlayStyle({ zIndex: 997 });
          break;

        case 3:
          setPopupStyle({
            top: "30vh",
            left: "6vw",
          });
          break;

        case 4:
          setPopupStyle({
            top: "40vh",
            left: "6vw",
          });
          break;

        case 5:
          setPopupStyle({
            top: "55vh",
            left: "6vw",
          });
          break;

        case 6:
          setPopupStyle({
            top: "80vh",
            left: "calc(50vw - 250px)",
          });
          setOverlayStyle({ zIndex: 999 });
          break;

        default:
          setPopupStyle({});
      }

    } else {
      setIntroActive(false);
      localStorage.setItem("reasonaid-intro-seen", "true");
      sendInitialBotMessage();
    }
  };

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
      <div id='reasonaid'>

        {introActive && (
          <div className="intro-overlay" style={overlayStyle} onClick={handleNextIntroStep}>
            <div className="intro-popup" style={popupStyle} onClick={(e) => e.stopPropagation()}>
              <h2>{introSteps[introStep].title}</h2>
              <p>{introSteps[introStep].text}</p>
              <span className="intro-hint">Klicken Sie auf eine beliebige Stelle, um fortzufahren.</span>
            </div>
          </div>
        )}

        <Sidemenu setMessages={setMessages} setLoading={setLoading} />
        <ChatBox messages={messages} setMessages={setMessages} loading={loading} setLoading={setLoading} activeConsent={activeConsent} />

        <div className='information-container'>

          <div className='information-data-container'>
            <h2><i class="fa fa-address-card"></i> Ihre Gesundheitsdaten
              <div className="section-controls">
                <Tooltip text={"Alles einklappen"} align={"left"}>
                  <button onClick={() => collapseAll(personalSections)}><SquareChevronUpIcon /></button>
                </Tooltip>
              </div>
            </h2>
            <ul className='information-personal-data'>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("demographics")}>Demografie <i className={`fa fa-chevron-right chevron ${openSections["demographics"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["demographics"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>Name</span>Beatty507</li>
                  <li className='information-personal-item'><span>Vorname</span>Jerry654</li>
                  <li className='information-personal-item'><span>Alter</span>18</li>
                  <li className='information-personal-item'><span>Geburtstag</span>2007-11-04</li>
                  <li className='information-personal-item'><span>Herkunft</span>Südamerika</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("conditions")}>Befunde <i className={`fa fa-chevron-right chevron ${openSections["conditions"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["conditions"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>2026-01-11 - 2026-01-11</span>Zahnfleischerkrankung (Erkrankung)</li>
                  <li className='information-personal-item'><span>2025-12-28 -           </span>Stress (Befund)</li>
                  <li className='information-personal-item'><span>2025-12-28 -           </span>Arbeitslos (Befund)</li>
                  <li className='information-personal-item'><span>2024-12-01 - 2025-06-29</span>Normale Schwangerschaft (Befund)</li>
                  <li className='information-personal-item'><span>2024-03-22 - 2024-04-04</span>Akute Bronchitis (Erkrankung)</li>
                  <li className='information-personal-item'><span>2024-01-07 - 2024-05-02</span>Unterarmbruch (Erkrankung)</li>
                  <li className='information-personal-item'><span>2020-01-31 - 2025-11-09</span>Aufmerksamkeitsdefizitstörung bei Kindern (Erkrankung)</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("reports")}>Berichte <i className={`fa fa-chevron-right chevron ${openSections["reports"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["reports"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>2025-12-28</span>Test zur Erkennung von Alkoholproblemen – Konsum [AUDIT-C]<br /> - Gesamtpunktzahl [AUDIT-C]: 1.0 [Punktzahl]</li>
                  <li className='information-personal-item'><span>2025-12-28</span>Fragebogen zu Demütigung, Angst, Vergewaltigung und Schlägen [HARK]<br />- Gesamtpunktzahl [HARK]: 0.0 [Punktzahl]</li>
                  <li className='information-personal-item'><span>2025-12-28</span>7-Punkte-Fragebogen zur generalisierten Angststörung (GAD-7)<br />- 7-Punkte-Fragebogen zur generalisierten Angststörung (GAD-7) Gesamtpunktzahl [Reported.PHQ] 1.0 [Punktzahl]</li>
                  <li className='information-personal-item'><span>2024-03-31</span>Morse-Fall-Skala-Tafel<br />- Gesamtsturzrisiko [Morse-Sturzskala]: 39.0 (#)<br />- Sturzrisikostufe [Morse-Fall-Skala]: Mäßiges Risiko (MFS-Wert 25–45)</li>
                  <li className='information-personal-item'><span>2023-12-17</span>CBC-Panel – Blutbild mittels automatisierter Zählung<br />- Leukozyten [#/Volumen] im Blut (automatische Zählung): 5,2 × 10³/µl<br />- Erythrozyten [#/Volumen] im Blut (automatische Zählung): 5,1 × 10⁶/µl<br />- Hämoglobin [Masse/Volumen] im Blut: 13,7 g/dl<br />- Hämatokrit [Volumenanteil] des Blutes nach automatischer Messung: 41,1 %<br />- MCV [mittleres korpuskuläres Volumen] der roten Blutkörperchen bei automatischer Zählung: 81,3 fL<br />- MCH [Hämoglobin-Konzentration] bei automatischer Zählung: 27,2 pg<br />- MCHC [mittleres Hämoglobingewicht] in roten Blutkörperchen bei automatischer Zählung: 34,7 g/dl<br />- Erythrozyten [DistWidth] im Blut, automatische Zählung: 40,4 fL<br />- Thrombozyten [#/Volumen] im Blut (automatische Zählung): 320,3 × 10³/µl<br />- Verteilungsbreite der Thrombozyten [Entitisches Volumen] im Blut bei automatischer Zählung: 263,0 fL<br />- Thrombozyten [mittleres Volumen] im Blut, automatische Zählung: 11,4 fL</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("observations")}>Beobachtungen <i className={`fa fa-chevron-right chevron ${openSections["observations"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["observations"] ? "open" : ""}`}>
                  <li className='information-personal-item'><span>2025-12-28</span>Protokoll zur Erfassung und Bewertung der Ressourcen, Risiken und Erfahrungen von Patienten [PRAPARE]<br />- Hattest du im letzten Jahr Angst vor deinem Partner oder Ex-Partner: Nein<br />- Fühlst du dich an deinem derzeitigen Wohnort körperlich und emotional sicher [PRAPARE]: Ja<br />- Sind Sie ein Flüchtling? Nein<br />- Haben Sie im letzten Jahr mehr als zwei Nächte in Folge in einem Gefängnis, einer Haftanstalt, einer Jugendstrafanstalt oder einer Jugendstrafvollzugsanstalt verbracht [PRAPARE]: Nein<br />- Stresslevel: Ein bisschen<br />- Wie oft sehen Sie Menschen, die Ihnen am Herzen liegen und denen Sie sich verbunden fühlen, oder sprechen mit ihnen [PRAPARE]: 3 bis 5 Mal pro Woche<br />- Hat Ihnen der fehlende Transport zu Arztterminen, Besprechungen, zur Arbeit oder zum Einkauf von Dingen des täglichen Bedarfs den Weg versperrt: Nein<br />- Konnten Sie oder Familienmitglieder, mit denen Sie zusammenleben, im letzten Jahr etwas von Folgendem nicht bekommen, obwohl es dringend benötigt wurde [PRAPARE]: Versorgungsleistungen<br />- Wie hoch schätzt du das Gesamteinkommen aller Familienmitglieder aus allen Quellen vor Steuern im letzten Jahr [PhenX]? 10819 /a<br />- Hauptversicherung: Medicaid<br />- Beschäftigungsstatus – aktuell: Arbeitslos<br />- Höchster Bildungsabschluss: unterhalb des Abiturs<br />- Adresse: 728 Klein Overpass, Wohnung 42<br />- Haben Sie Angst, Ihre Wohnung zu verlieren [PRAPARE]: Ja<br />- Wohnsituation: Ich habe eine Wohnung<br />- Wie viele Personen leben oder wohnen unter dieser Adresse [#]: 3,0 (#)<br />- Bevorzugte Sprache: Deutsch<br />- Aus den Deutschem Militär entlassen: Nein<br />- War die Arbeit als Saison- oder Wanderarbeiter in der Landwirtschaft in den letzten zwei Jahren zu irgendeinem Zeitpunkt die Haupteinkommensquelle für Sie oder Ihre Familie [PRAPARE]: Nein<br />- Ethnie: Weiß<br />- Hispanoamerikaner oder Latino: Nein</li>
                  <li className='information-personal-item'><span>Raucherstatus</span>Noch nie Tabak geraucht (Befund)</li>
                  <li className='information-personal-item'><span>Herzfrequenz</span>86.0 /Min</li>
                  <li className='information-personal-item'><span>Blutdruckmessung bei allen Kindern (optional)</span>- Diastolischer Blutdruck: 84,0 mm[Hg]<br />- Systolischer Blutdruck: 107,0 mm[Hg]</li>
                </ul>
              </li>
            </ul>
          </div>

          <div className='information-data-container'>
            <h2><i class="fa fa-envelope-open"></i> Einwilligungsanfrage
              <div className="section-controls">
                <Tooltip text={"Alle einklappen"} align={"left"}>
                  <button onClick={() => collapseAll(requestSections)}><SquareChevronUpIcon /></button>
                </Tooltip>
              </div>
            </h2>

            <ul className='information-personal-data'>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("requester")}>Empfänger <i className={`fa fa-chevron-right chevron ${openSections["requester"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["requester"] ? "open" : ""}`}>
                  <li className='information-personal-item'>{activeConsent.recipient}</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("purpose")}>Zweck <i className={`fa fa-chevron-right chevron ${openSections["purpose"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["purpose"] ? "open" : ""}`}>
                  <li className='information-personal-item'>{activeConsent.purpose}</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("data_requested")}>Angefragte Daten <i className={`fa fa-chevron-right chevron ${openSections["data_requested"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["data_requested"] ? "open" : ""}`}>
                  <li className='information-personal-item'>{activeConsent.dataType}</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("benefits")}>Potentieller Nutzen <i className={`fa fa-chevron-right chevron ${openSections["benefits"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["benefits"] ? "open" : ""}`}>
                  <li className='information-personal-item'>{activeConsent.potentialBenefit}</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("risks")}>Potentielle Risiken <i className={`fa fa-chevron-right chevron ${openSections["risks"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["risks"] ? "open" : ""}`}>
                  <li className='information-personal-item'>{activeConsent.potentialRisk}</li>
                </ul>
              </li>

              <li className='information-personal'>
                <span className='information-personal-header' onClick={() => toggleSection("regulations")}>Rechtliches <i className={`fa fa-chevron-right chevron ${openSections["regulations"] ? "open" : ""}`}></i></span>
                <ul className={`information-personal-list ${openSections["regulations"] ? "open" : ""}`}>
                  <li className='information-personal-item'>{activeConsent.dataRegulation}</li>
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
