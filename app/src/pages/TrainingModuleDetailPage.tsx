import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import { getTrainingModuleById, getTrainingSections } from '../features/training/trainingApi';
import { theme } from '../styles/theme';

type ModuleDetailModel = {
  id: string;
  title: string;
  description: string;
  department: string;
  moduleType: string;
  requiredHours: number | null;
  recertFrequencyDays: number | null;
  requiresQuiz: boolean;
  allergenFlag: boolean;
  sqfElement: string;
  isActive: boolean;
};

type SectionDetailModel = {
  id: string;
  title: string;
  sectionType: string;
  bodyText: string;
  mediaUrl: string;
  isRequired: boolean;
};

type RawModule = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  module_type?: string | null;
  required_hours?: number | null;
  recert_frequency_days?: number | null;
  requires_quiz?: boolean | null;
  allergen_flag?: boolean | null;
  sqf_element?: string | null;
  is_active?: boolean | null;
  department?: {
    name?: string | null;
  } | null;
};

type RawSection = {
  id?: string | null;
  title?: string | null;
  section_type?: string | null;
  body_text?: string | null;
  media_url?: string | null;
  is_required?: boolean | null;
};

function normalizeModuleType(value?: string | null) {
  if (value === 'time_based') return 'Time Based';
  if (value === 'sign_off') return 'Sign Off';
  return value ?? '—';
}

function mapModule(moduleData: RawModule): ModuleDetailModel {
  return {
    id: moduleData.id ?? '',
    title: moduleData.title ?? 'Untitled Module',
    description: moduleData.description ?? '',
    department: moduleData.department?.name ?? '—',
    moduleType: normalizeModuleType(moduleData.module_type),
    requiredHours:
      typeof moduleData.required_hours === 'number' ? moduleData.required_hours : null,
    recertFrequencyDays:
      typeof moduleData.recert_frequency_days === 'number'
        ? moduleData.recert_frequency_days
        : null,
    requiresQuiz: Boolean(moduleData.requires_quiz),
    allergenFlag: Boolean(moduleData.allergen_flag),
    sqfElement: moduleData.sqf_element ?? '',
    isActive: Boolean(moduleData.is_active),
  };
}

function mapSection(sectionData: RawSection): SectionDetailModel {
  return {
    id: sectionData.id ?? '',
    title: sectionData.title ?? 'Untitled Section',
    sectionType: sectionData.section_type ?? '—',
    bodyText: sectionData.body_text ?? '',
    mediaUrl: sectionData.media_url ?? '',
    isRequired: Boolean(sectionData.is_required),
  };
}

function TrainingModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [module, setModule] = useState<ModuleDetailModel | null>(null);
  const [sections, setSections] = useState<SectionDetailModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!moduleId) {
        setError('Training module not found.');
        setLoading(false);
        return;
      }

      try {
        const [moduleData, sectionData] = await Promise.all([
          getTrainingModuleById(moduleId),
          getTrainingSections(moduleId),
        ]);

        if (!moduleData) {
          setError('Training module not found.');
          setLoading(false);
          return;
        }

        setModule(mapModule(moduleData as unknown as RawModule));
        setSections(((sectionData ?? []) as unknown as RawSection[]).map(mapSection));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load training module.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [moduleId]);

  const requiredItems = useMemo(() => {
    return sections.filter((section) => section.isRequired);
  }, [sections]);

  if (loading) {
    return (
      <PageContainer title="Training Module" subtitle="Loading module details...">
        <ContentCard title="Loading">Please wait.</ContentCard>
      </PageContainer>
    );
  }

  if (error || !module) {
    return (
      <PageContainer title="Training Module" subtitle="Unable to load module details.">
        <ContentCard title="Unavailable">{error ?? 'Module not found.'}</ContentCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={module.title}
      subtitle={`${module.department} • ${module.moduleType}`}
      actions={
        <div style={actionsStyle}>
          <Link to={`/training/${module.id}/start`} style={{ textDecoration: 'none' }}>
            <PrimaryButton>Conduct Training</PrimaryButton>
          </Link>

          <Link to={`/training/${module.id}/quiz/take`} style={{ textDecoration: 'none' }}>
            <PrimaryButton>Take Quiz</PrimaryButton>
          </Link>

          <Link to={`/training/${module.id}/quiz`} style={{ textDecoration: 'none' }}>
            <PrimaryButton>Manage Quiz</PrimaryButton>
          </Link>

          <Link to={`/training/${module.id}/edit`} style={{ textDecoration: 'none' }}>
            <PrimaryButton>Edit Module</PrimaryButton>
          </Link>
        </div>
      }
    >
      <div style={layoutStyle}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard
            title="Module Overview"
            subtitle="Core setup and completion requirements for this training module."
          >
            <div style={overviewGridStyle}>
              <SummaryItem label="Title" value={module.title} />
              <SummaryItem label="Department" value={module.department} />
              <SummaryItem label="Module Type" value={module.moduleType} />
              <SummaryItem
                label="Required Hours"
                value={module.requiredHours !== null ? `${module.requiredHours} hours` : '—'}
              />
              <SummaryItem
                label="Recertification"
                value={
                  module.recertFrequencyDays !== null
                    ? `${module.recertFrequencyDays} days`
                    : 'Not set'
                }
              />
              <SummaryItem label="Quiz Required" value={module.requiresQuiz ? 'Yes' : 'No'} />
              <SummaryItem label="Allergen Flag" value={module.allergenFlag ? 'Yes' : 'No'} />
              <SummaryItem label="SQF Element" value={module.sqfElement || '—'} />
              <SummaryItem label="Status" value={module.isActive ? 'Active' : 'Inactive'} />
              <SummaryItem label="Required Sections" value={String(requiredItems.length)} />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={labelStyle}>Description</label>
              <div style={descriptionStyle}>
                {module.description.trim() ? module.description : 'No description provided.'}
              </div>
            </div>
          </ContentCard>

          <ContentCard
            title="Training Content"
            subtitle={`${sections.length} section${sections.length === 1 ? '' : 's'} in this module`}
          >
            {sections.length === 0 ? (
              <div style={emptyStyle}>No sections have been added to this module yet.</div>
            ) : (
              <div style={sectionListStyle}>
                {sections.map((section, index) => (
                  <div key={section.id} style={sectionCardStyle}>
                    <div style={sectionHeaderStyle}>
                      <div>
                        <div style={sectionTitleStyle}>
                          {index + 1}. {section.title}
                        </div>
                        <div style={sectionMetaStyle}>
                          {section.sectionType}
                          {section.isRequired ? ' • Required' : ' • Optional'}
                        </div>
                      </div>

                      <Link
                        to={`/training/${module.id}/sections/${section.id}/edit`}
                        style={{ textDecoration: 'none' }}
                      >
                        <button type="button" style={secondaryButtonStyle}>
                          Edit Section
                        </button>
                      </Link>
                    </div>

                    {section.bodyText ? (
                      <div style={sectionBodyStyle}>{section.bodyText}</div>
                    ) : null}

                    {section.mediaUrl ? (
                      <div style={sectionLinkWrapStyle}>
                        <a
                          href={section.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={mediaLinkStyle}
                        >
                          Open linked media
                        </a>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              <Link
                to={`/training/${module.id}/sections/new`}
                style={{ textDecoration: 'none' }}
              >
                <PrimaryButton>Add Section</PrimaryButton>
              </Link>
            </div>
          </ContentCard>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <ContentCard title="Build Checklist" subtitle="Helpful module-level checkpoints.">
            <div style={checklistStyle}>
              <ChecklistRow
                label="Description added"
                complete={Boolean(module.description.trim())}
              />
              <ChecklistRow label="Has training sections" complete={sections.length > 0} />
              <ChecklistRow
                label="Required sections set"
                complete={requiredItems.length > 0}
              />
              <ChecklistRow
                label="Hours requirement configured"
                complete={module.moduleType !== 'Time Based' || module.requiredHours !== null}
              />
              <ChecklistRow label="Quiz requirement configured" complete={true} />
            </div>
          </ContentCard>

          <ContentCard title="Quick Actions" subtitle="Common next steps for this module.">
            <div style={quickActionsStyle}>
              <Link to={`/training/${module.id}/start`} style={{ textDecoration: 'none' }}>
                <button type="button" style={quickActionButtonStyle}>
                  Conduct Training
                </button>
              </Link>

              <Link to={`/training/${module.id}/quiz/take`} style={{ textDecoration: 'none' }}>
                <button type="button" style={quickActionButtonStyle}>
                  Take Quiz
                </button>
              </Link>

              <Link to={`/training/${module.id}/quiz`} style={{ textDecoration: 'none' }}>
                <button type="button" style={quickActionButtonStyle}>
                  Manage Quiz
                </button>
              </Link>

              <Link to={`/training/${module.id}/edit`} style={{ textDecoration: 'none' }}>
                <button type="button" style={quickActionButtonStyle}>
                  Edit Module
                </button>
              </Link>

              <Link
                to={`/training/${module.id}/sections/new`}
                style={{ textDecoration: 'none' }}
              >
                <button type="button" style={quickActionButtonStyle}>
                  Add Section
                </button>
              </Link>

              <button
                type="button"
                style={quickActionButtonStyle}
                onClick={() => navigate('/training')}
              >
                Back to Modules
              </button>
            </div>
          </ContentCard>
        </div>
      </div>
    </PageContainer>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={summaryItemStyle}>
      <div style={summaryLabelStyle}>{label}</div>
      <div style={summaryValueStyle}>{value}</div>
    </div>
  );
}

function ChecklistRow({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <div style={checklistRowStyle}>
      <span>{label}</span>
      <span style={complete ? checklistCompleteStyle : checklistPendingStyle}>
        {complete ? 'Done' : 'Pending'}
      </span>
    </div>
  );
}

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const layoutStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 0.8fr)',
  gap: '16px',
  alignItems: 'start',
};

const overviewGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '12px',
};

const summaryItemStyle: CSSProperties = {
  padding: '14px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  background: '#ffffff',
};

const summaryLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  color: theme.colors.mutedText,
  marginBottom: '6px',
};

const summaryValueStyle: CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: theme.colors.text,
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

const descriptionStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '14px',
  background: '#ffffff',
  lineHeight: 1.6,
  color: theme.colors.text,
};

const emptyStyle: CSSProperties = {
  color: theme.colors.mutedText,
  lineHeight: 1.6,
};

const sectionListStyle: CSSProperties = {
  display: 'grid',
  gap: '12px',
};

const sectionCardStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '16px',
  padding: '14px',
  background: '#ffffff',
};

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
};

const sectionTitleStyle: CSSProperties = {
  fontWeight: 800,
  color: theme.colors.text,
  marginBottom: '4px',
};

const sectionMetaStyle: CSSProperties = {
  fontSize: '13px',
  color: theme.colors.mutedText,
};

const sectionBodyStyle: CSSProperties = {
  marginTop: '12px',
  lineHeight: 1.6,
  color: theme.colors.text,
  whiteSpace: 'pre-wrap',
};

const sectionLinkWrapStyle: CSSProperties = {
  marginTop: '12px',
};

const mediaLinkStyle: CSSProperties = {
  color: '#194f91',
  fontWeight: 700,
  textDecoration: 'none',
};

const secondaryButtonStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '12px',
  padding: '10px 12px',
  fontWeight: 700,
  cursor: 'pointer',
};

const checklistStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
};

const checklistRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: `1px solid ${theme.colors.border}`,
};

const checklistCompleteStyle: CSSProperties = {
  color: '#18794e',
  fontWeight: 800,
};

const checklistPendingStyle: CSSProperties = {
  color: '#9a5b13',
  fontWeight: 800,
};

const quickActionsStyle: CSSProperties = {
  display: 'grid',
  gap: '10px',
};

const quickActionButtonStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.colors.border}`,
  background: '#ffffff',
  borderRadius: '14px',
  padding: '12px 14px',
  fontWeight: 700,
  cursor: 'pointer',
  textAlign: 'left',
};

export default TrainingModuleDetailPage;