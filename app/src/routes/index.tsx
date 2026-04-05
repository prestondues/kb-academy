import { createBrowserRouter } from 'react-router-dom';
import AccountStateGate from '../features/auth/AccountStateGate';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import MaintenanceGate from '../features/system/MaintenanceGate';
import AppLayout from '../layouts/AppLayout';
import AdminPage from '../pages/AdminPage';
import AnnouncementsPage from '../pages/AnnouncementsPage';
import CertificationsPage from '../pages/CertificationsPage';
import StartCertificationPage from '../pages/StartCertificationPage';
import CertificationQuizRunnerPage from '../pages/CertificationQuizRunnerPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import CreatePinPage from '../pages/CreatePinPage';
import CreateTrainingModulePage from '../pages/CreateTrainingModulePage';
import CreateTrainingSectionPage from '../pages/CreateTrainingSectionPage';
import CreateTrainingSessionPage from '../pages/CreateTrainingSessionPage';
import CreateUserPage from '../pages/CreateUserPage';
import DashboardPage from '../pages/DashboardPage';
import DocumentsPage from '../pages/DocumentsPage';
import EditTrainingModulePage from '../pages/EditTrainingModulePage';
import EditTrainingSectionPage from '../pages/EditTrainingSectionPage';
import EditUserPage from '../pages/EditUserPage';
import LoginPage from '../pages/LoginPage';
import ManualTimeLogPage from '../pages/ManualTimeLogPage';
import NotFoundPage from '../pages/NotFoundPage';
import PlaceChartsPage from '../pages/PlaceChartsPage';
import QuizAttemptReviewPage from '../pages/QuizAttemptReviewPage';
import ReportsPage from '../pages/ReportsPage';
import SkillsMatrixPage from '../pages/SkillsMatrixPage';
import TrainingCoveragePage from '../pages/TrainingCoveragePage';
import TrainingModuleDetailPage from '../pages/TrainingModuleDetailPage';
import TrainingPage from '../pages/TrainingPage';
import TrainingRecordsPage from '../pages/TrainingRecordsPage';
import TrainingSessionRecordPage from '../pages/TrainingSessionRecordPage';
import TrainingSessionRunnerPage from '../pages/TrainingSessionRunnerPage';
import TrainingQuizBuilderPage from '../pages/TrainingQuizBuilderPage';
import TrainingQuizRunnerPage from '../pages/TrainingQuizRunnerPage';
import UserDetailPage from '../pages/UserDetailPage';
import UserTrainingProfilePage from '../pages/UserTrainingProfilePage';
import UsersPage from '../pages/UsersPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <MaintenanceGate>
        <LoginPage />
      </MaintenanceGate>
    ),
  },
  {
    path: '/admin-login',
    element: <LoginPage />,
  },
  {
    path: '/change-password',
    element: (
      <MaintenanceGate>
        <ProtectedRoute>
          <ChangePasswordPage />
        </ProtectedRoute>
      </MaintenanceGate>
    ),
  },
  {
    path: '/create-pin',
    element: (
      <MaintenanceGate>
        <ProtectedRoute>
          <CreatePinPage />
        </ProtectedRoute>
      </MaintenanceGate>
    ),
  },
  {
    path: '/',
    element: (
      <MaintenanceGate>
        <ProtectedRoute>
          <AccountStateGate>
            <AppLayout />
          </AccountStateGate>
        </ProtectedRoute>
      </MaintenanceGate>
    ),
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'training', element: <TrainingPage /> },
      { path: 'training/new', element: <CreateTrainingModulePage /> },
      { path: 'training/conduct', element: <CreateTrainingSessionPage /> },
      {
        path: 'certifications/start/:moduleId/:traineeId',
        element: <CertificationQuizRunnerPage />,
      },
      { path: 'training/records', element: <TrainingRecordsPage /> },
      { path: 'training/matrix', element: <SkillsMatrixPage /> },
      { path: 'training/coverage', element: <TrainingCoveragePage /> },
      { path: 'training/time-logs', element: <ManualTimeLogPage /> },
      { path: 'training/:moduleId', element: <TrainingModuleDetailPage /> },
      { path: 'training/:moduleId/edit', element: <EditTrainingModulePage /> },
      { path: 'training/:moduleId/start', element: <CreateTrainingSessionPage /> },
      {
        path: 'training/:moduleId/sections/new',
        element: <CreateTrainingSectionPage />,
      },
      {
        path: 'training/:moduleId/sections/:sectionId/edit',
        element: <EditTrainingSectionPage />,
      },
      { path: 'training/sessions/:sessionId', element: <TrainingSessionRunnerPage /> },
      {
        path: 'training/sessions/:sessionId/view',
        element: <TrainingSessionRecordPage />,
      },
      { path: 'training/:moduleId/quiz', element: <TrainingQuizBuilderPage /> },
      { path: 'training/:moduleId/quiz/take', element: <TrainingQuizRunnerPage /> },
      {
        path: 'training/quiz-attempts/:attemptId',
        element: <QuizAttemptReviewPage />,
      },
      { path: 'certifications', element: <CertificationsPage /> },
      { path: 'certifications/start', element: <StartCertificationPage /> },
      { path: 'place-charts', element: <PlaceChartsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/new', element: <CreateUserPage /> },
      { path: 'users/:userId', element: <UserDetailPage /> },
      { path: 'users/:userId/edit', element: <EditUserPage /> },
      { path: 'users/:userId/training', element: <UserTrainingProfilePage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
]);