import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

function AccountStateGate({ children }: { children: ReactNode }) {
  const { loading, user, profile } = useAuth();

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading account state...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    return <div style={{ padding: '24px' }}>No matching profile found for this user.</div>;
  }

  if (!profile.is_active) {
    return <div style={{ padding: '24px' }}>This account is inactive.</div>;
  }

  if (profile.must_change_password) {
    return <Navigate to="/change-password" replace />;
  }

  if (profile.must_create_pin || profile.pin_reset_required) {
    return <Navigate to="/create-pin" replace />;
  }

  return <>{children}</>;
}

export default AccountStateGate;