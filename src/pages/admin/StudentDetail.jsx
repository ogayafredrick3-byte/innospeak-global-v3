import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Plus, FileUp, Trash2 } from 'lucide-react';
import Seo from '../../components/ui/Seo.jsx';
import SectionCard from '../../components/portal/SectionCard.jsx';
import DataTable from '../../components/portal/DataTable.jsx';
import StatusBadge from '../../components/portal/StatusBadge.jsx';
import TextField from '../../components/ui/TextField.jsx';
import SelectField from '../../components/ui/SelectField.jsx';
import { LoadingState, ErrorState, EmptyState } from '../../components/portal/PortalStates.jsx';
import {
  getStudent,
  updateStudent,
  listStudentRegistrations,
  listStudentRecords,
  addAcademicRecord,
  listStudentFeeTransactions,
  addFeeTransaction,
  addAttendanceRecord,
  listUnits,
  registerStudentForUnit,
  listStudentDocumentsAdmin,
  issueStudentDocument,
  deleteStudentDocument,
} from '../../lib/supabase/admin';

const STATUS_OPTIONS = ['active', 'suspended', 'deferred', 'graduated', 'alumni'];
const DOC_TYPES = [
  { value: 'admission_letter', label: 'Admission Letter' },
  { value: 'student_id_card', label: 'Student ID' },
  { value: 'fee_statement', label: 'Fee Statement' },
  { value: 'result_slip', label: 'Result Slip' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'academic_letter', label: 'Academic Letter' },
  { value: 'certificate', label: 'Certificate' },
];

export default function StudentDetail() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [records, setRecords] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [units, setUnits] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [regUnitId, setRegUnitId] = useState('');
  const [gradeForm, setGradeForm] = useState({ unitId: '', semesterId: '', score: '', grade: '', gradePoints: '' });
  const [feeForm, setFeeForm] = useState({ type: 'charge', amount: '', method: '', reference: '', description: '' });
  const [attendanceForm, setAttendanceForm] = useState({ unitId: '', sessionDate: '', status: 'present' });
  const [docForm, setDocForm] = useState({ docType: '', title: '', file: null });
  const [issuingDoc, setIssuingDoc] = useState(false);

  function loadAll() {
    setLoading(true);
    setError(null);
    Promise.all([
      getStudent(id),
      listStudentRegistrations(id),
      listStudentRecords(id),
      listStudentFeeTransactions(id),
      listUnits(),
      listStudentDocumentsAdmin(id),
    ])
      .then(([p, regs, recs, txns, allUnits, docs]) => {
        setProfile(p);
        setRegistrations(regs);
        setRecords(recs);
        setTransactions(txns);
        setUnits(allUnits);
        setDocuments(docs);
      })
      .catch((err) => setError(err.message || 'Could not load this student.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleProfileChange(field) {
    return (e) => {
      setProfileSaved(false);
      setProfile((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateStudent(id, {
        full_name: profile.full_name,
        student_number: profile.student_number,
        department: profile.department,
        level_year: profile.level_year,
        academic_year: profile.academic_year,
        student_status: profile.student_status,
        phone: profile.phone,
      });
      setProfileSaved(true);
    } catch (err) {
      setError(err.message || 'Could not save this profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!regUnitId) return;
    const unit = units.find((u) => u.id === regUnitId);
    try {
      await registerStudentForUnit(id, regUnitId, unit?.semester_id || null);
      setRegUnitId('');
      loadAll();
    } catch (err) {
      setError(err.message || 'Could not register this unit.');
    }
  }

  async function handleAddGrade(e) {
    e.preventDefault();
    try {
      await addAcademicRecord(id, {
        unit_id: gradeForm.unitId || null,
        semester_id: gradeForm.semesterId || null,
        score: gradeForm.score ? Number(gradeForm.score) : null,
        grade: gradeForm.grade || null,
        grade_points: gradeForm.gradePoints ? Number(gradeForm.gradePoints) : null,
      });
      setGradeForm({ unitId: '', semesterId: '', score: '', grade: '', gradePoints: '' });
      loadAll();
    } catch (err) {
      setError(err.message || 'Could not add this grade.');
    }
  }

  async function handleAddFee(e) {
    e.preventDefault();
    try {
      await addFeeTransaction(id, {
        type: feeForm.type,
        amount: Number(feeForm.amount || 0),
        method: feeForm.method || null,
        reference: feeForm.reference || null,
        description: feeForm.description || null,
      });
      setFeeForm({ type: 'charge', amount: '', method: '', reference: '', description: '' });
      loadAll();
    } catch (err) {
      setError(err.message || 'Could not add this transaction.');
    }
  }

  async function handleAddAttendance(e) {
    e.preventDefault();
    if (!attendanceForm.unitId || !attendanceForm.sessionDate) return;
    try {
      await addAttendanceRecord(id, {
        unit_id: attendanceForm.unitId,
        session_date: attendanceForm.sessionDate,
        status: attendanceForm.status,
      });
      setAttendanceForm({ unitId: '', sessionDate: '', status: 'present' });
      loadAll();
    } catch (err) {
      setError(err.message || 'Could not record attendance.');
    }
  }

  async function handleIssueDocument(e) {
    e.preventDefault();
    if (!docForm.docType || !docForm.title) return;
    setIssuingDoc(true);
    try {
      await issueStudentDocument(id, { file: docForm.file, docType: docForm.docType, title: docForm.title });
      setDocForm({ docType: '', title: '', file: null });
      loadAll();
    } catch (err) {
      setError(err.message || 'Could not issue this document.');
    } finally {
      setIssuingDoc(false);
    }
  }

  async function handleDeleteDocument(docId) {
    try {
      await deleteStudentDocument(docId);
      loadAll();
    } catch (err) {
      setError(err.message || 'Could not delete this document.');
    }
  }

  if (loading) return <LoadingState />;
  if (error && !profile) return <ErrorState message={error} />;
  if (!profile) return null;

  const registrationColumns = [
    { key: 'unit', label: 'Unit', render: (r) => (r.units ? `${r.units.code} — ${r.units.title}` : '—') },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const recordColumns = [
    { key: 'unit', label: 'Unit', render: (r) => (r.units ? `${r.units.code} — ${r.units.title}` : '—') },
    { key: 'semester', label: 'Semester', render: (r) => r.semesters?.name || '—' },
    { key: 'score', label: 'Score', render: (r) => r.score ?? '—' },
    { key: 'grade', label: 'Grade', render: (r) => r.grade || '—' },
  ];

  const feeColumns = [
    { key: 'created_at', label: 'Date', render: (r) => new Date(r.created_at).toLocaleDateString() },
    { key: 'type', label: 'Type', render: (r) => (r.type === 'payment' ? 'Payment' : 'Charge') },
    { key: 'amount', label: 'Amount (KES)', render: (r) => Number(r.amount || 0).toLocaleString() },
    { key: 'description', label: 'Description', render: (r) => r.description || '—' },
  ];

  const documentColumns = [
    { key: 'title', label: 'Document' },
    { key: 'doc_type', label: 'Type', render: (r) => DOC_TYPES.find((t) => t.value === r.doc_type)?.label || r.doc_type },
    { key: 'issued_at', label: 'Issued', render: (r) => new Date(r.issued_at).toLocaleDateString() },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <button
          type="button"
          onClick={() => handleDeleteDocument(r.id)}
          className="inline-flex items-center gap-1 font-body text-xs font-semibold text-rose-600 hover:text-rose-700"
        >
          <Trash2 size={13} />
          Delete
        </button>
      ),
    },
  ];

  return (
    <>
      <Seo title={profile.full_name || 'Student'} description="Student record." path={`/admin/students/${id}`} />

      <div>
        <p className="font-body text-xs font-semibold uppercase tracking-wider text-gold-600">Admin Panel</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">{profile.full_name || 'Student'}</h1>
        <p className="mt-2 font-body text-sm text-navy-500">Student ID: {profile.student_number || '—'}</p>
      </div>

      {error && <div className="mt-4"><ErrorState message={error} /></div>}

      <div className="mt-6 space-y-6">
        <SectionCard title="Profile">
          <form onSubmit={handleProfileSave} className="grid gap-4 sm:grid-cols-2">
            <TextField label="Full Name" name="full_name" value={profile.full_name || ''} onChange={handleProfileChange('full_name')} />
            <TextField label="Student ID" name="student_number" value={profile.student_number || ''} onChange={handleProfileChange('student_number')} />
            <TextField label="Department" name="department" value={profile.department || ''} onChange={handleProfileChange('department')} />
            <TextField label="Level / Year" name="level_year" value={profile.level_year || ''} onChange={handleProfileChange('level_year')} />
            <TextField label="Academic Year" name="academic_year" value={profile.academic_year || ''} onChange={handleProfileChange('academic_year')} />
            <TextField label="Phone" name="phone" value={profile.phone || ''} onChange={handleProfileChange('phone')} />
            <SelectField
              label="Status"
              name="student_status"
              value={profile.student_status || 'active'}
              onChange={handleProfileChange('student_status')}
              options={STATUS_OPTIONS}
            />
            <div className="flex items-end">
              <button type="submit" disabled={savingProfile} className="btn-gold inline-flex items-center gap-2 disabled:opacity-60">
                <Save size={16} />
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
            {profileSaved && (
              <p className="sm:col-span-2 font-body text-sm text-emerald-700">Profile updated.</p>
            )}
          </form>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Unit Registrations">
            <form onSubmit={handleRegister} className="mb-4 flex items-end gap-3">
              <SelectField
                label="Register for unit"
                name="regUnit"
                value={regUnitId}
                onChange={(e) => setRegUnitId(e.target.value)}
                options={units.map((u) => ({ value: u.id, label: `${u.code} — ${u.title}` }))}
                className="flex-1"
              />
              <button type="submit" className="btn-outline inline-flex items-center gap-1.5 whitespace-nowrap">
                <Plus size={15} />
                Register
              </button>
            </form>
            {registrations.length === 0 ? (
              <EmptyState title="No registrations yet" message="Register this student for a unit above." />
            ) : (
              <DataTable columns={registrationColumns} rows={registrations} />
            )}
          </SectionCard>

          <SectionCard title="Add Academic Record">
            <form onSubmit={handleAddGrade} className="space-y-3">
              <SelectField
                label="Unit"
                name="gradeUnit"
                value={gradeForm.unitId}
                onChange={(e) => setGradeForm((p) => ({ ...p, unitId: e.target.value }))}
                options={units.map((u) => ({ value: u.id, label: `${u.code} — ${u.title}` }))}
              />
              <div className="grid grid-cols-3 gap-3">
                <TextField label="Score" name="score" value={gradeForm.score} onChange={(e) => setGradeForm((p) => ({ ...p, score: e.target.value }))} />
                <TextField label="Grade" name="grade" value={gradeForm.grade} onChange={(e) => setGradeForm((p) => ({ ...p, grade: e.target.value }))} />
                <TextField
                  label="Grade Points"
                  name="gradePoints"
                  value={gradeForm.gradePoints}
                  onChange={(e) => setGradeForm((p) => ({ ...p, gradePoints: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn-outline w-full">
                Add Record
              </button>
            </form>
            <div className="mt-4">
              {records.length === 0 ? (
                <EmptyState title="No records yet" message="Recorded grades will appear here." />
              ) : (
                <DataTable columns={recordColumns} rows={records} />
              )}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Fee Ledger">
            <form onSubmit={handleAddFee} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Type"
                  name="feeType"
                  value={feeForm.type}
                  onChange={(e) => setFeeForm((p) => ({ ...p, type: e.target.value }))}
                  options={[{ value: 'charge', label: 'Charge' }, { value: 'payment', label: 'Payment' }]}
                />
                <TextField label="Amount (KES)" name="amount" value={feeForm.amount} onChange={(e) => setFeeForm((p) => ({ ...p, amount: e.target.value }))} />
              </div>
              <TextField
                label="Description"
                name="feeDescription"
                optional
                value={feeForm.description}
                onChange={(e) => setFeeForm((p) => ({ ...p, description: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Method" name="feeMethod" optional value={feeForm.method} onChange={(e) => setFeeForm((p) => ({ ...p, method: e.target.value }))} />
                <TextField label="Reference" name="feeReference" optional value={feeForm.reference} onChange={(e) => setFeeForm((p) => ({ ...p, reference: e.target.value }))} />
              </div>
              <button type="submit" className="btn-outline w-full">
                Add Transaction
              </button>
            </form>
            <div className="mt-4">
              {transactions.length === 0 ? (
                <EmptyState title="No transactions yet" message="Charges and payments will appear here." />
              ) : (
                <DataTable columns={feeColumns} rows={transactions} />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Record Attendance">
            <form onSubmit={handleAddAttendance} className="space-y-3">
              <SelectField
                label="Unit"
                name="attendanceUnit"
                value={attendanceForm.unitId}
                onChange={(e) => setAttendanceForm((p) => ({ ...p, unitId: e.target.value }))}
                options={units.map((u) => ({ value: u.id, label: `${u.code} — ${u.title}` }))}
              />
              <TextField
                label="Session Date"
                name="sessionDate"
                type="date"
                value={attendanceForm.sessionDate}
                onChange={(e) => setAttendanceForm((p) => ({ ...p, sessionDate: e.target.value }))}
              />
              <SelectField
                label="Status"
                name="attendanceStatus"
                value={attendanceForm.status}
                onChange={(e) => setAttendanceForm((p) => ({ ...p, status: e.target.value }))}
                options={[{ value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' }, { value: 'excused', label: 'Excused' }]}
              />
              <button type="submit" className="btn-outline w-full">
                Record Attendance
              </button>
            </form>
          </SectionCard>
        </div>

        <SectionCard title="Official Documents">
          <form onSubmit={handleIssueDocument} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <SelectField
              label="Document Type"
              name="docType"
              value={docForm.docType}
              onChange={(e) => setDocForm((p) => ({ ...p, docType: e.target.value }))}
              options={DOC_TYPES}
              required
            />
            <TextField label="Title" name="docTitle" value={docForm.title} onChange={(e) => setDocForm((p) => ({ ...p, title: e.target.value }))} required />
            <div className="flex flex-col gap-2">
              <label className="font-body text-sm font-bold tracking-wide text-navy-900">File (optional)</label>
              <input
                type="file"
                onChange={(e) => setDocForm((p) => ({ ...p, file: e.target.files?.[0] || null }))}
                className="w-full rounded-2xl border border-navy-100 bg-white px-3 py-3 font-body text-sm"
              />
            </div>
            <button type="submit" disabled={issuingDoc} className="btn-gold inline-flex items-center justify-center gap-2 disabled:opacity-60">
              <FileUp size={16} />
              {issuingDoc ? 'Issuing…' : 'Issue Document'}
            </button>
          </form>
          <div className="mt-4">
            {documents.length === 0 ? (
              <EmptyState title="No documents issued yet" message="Issued documents will appear here and in the student's Documents tab." />
            ) : (
              <DataTable columns={documentColumns} rows={documents} />
            )}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
