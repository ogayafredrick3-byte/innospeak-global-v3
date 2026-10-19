import { supabase } from './client';

/**
 * applicationsApi — data layer for the admissions system.
 *
 * Structured so it can later be swapped for Firebase/Firestore without
 * touching the UI: the page calls these functions, not Supabase directly.
 */

/**
 * Generate a human-readable application number.
 * Format: ISG-YYYY-COURSECODE-NNNNNN
 */
function generateApplicationNumber(courseCode) {
  const year = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  return `ISG-${year}-${courseCode}-${random}`;
}

/**
 * Insert a new application record.
 * @param {Object} data - the full application form data
 * @returns {Object} { applicationNumber, id } on success
 */
export async function submitApplication(data) {
  if (!supabase) {
    throw new Error('Application submission is unavailable because Supabase has not been configured.');
  }

  const applicationNumber = generateApplicationNumber(data.courseCode);

  const record = {
    application_number: applicationNumber,
    division: data.division,
    academy: data.academy,
    pathway: data.pathway,
    programme: data.programme,
    course_code: data.courseCode,
    duration: data.duration,
    study_mode: data.studyMode,
    fees: data.fees,
    intake: data.intake,
    first_name: data.firstName,
    middle_name: data.middleName || null,
    last_name: data.lastName,
    gender: data.gender,
    date_of_birth: data.dateOfBirth || null,
    nationality: data.nationality,
    phone_number: data.phoneNumber,
    whatsapp_number: data.whatsappNumber || null,
    email: data.email,
    national_id: data.nationalId || null,
    country: data.country,
    county_state: data.countyState,
    city: data.city,
    postal_address: data.postalAddress || null,
    education_level: data.educationLevel,
    institution: data.institution,
    year_completed: data.yearCompleted,
    current_occupation: data.currentOccupation || null,
    preferred_schedule: data.preferredSchedule,
    preferred_learning_mode: data.preferredLearningMode,
    referral_source: data.referralSource || null,
    documents: data.documents || [],
    declaration: data.declaration,
  };

  const { data: inserted, error } = await supabase
    .from('applications')
    .insert(record)
    .select('id, application_number')
    .single();

  if (error) throw new Error(error.message);

  return {
    id: inserted.id,
    applicationNumber: inserted.application_number,
  };
}

/**
 * Build a downloadable text summary of the application.
 */
export function buildSummaryText(data, applicationNumber) {
  const lines = [
    'INNOSPEAK GLOBAL ACADEMY — APPLICATION SUMMARY',
    '================================================',
    '',
    `Application Number: ${applicationNumber}`,
    `Date: ${new Date().toLocaleString()}`,
    '',
    '--- PROGRAMME SELECTION ---',
    `Division: ${data.division === 'labs' ? 'InnoSpeak Global Labs' : data.division === 'academy' ? 'InnoSpeak Global Academy' : 'N/A'}`,
    `Academy: ${data.academy}`,
    `Pathway: ${data.pathway}`,
    `Programme: ${data.programme}`,
    `Course Code: ${data.courseCode}`,
    `Duration: ${data.duration}`,
    `Study Mode: ${data.studyMode}`,
    `Fees: ${data.fees}`,
    `Intake: ${data.intake}`,
    '',
    '--- PERSONAL INFORMATION ---',
    `Name: ${data.firstName} ${data.middleName || ''} ${data.lastName}`,
    `Gender: ${data.gender}`,
    `Date of Birth: ${data.dateOfBirth}`,
    `Nationality: ${data.nationality}`,
    `Phone: ${data.phoneNumber}`,
    `WhatsApp: ${data.whatsappNumber || 'N/A'}`,
    `Email: ${data.email}`,
    `National ID / Passport: ${data.nationalId || 'N/A'}`,
    '',
    '--- ADDRESS ---',
    `Country: ${data.country}`,
    `County/State: ${data.countyState}`,
    `City: ${data.city}`,
    `Postal Address: ${data.postalAddress || 'N/A'}`,
    '',
    '--- EDUCATION ---',
    `Highest Education: ${data.educationLevel}`,
    `Institution: ${data.institution}`,
    `Year Completed: ${data.yearCompleted}`,
    `Current Occupation: ${data.currentOccupation || 'N/A'}`,
    '',
    '--- LEARNING PREFERENCES ---',
    `Preferred Schedule: ${data.preferredSchedule}`,
    `Preferred Learning Mode: ${data.preferredLearningMode}`,
    `How did you hear about us: ${data.referralSource || 'N/A'}`,
    '',
    '--- DOCUMENTS ---',
    ...(data.documents?.length
      ? data.documents.map((d) => `  - ${d.name} (${d.type || 'file'})`)
      : ['  No documents uploaded.']),
    '',
    '--- DECLARATION ---',
    `Declaration accepted: ${data.declaration ? 'Yes' : 'No'}`,
    '',
    '© InnoSpeak Global. All rights reserved.',
  ];
  return lines.join('\n');
}

/**
 * Trigger a browser download of the application summary as a .txt file.
 */
export function downloadSummary(data, applicationNumber) {
  const text = buildSummaryText(data, applicationNumber);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `InnoSpeak-Application-${applicationNumber}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
