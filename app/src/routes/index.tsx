import { createBrowserRouter } from 'react-router-dom';
import AccountStateGate from '../features/auth/AccountStateGate';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import AdminPage from '../pages/AdminPage';
import AnnouncementsPage from '../pages/AnnouncementsPage';
import CertificationsPage from '../pages/CertificationsPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import CreatePinPage from '../pages/CreatePinPage';
import CreateUserPage from '../pages/CreateUserPage';
import DashboardPage from '../pages/DashboardPage';
import DocumentsPage from '../pages/DocumentsPage';
import LoginPage from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';
import PlaceChartsPage from '../pages/PlaceChartsPage';
import ReportsPage from '../pages/ReportsPage';
import TrainingPage from '../pages/TrainingPage';
import UserDetailPage from '../pages/UserDetailPage';
import UsersPage from '../pages/UsersPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/change-password',
    element: (
      <ProtectedRoute>
        <ChangePasswordPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create-pin',
    element: (
      <ProtectedRoute>
        <CreatePinPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AccountStateGate>
          <AppLayout />
        </AccountStateGate>
      </ProtectedRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'training', element: <TrainingPage /> },
      { path: 'certifications', element: <CertificationsPage /> },
      { path: 'place-charts', element: <PlaceChartsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/new', element: <CreateUserPage /> },
      { path: 'users/:userId', element: <UserDetailPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
]);