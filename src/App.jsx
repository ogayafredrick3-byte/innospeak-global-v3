import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Foundation from './pages/Foundation.jsx';
import FoundationEvents from './pages/FoundationEvents.jsx';
import Founder from './pages/Founder.jsx';
import Impact from './pages/Impact.jsx';
import Contact from './pages/Contact.jsx';
import Apply from './pages/Apply.jsx';
import Research from './pages/Research.jsx';
import Tutor from './pages/Tutor.jsx';
import News from './pages/News.jsx';
import Events from './pages/Events.jsx';
import Community from './pages/Community.jsx';
import Partnerships from './pages/Partnerships.jsx';
import Careers from './pages/Careers.jsx';
import FAQ from './pages/FAQ.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import Register from './pages/Register.jsx';                            
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import StudentDashboard from './pages/portal/StudentDashboard.jsx';
import PortalShell from './components/portal/PortalShell.jsx';
import Profile from './pages/portal/Profile.jsx';
import Registration from './pages/portal/Registration.jsx';
import Records from './pages/portal/Records.jsx';
import Finance from './pages/portal/Finance.jsx';
import Timetable from './pages/portal/Timetable.jsx';
import Attendance from './pages/portal/Attendance.jsx';
import Exams from './pages/portal/Exams.jsx';
import Documents from './pages/portal/Documents.jsx';
import Communication from './pages/portal/Communication.jsx';
import Requests from './pages/portal/Requests.jsx';
import Support from './pages/portal/Support.jsx';
import Graduation from './pages/portal/Graduation.jsx';
import ChangePassword from './pages/portal/ChangePassword.jsx';
import MyProgress from './pages/portal/MyProgress.jsx';
import FoundationApplications from './pages/portal/FoundationApplications.jsx';
import FoundationApplicationDetail from './pages/portal/FoundationApplicationDetail.jsx';
import SponsorShell from './components/sponsor/SponsorShell.jsx';
import SponsorSignIn from './pages/sponsor/SponsorSignIn.jsx';
import SponsorDashboard from './pages/sponsor/SponsorDashboard.jsx';
import SponsorPrograms from './pages/sponsor/SponsorPrograms.jsx';
import SponsorContributions from './pages/sponsor/SponsorContributions.jsx';
import SponsorImpact from './pages/sponsor/SponsorImpact.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';
import AdminShell from './components/admin/AdminShell.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminStudents from './pages/admin/Students.jsx';
import AdminStudentDetail from './pages/admin/StudentDetail.jsx';
import AdminApplications from './pages/admin/Applications.jsx';
import AdminContactMessages from './pages/admin/ContactMessages.jsx';
import AdminPrograms from './pages/admin/Programs.jsx';
import AdminSemesters from './pages/admin/Semesters.jsx';
import AdminUnits from './pages/admin/Units.jsx';
import AdminTimetableExams from './pages/admin/TimetableExams.jsx';
import AdminFeeStructures from './pages/admin/FeeStructures.jsx';
import AdminRequests from './pages/admin/Requests.jsx';
import AdminSupport from './pages/admin/Support.jsx';
import AdminGraduation from './pages/admin/Graduation.jsx';
import AdminAnnouncements from './pages/admin/Announcements.jsx';
import AdminLmsOverview from './pages/admin/LmsOverview.jsx';
import AdminCohorts from './pages/admin/Cohorts.jsx';
import AdminCareerOpportunities from './pages/admin/CareerOpportunities.jsx';
import CareerApplications from './pages/admin/CareerApplications.jsx';
import InstructorRoute from './components/auth/InstructorRoute.jsx';
import TeachShell from './components/teach/TeachShell.jsx';
import TeachOverview from './pages/teach/TeachOverview.jsx';
import TeachProfile from './pages/teach/TeachProfile.jsx';
import MyCourses from './pages/teach/MyCourses.jsx';
import CreateCourse from './pages/teach/CreateCourse.jsx';
import TeachStudents from './pages/teach/TeachStudents.jsx';
import LearningMaterials from './pages/teach/LearningMaterials.jsx';
import Assignments from './pages/teach/Assignments.jsx';
import Assessments from './pages/teach/Assessments.jsx';
import TeachMessages from './pages/teach/TeachMessages.jsx';
import TeachNotifications from './pages/teach/TeachNotifications.jsx';
import TeachSettings from './pages/teach/TeachSettings.jsx';
import CourseBuilder from './pages/teach/CourseBuilder.jsx';
import LessonContentBuilder from './pages/teach/LessonContentBuilder.jsx';
import Submissions from './pages/teach/Submissions.jsx';
import SessionsManager from './pages/teach/SessionsManager.jsx';
import Gradebook from './pages/teach/Gradebook.jsx';
import LearnShell from './components/learn/LearnShell.jsx';
import LearnDashboard from './pages/learn/LearnDashboard.jsx';
import CareerProfile from './pages/learn/CareerProfile.jsx';
import MyApplications from './pages/learn/MyApplications.jsx';
import Sessions from './pages/learn/Sessions.jsx';
import Calendar from './pages/learn/Calendar.jsx';
import Portfolio from './pages/learn/Portfolio.jsx';
import Goals from './pages/learn/Goals.jsx';
import Projects from './pages/learn/Projects.jsx';
import Mentorship from './pages/learn/Mentorship.jsx';
import Certificates from './pages/learn/Certificates.jsx';
import CertificateVerify from './pages/learn/CertificateVerify.jsx';
import CareerHub from './pages/CareerHub.jsx';
import Opportunities from './pages/career/Opportunities.jsx';
import OpportunityDetail from './pages/career/OpportunityDetail.jsx';
import Connections from './pages/career/Connections.jsx';
import LearningPlayer from './pages/learn/LearningPlayer.jsx';
import AssignmentView from './pages/learn/AssignmentView.jsx';
import QuizAttempt from './pages/learn/QuizAttempt.jsx';
import BecomeTutor from './pages/BecomeTutor.jsx';
import AdminTutorApplications from './pages/admin/TutorApplications.jsx';
import AdminCourseReview from './pages/admin/CourseReview.jsx';
import AdminCertificates from './pages/admin/Certificates.jsx';
import AdminPayments from './pages/admin/Payments.jsx';
import AdminFoundationApplications from './pages/admin/FoundationApplications.jsx';
import AdminFoundationApplicationDetail from './pages/admin/FoundationApplicationDetail.jsx';
import AdminFoundationStories from './pages/admin/FoundationStories.jsx';
import AdminFoundationInitiatives from './pages/admin/FoundationInitiatives.jsx';
import AdminFoundationEvents from './pages/admin/FoundationEvents.jsx';
import AdminFoundationEventEditor from './pages/admin/FoundationEventEditor.jsx';
import AdminFoundationSponsors from './pages/admin/FoundationSponsors.jsx';
import AdminFoundationContributions from './pages/admin/FoundationContributions.jsx';
import AdminFoundationDisbursements from './pages/admin/FoundationDisbursements.jsx';
import AdminFoundationProgressReports from './pages/admin/FoundationProgressReports.jsx';
import ForEmployers from './pages/ForEmployers.jsx';
import EmployerRoute from './components/auth/EmployerRoute.jsx';
import EmployerShell from './components/employer/EmployerShell.jsx';
import EmployerOverview from './pages/employer/EmployerOverview.jsx';
import EmployerOpportunities from './pages/employer/EmployerOpportunities.jsx';
import EmployerOpportunityEditor from './pages/employer/EmployerOpportunityEditor.jsx';
import EmployerApplications from './pages/employer/EmployerApplications.jsx';
import OrganisationProfile from './pages/employer/OrganisationProfile.jsx';
import NotFound from './pages/NotFound.jsx';
import PaymentReturn from './pages/PaymentReturn.jsx';
import RouteErrorBoundary from './components/ui/RouteErrorBoundary.jsx';

export default function App() {
  return (
    <AuthProvider>
      <RouteErrorBoundary>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          
          {/* ALL COURSE ROUTES HAVE BEEN PURGED FOR REBUILD */}
          
          <Route path="/foundation" element={<Foundation />} />
          <Route path="/foundation/events" element={<FoundationEvents />} />
          <Route path="/founder" element={<Founder />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/become-tutor" element={<BecomeTutor />} />
          <Route path="/research" element={<Research />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/news" element={<News />} />
          <Route path="/events" element={<Events />} />
          <Route path="/community" element={<Community />} />
          <Route path="/partnerships" element={<Partnerships />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/career-hub" element={<CareerHub />} />
          <Route path="/career-hub/opportunities" element={<Opportunities />} />
          <Route path="/career-hub/opportunities/:id" element={<OpportunityDetail />} />
          <Route path="/career-hub/connections" element={<Connections />} />
          <Route path="/for-employers" element={<ForEmployers />} />
          <Route path="/verify-certificate" element={<CertificateVerify />} />
          <Route path="/verify-certificate/:certificateId" element={<CertificateVerify />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/payment-return" element={<PaymentReturn />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Sponsor Portal */}
          <Route path="/sponsor/signin" element={<SponsorSignIn />} />
          <Route path="/sponsor" element={<SponsorShell />}>
            <Route index element={<SponsorDashboard />} />
            <Route path="programs" element={<SponsorPrograms />} />
            <Route path="contributions" element={<SponsorContributions />} />
            <Route path="impact" element={<SponsorImpact />} />
          </Route>

          {/* Employer Portal */}
          <Route element={<EmployerRoute />}>
            <Route path="/employer" element={<EmployerShell />}>
              <Route index element={<EmployerOverview />} />
              <Route path="opportunities" element={<EmployerOpportunities />} />
              <Route path="opportunities/new" element={<EmployerOpportunityEditor />} />
              <Route path="opportunities/:id" element={<EmployerOpportunityEditor />} />
              <Route path="applications" element={<EmployerApplications />} />
              <Route path="profile" element={<OrganisationProfile />} />
            </Route>
          </Route>

          {/* Student portal (requires login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/portal" element={<PortalShell />}>
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="registration" element={<Registration />} />
              <Route path="records" element={<Records />} />
              <Route path="foundation" element={<FoundationApplications />} />
              <Route path="foundation/:id" element={<FoundationApplicationDetail />} />
              <Route path="progress" element={<MyProgress />} />
              <Route path="progress/:courseId" element={<MyProgress />} />
              <Route path="finance" element={<Finance />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="exams" element={<Exams />} />
              <Route path="documents" element={<Documents />} />
              <Route path="communication" element={<Communication />} />
              <Route path="requests" element={<Requests />} />
              <Route path="support" element={<Support />} />
              <Route path="graduation" element={<Graduation />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
          </Route>

          {/* Admin panel (requires admin role) */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="students/:id" element={<AdminStudentDetail />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="tutor-applications" element={<AdminTutorApplications />} />
              <Route path="course-review" element={<AdminCourseReview />} />
              <Route path="messages" element={<AdminContactMessages />} />
              <Route path="programs" element={<AdminPrograms />} />
              <Route path="semesters" element={<AdminSemesters />} />
              <Route path="units" element={<AdminUnits />} />
              <Route path="timetable-exams" element={<AdminTimetableExams />} />
              <Route path="fees" element={<AdminFeeStructures />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="graduation" element={<AdminGraduation />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="cohorts" element={<AdminCohorts />} />
              <Route path="career-opportunities" element={<AdminCareerOpportunities />} />
              <Route path="career-applications" element={<CareerApplications />} />
              <Route path="lms" element={<AdminLmsOverview />} />
              <Route path="certificates" element={<AdminCertificates />} />
              <Route path="payments" element={<AdminPayments />} />

              {/* Foundation */}
              <Route path="foundation/applications" element={<AdminFoundationApplications />} />
              <Route path="foundation/applications/:id" element={<AdminFoundationApplicationDetail />} />
              <Route path="foundation/stories" element={<AdminFoundationStories />} />
              <Route path="foundation/initiatives" element={<AdminFoundationInitiatives />} />
              <Route path="foundation/events" element={<AdminFoundationEvents />} />
              <Route path="foundation/events/:id" element={<AdminFoundationEventEditor />} />
              <Route path="foundation/sponsors" element={<AdminFoundationSponsors />} />
              <Route path="foundation/contributions" element={<AdminFoundationContributions />} />
              <Route path="foundation/disbursements" element={<AdminFoundationDisbursements />} />
              <Route path="foundation/progress-reports" element={<AdminFoundationProgressReports />} />
            </Route>
          </Route>

          {/* LMS — student learning (any authenticated user) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/learn" element={<LearnShell />}>
              <Route index element={<LearnDashboard />} />
              <Route path="career" element={<CareerProfile />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="goals" element={<Goals />} />
              <Route path="projects" element={<Projects />} />
              <Route path="mentorship" element={<Mentorship />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="courses/:courseId" element={<LearningPlayer />} />
              <Route path="courses/:courseId/lessons/:lessonId" element={<LearningPlayer />} />
              <Route path="assignments/:assignmentId" element={<AssignmentView />} />
              <Route path="quizzes/:quizId" element={<QuizAttempt />} />
            </Route>
          </Route>

          {/* LMS — instructor teaching tools */}
          <Route element={<InstructorRoute />}>
            <Route path="/teach" element={<TeachShell />}>
              <Route index element={<TeachOverview />} />
              <Route path="profile" element={<TeachProfile />} />
              <Route path="courses" element={<MyCourses />} />
              <Route path="create-course" element={<CreateCourse />} />
              <Route path="students" element={<TeachStudents />} />
              <Route path="materials" element={<LearningMaterials />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="sessions" element={<SessionsManager />} />
              <Route path="messages" element={<TeachMessages />} />
              <Route path="notifications" element={<TeachNotifications />} />
              <Route path="settings" element={<TeachSettings />} />
              <Route path="courses/:courseId" element={<CourseBuilder />} />
              <Route path="lessons/:lessonId" element={<LessonContentBuilder />} />
              <Route path="courses/:courseId/submissions" element={<Submissions />} />
              <Route path="courses/:courseId/gradebook" element={<Gradebook />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </RouteErrorBoundary>
    </AuthProvider>
  );
}