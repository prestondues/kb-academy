import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import { supabase } from '../lib/supabase';
import { theme } from '../styles/theme';

type LookupOption = {
  id: string;
  name: string;
};

type CoverageTargetRow = {
  id: string;
  module_id: string;
  department_id: string;
  shift_id: string;
  target_count: number;
  is_active?: boolean;
  module?: {
    id?: string | null;
    title?: string | null;
  } | null;
  department?: {
    id?: string | null;
    name?: string | null;
  } | null;
  shift?: {
    id?: string | null;
    name?: string | null;
  } | null;
};

type CertificationRow = {
  module_id: string;
  module?: {
    department?: {
      name?: string | null;
    } | null;
  } | null;
};

type CoverageRow = {
  id: string;
  moduleId: string;
  departmentId: string;
  shiftId: string;
  moduleName: string;
  departmentName: string;
  shiftName: string;
  targetCount: number;
  actualCount: number;
  gap: number;
};

function TrainingCoveragePage() {
  const [modules, setModules] = useState<LookupOption[]>([]);
  const [departments, setDepartments] = useState<LookupOption[]>([]);
  const [shifts, setShifts] = useState<LookupOption[]>([]);
  const [targets, setTargets] = useState<CoverageTargetRow[]>([]);
  const [certifications, setCertifications] = useState<CertificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);

  const [form, setForm] = useState({
    module_id: '',
    department_id: '',
    shift_id: '',
    target_count: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [
          modulesResponse,
          departmentsResponse,
          shiftsResponse,
          targetsResponse,
          certificationsResponse,
        ] = await Promise.all([
          supabase
            .from('training_modules')
            .select('id, title')
            .eq('is_active', true)
            .order('title', { ascending: true }),

          supabase
            .from('departments')
            .select('id, name')
            .eq('is_active', true)
            .order('name', { ascending: true }),

          supabase
            .from('shifts')
            .select('id, name')
            .eq('is_active', true)
            .order('name', { ascending: true }),

          supabase
            .from('training_coverage_targets')
            .select(`
              id,
              module_id,
              department_id,
              shift_id,
              target_count,
              is_active,
              module:training_modules!training_coverage_targets_module_id_fkey(id, title),
              department:departments!training_coverage_targets_department_id_fkey(id, name),
              shift:shifts!training_coverage_targets_shift_id_fkey(id, name)
            `)
            .eq('is_active', true)
            .order('created_at', { ascending: false }),

          supabase
            .from('training_certifications')
            .select(`
              module_id,
              module:training_modules!training_certifications_module_id_fkey(
                department:departments!training_modules_department_id_fkey(name)
              )
            `),
        ]);

        if (modulesResponse.error) throw modulesResponse.error;
        if (departmentsResponse.error) throw departmentsResponse.error;
        if (shiftsResponse.error) throw shiftsResponse.error;
        if (targetsResponse.error) throw targetsResponse.error;
        if (certificationsResponse.error) throw certificationsResponse.error;

        setModules(
          ((modulesResponse.data ?? []) as Array<{ id: string; title: string }>).map((item) => ({
            id: item.id,
            name: item.title,
          }))
        );

        setDepartments((departmentsResponse.data ?? []) as LookupOption[]);
        setShifts((shiftsResponse.data ?? []) as LookupOption[]);
        setTargets((targetsResponse.data ?? []) as CoverageTargetRow[]);
        setCertifications(
          ((certificationsResponse.data ?? []) as unknown) as CertificationRow[]
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load coverage targets.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function refreshTargets() {
    const { data, error: refreshError } = await supabase
      .from('training_coverage_targets')
      .select(`
        id,
        module_id,
        department_id,
        shift_id,
        target_count,
        is_active,
        module:training_modules!training_coverage_targets_module_id_fkey(id, title),
        department:departments!training_coverage_targets_department_id_fkey(id, name),
        shift:shifts!training_coverage_targets_shift_id_fkey(id, name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (refreshError) throw refreshError;
    setTargets((data ?? []) as CoverageTargetRow[]);
  }

  function resetForm() {
    setEditingTargetId(null);
    setForm({
      module_id: '',
      department_id: '',
      shift_id: '',
      target_count: '',
    });
  }

  async function handleSaveTarget() {
    if (!form.module_id || !form.department_id || !form.shift_id || form.target_count === '') {
      setError('Module, department, shift, and target count are required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editingTargetId) {
        const { error: updateError } = await supabase
          .from('training_coverage_targets')
          .update({
            module_id: form.module_id,
            department_id: form.department_id,
            shift_id: form.shift_id,
            target_count: Number(form.target_count),
          })
          .eq('id', editingTargetId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('training_coverage_targets')
          .upsert(
            {
              module_id: form.module_id,
              department_id: form.department_id,
              shift_id: form.shift_id,
              target_count: Number(form.target_count),
              is_active: true,
            },
            { onConflict: 'module_id,department_id,shift_id' }
          );

        if (insertError) throw insertError;
      }

      await refreshTargets();
      resetForm();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save coverage target.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTarget(id: string) {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('training_coverage_targets')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      await refreshTargets();

      if (editingTargetId === id) {
        resetForm();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete coverage target.';
      setError(message);
    }
  }

  const rows = useMemo<CoverageRow[]>(() => {
    return targets.map((target) => {
      const actual = certifications.filter((cert) => {
        if (cert.module_id !== target.module_id) return false;
        const certDepartment = cert.module?.department?.name ?? null;
        const targetDepartment = target.department?.name ?? null;
        return certDepartment === targetDepartment;
      }).length;

      return {
        id: target.id,
        moduleId: target.module_id,
        departmentId: target.department_id,
        shiftId: target.shift_id,
        moduleName: target.module?.title ?? '—',
        departmentName: target.department?.name ?? '—',
        shiftName: target.shift?.name ?? '—',
        targetCount: target.target_count ?? 0,
        actualCount: actual,
        gap: Math.max((target.target_count ?? 0) - actual, 0),
      };
    });
  }, [targets, certifications]);

  return (
    <PageContainer
      title="Training Coverage"
      subtitle="Target vs actual certified counts by module, department, and shift."
    >
      <div style={shellStyle}>
        <ContentCard
          title={editingTargetId ? 'Edit Coverage Target' : 'Set Coverage Target'}
          subtitle="Define the target certified count."
        >
          <div style={formGridStyle}>
            <Field label="Module">
              <select
                style={inputStyle}
                value={form.module_id}
                onChange={(e) => setForm({ ...form, module_id: e.target.value })}
              >
                <option value="">Select module</option>
                {modules.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Department">
              <select
                style={inputStyle}
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              >
                <option value="">Select department</option>
                {departments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Shift">
              <select
                style={inputStyle}
                value={form.shift_id}
                onChange={(e) => setForm({ ...form, shift_id: e.target.value })}
              >
                <option value="">Select shift</option>
                {shifts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Target Certified Count">
              <input
                style={inputStyle}
                type="number"
                min={0}
                value={form.target_count}
                onChange={(e) => setForm({ ...form, target_count: e.target.value })}
              />
            </Field>
          </div>

          {error ? <div style={errorStyle}>{error}</div> : null}

          <div style={actionsRowStyle}>
            {editingTargetId ? (
              <button type="button" style={secondaryButtonStyle} onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}

            <PrimaryButton onClick={handleSaveTarget} disabled={saving}>
              {saving ? 'Saving...' : editingTargetId ? 'Update Target' : 'Save Target'}
            </PrimaryButton>
          </div>
        </ContentCard>

        <ContentCard title="Coverage Status" subtitle="Target vs actual certified counts.">
          {loading ? (
            <div style={stateStyle}>Loading coverage data...</div>
          ) : rows.length === 0 ? (
            <div style={stateStyle}>No coverage targets found.</div>
          ) : (
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Module</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Shift</th>
                    <th style={thStyle}>Target</th>
                    <th style={thStyle}>Actual</th>
                    <th style={thStyle}>Gap</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td style={tdStyle}>{row.moduleName}</td>
                      <td style={tdStyle}>{row.departmentName}</td>
                      <td style={tdStyle}>{row.shiftName}</td>
                      <td style={tdStyle}>{row.targetCount}</td>
                      <td style={tdStyle}>{row.actualCount}</td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            ...gapPillStyle,
                            background: row.gap > 0 ? '#fff4e8' : '#e8f7ee',
                            color: row.gap > 0 ? '#9a5b13' : '#18794e',
                          }}
                        >
                          {row.gap}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={rowActionsStyle}>
                          <button
                            type="button"
                            style={miniButtonStyle}
                            onClick={() => {
                              setEditingTargetId(row.id);
                              setForm({
                                module_id: row.moduleId,
                                department_id: row.departmentId,
                                shift_id: row.shiftId,
                                target_count: String(row.targetCount),
                              });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            style={deleteButtonStyle}
                            onClick={() => handleDeleteTarget(row.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>
      </div>
    </PageContainer>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const shellStyle: CSSProperties = {
  display: 'grid',
  gap: '16px',
};

const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '6px',
  color: theme.colors.mutedText,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const inputStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const errorStyle: CSSProperties = {
  marginTop: '14px',
  background: '#fdecec',
  color: '#a12828',
  padding: '12px 14px',
  borderRadius: '12px',
};

const actionsRowStyle: CSSProperties = {
  marginTop: '16px',
  display: 'flex',
  gap: '10px',
  justifyContent: 'flex-end',
};

const secondaryButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '14px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const tableWrapStyle: CSSProperties = {
  overflowX: 'auto',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: CSSProperties = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: `1px solid ${theme.colors.border}`,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
};

const tdStyle: CSSProperties = {
  padding: '12px 10px',
  borderBottom: `1px solid ${theme.colors.border}`,
  fontSize: '14px',
  color: theme.colors.text,
};

const gapPillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '36px',
  padding: '6px 10px',
  borderRadius: '999px',
  fontWeight: 800,
  fontSize: '12px',
};

const rowActionsStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const miniButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '10px',
  padding: '8px 10px',
  fontWeight: 700,
  cursor: 'pointer',
};

const deleteButtonStyle: CSSProperties = {
  border: '1px solid #f3cccc',
  background: '#fff7f7',
  color: '#a12828',
  borderRadius: '10px',
  padding: '8px 10px',
  fontWeight: 700,
  cursor: 'pointer',
};

const stateStyle: CSSProperties = {
  padding: '24px 0',
  color: theme.colors.mutedText,
};

export default TrainingCoveragePage;