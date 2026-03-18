import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { getSystemSettings } from './systemApi';
import MaintenancePage from '../../pages/MaintenancePage';

function MaintenanceGate({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadGateState() {
      try {
        const settings = await getSystemSettings();
        const maintenanceOn = Boolean(settings?.maintenance_mode);
        setMaintenanceMode(maintenanceOn);
        setMaintenanceMessage(settings?.maintenance_message ?? null);

        if (!maintenanceOn) {
          setIsAdmin(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const currentUser = session?.user ?? null;

        if (!currentUser?.id) {
          setIsAdmin(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            id,
            role:roles!profiles_role_id_fkey(
              id,
              name
            )
          `)
          .eq('id', currentUser.id)
          .maybeSingle();

        if (error) throw error;

        const roleName =
          (profile as { role?: { name?: string | null } | null } | null)?.role?.name
            ?.toLowerCase?.() ?? '';

        setIsAdmin(roleName.includes('admin'));
      } catch (error) {
        console.error('LOAD MAINTENANCE GATE ERROR:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    loadGateState();
  }, []);

  if (loading) return null;

  if (maintenanceMode && !isAdmin) {
    return <MaintenancePage message={maintenanceMessage} />;
  }

  return <>{children}</>;
}

export default MaintenanceGate;