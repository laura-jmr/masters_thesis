import React, { useMemo } from "react";

function formatHumanName(name) {
    if (!name) return "Unknown patient";
    const given = Array.isArray(name.given) ? name.given.join(" ") : "";
    const family = name.family || "";
    return `${given} ${family}`.trim();
}

function formatAddress(address) {
    if (!address) return "";
    const line = Array.isArray(address.line) ? address.line.join(", ") : "";
    return [line, address.city, address.state, address.postalCode]
        .filter(Boolean)
        .join(", ");
}

function getFirstTelecomValue(telecom = [], system) {
    const entry = telecom.find((item) => item.system === system);
    return entry ? entry.value : "";
}

function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("de-DE");
}

function parsePatientBundle(bundle) {
    const resources = (bundle.entry || [])
        .map((entry) => entry.resource)
        .filter(Boolean);

    const patient = resources.find((r) => r.resourceType === "Patient");
    const conditions = resources.filter((r) => r.resourceType === "Condition");
    const medications = resources.filter(
        (r) => r.resourceType === "MedicationRequest"
    );
    const immunizations = resources.filter(
        (r) => r.resourceType === "Immunization"
    );

    const patientSummary = patient
        ? {
            id: patient.id || "",
            fullName: formatHumanName(patient.name && patient.name[0]),
            gender: patient.gender,
            birthDate: patient.birthDate,
            phone: getFirstTelecomValue(patient.telecom, "phone"),
            address: formatAddress(patient.address && patient.address[0]),
            language:
                patient.communication &&
                patient.communication[0] &&
                patient.communication[0].language &&
                patient.communication[0].language.text,
            maritalStatus: patient.maritalStatus && patient.maritalStatus.text,
        }
        : null;

    const mappedConditions = conditions.map((condition, index) => ({
        id: condition.id || `condition-${index}`,
        label:
            (condition.code && condition.code.text) ||
            (condition.code &&
                condition.code.coding &&
                condition.code.coding[0] &&
                condition.code.coding[0].display) ||
            "Unknown condition",
        clinicalStatus:
            condition.clinicalStatus &&
            condition.clinicalStatus.coding &&
            condition.clinicalStatus.coding[0] &&
            condition.clinicalStatus.coding[0].code,
        onset: condition.onsetDateTime,
    }));

    const mappedMedications = medications.map((med, index) => ({
        id: med.id || `med-${index}`,
        name:
            (med.medicationCodeableConcept &&
                med.medicationCodeableConcept.text) ||
            (med.medicationCodeableConcept &&
                med.medicationCodeableConcept.coding &&
                med.medicationCodeableConcept.coding[0] &&
                med.medicationCodeableConcept.coding[0].display) ||
            "Unknown medication",
        status: med.status,
        authoredOn: med.authoredOn,
        requester: med.requester && med.requester.display,
        dosage:
            med.dosageInstruction &&
            med.dosageInstruction[0] &&
            med.dosageInstruction[0].text,
    }));

    const mappedImmunizations = immunizations.map((imm, index) => ({
        id: imm.id || `imm-${index}`,
        vaccine:
            (imm.vaccineCode && imm.vaccineCode.text) ||
            (imm.vaccineCode &&
                imm.vaccineCode.coding &&
                imm.vaccineCode.coding[0] &&
                imm.vaccineCode.coding[0].display) ||
            "Unknown vaccine",
        date: imm.occurrenceDateTime,
        location: imm.location && imm.location.display,
    }));

    return {
        patient: patientSummary,
        conditions: mappedConditions,
        medications: mappedMedications,
        immunizations: mappedImmunizations,
    };
}

export default function PatientDashboard({ bundle }) {
    const data = useMemo(() => parsePatientBundle(bundle), [bundle]);

    if (!data.patient) {
        return <div>Kein Patient im Bundle gefunden.</div>;
    }

    return (
        <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                }}
            >
                <h1 style={{ marginTop: 0 }}>{data.patient.fullName}</h1>
                <p><strong>Geschlecht:</strong> {data.patient.gender || "—"}</p>
                <p><strong>Geburtsdatum:</strong> {formatDate(data.patient.birthDate)}</p>
                <p><strong>Telefon:</strong> {data.patient.phone || "—"}</p>
                <p><strong>Adresse:</strong> {data.patient.address || "—"}</p>
                <p><strong>Sprache:</strong> {data.patient.language || "—"}</p>
                <p><strong>Familienstand:</strong> {data.patient.maritalStatus || "—"}</p>
            </section>

            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                }}
            >
                <h2>Diagnosen</h2>
                {data.conditions.length === 0 ? (
                    <p>Keine Diagnosen vorhanden.</p>
                ) : (
                    <ul>
                        {data.conditions.slice(0, 10).map((condition) => (
                            <li key={condition.id} style={{ marginBottom: 12 }}>
                                <div><strong>{condition.label}</strong></div>
                                <div>Status: {condition.clinicalStatus || "—"}</div>
                                <div>Beginn: {formatDate(condition.onset)}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                }}
            >
                <h2>Medikamente</h2>
                {data.medications.length === 0 ? (
                    <p>Keine Medikamente vorhanden.</p>
                ) : (
                    <ul>
                        {data.medications.slice(0, 10).map((med) => (
                            <li key={med.id} style={{ marginBottom: 12 }}>
                                <div><strong>{med.name}</strong></div>
                                <div>Status: {med.status || "—"}</div>
                                <div>Verordnet am: {formatDate(med.authoredOn)}</div>
                                <div>Arzt/Ärztin: {med.requester || "—"}</div>
                                <div>Dosierung: {med.dosage || "—"}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section
                style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                }}
            >
                <h2>Impfungen</h2>
                {data.immunizations.length === 0 ? (
                    <p>Keine Impfungen vorhanden.</p>
                ) : (
                    <ul>
                        {data.immunizations.slice(0, 10).map((imm) => (
                            <li key={imm.id} style={{ marginBottom: 12 }}>
                                <div><strong>{imm.vaccine}</strong></div>
                                <div>Datum: {formatDate(imm.date)}</div>
                                <div>Ort: {imm.location || "—"}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}