import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AdminPage from '../pages/AdminPage';
import AnnouncementsPage from '../pages/AnnouncementsPage';
import CertificationsPage from '../pages/CertificationsPage';
import DashboardPage from '../pages/DashboardPage';
import DocumentsPage from '../pages/DocumentsPage';
import NotFoundPage from '../pages/NotFoundPage';
import PlaceChartsPage from '../pages/PlaceChartsPage';
import ReportsPage from '../pages/ReportsPage';
import TrainingPage from '../pages/TrainingPage';
import UsersPage from '../pages/UsersPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'training', element: <TrainingPage /> },
      { path: 'certifications', element: <CertificationsPage /> },
      { path: 'place-charts', element: <PlaceChartsPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
]);