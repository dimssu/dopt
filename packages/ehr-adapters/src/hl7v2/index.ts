import type { Encounter, Patient } from '@clinical-notes/types';

/**
 * Minimal HL7v2 generators. ADT^A04 (register patient), ORM^O01 (order), and
 * ORU^R01 (observation result) — enough to demonstrate end-to-end with a
 * receiving system. Field separators per the HL7 v2.5.1 spec.
 */

const FIELD = '|';
const COMP = '^';
const REPEAT = '~';
const ESCAPE = '\\';
const SUBCOMP = '&';
const ENCODING = `${COMP}${REPEAT}${ESCAPE}${SUBCOMP}`;

export interface HL7Header {
  sendingApp: string;
  sendingFacility: string;
  receivingApp: string;
  receivingFacility: string;
  messageControlId: string;
  timestamp?: Date;
}

function msh(header: HL7Header, messageType: string): string {
  const ts = (header.timestamp ?? new Date()).toISOString().replace(/[-:T]/g, '').slice(0, 14);
  return [
    `MSH${FIELD}${ENCODING}`,
    header.sendingApp,
    header.sendingFacility,
    header.receivingApp,
    header.receivingFacility,
    ts,
    '',
    messageType,
    header.messageControlId,
    'P',
    '2.5.1',
  ].join(FIELD);
}

function pid(patient: Patient): string {
  const dob = patient.birthDate.toISOString().slice(0, 10).replace(/-/g, '');
  const sex = patient.sex === 'female' ? 'F' : patient.sex === 'male' ? 'M' : 'U';
  return [
    'PID',
    '1',
    '',
    `${patient.mrn}${COMP}${COMP}${COMP}MR`,
    '',
    `${patient.familyName}${COMP}${patient.givenName}`,
    '',
    dob,
    sex,
  ].join(FIELD);
}

function pv1(encounter: Encounter): string {
  const cls = encounter.mode === 'in_person' ? 'O' : 'V';
  const start = encounter.startedAt
    ? encounter.startedAt.toISOString().replace(/[-:T]/g, '').slice(0, 14)
    : '';
  return ['PV1', '1', cls, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', start].join(FIELD);
}

export function buildAdtA04(header: HL7Header, patient: Patient, encounter: Encounter): string {
  return [msh(header, 'ADT^A04'), 'EVN|A04|' + (encounter.startedAt ?? new Date()).toISOString().replace(/[-:T]/g, '').slice(0, 14), pid(patient), pv1(encounter)].join('\r');
}
