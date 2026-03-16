import { useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import { createTrainingSection } from '../features/training/trainingApi';
import { theme } from '../styles/theme';

function CreateTrainingSectionPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    section_type: 'text' as 'text' | 'video' | 'image' | 'pdf' | 'acknowledgement',
    body_text: '',
    media_url: '',
    sort_order: '1',
    is_required: true,
  });

  async function handleSubmit() {
    if (!moduleId) return;

    try {
      setSaving(true);

      await createTrainingSection({
        module_id: moduleId,
        title: form.title,
        section_type: form.section_type,
        body_text: form.body_text || null,
        media_url: form.media_url || null,
        sort_order: Number(form.sort_order),
        is_required: form.is_required,
      });

      navigate(`/training/${moduleId}`);
    } catch (error: unknown) {
      console.error('CREATE TRAINING SECTION ERROR:', error);
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Failed to create training section: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer
      title="Add Module Section"
      subtitle="Create a new section inside this training module."
      actions={
        <PrimaryButton onClick={handleSubmit} disabled={saving}>
          {saving ? 'Creating Section...' : 'Create Section'}
        </PrimaryButton>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        <ContentCard
          title="Section Details"
          subtitle="Define the content and behavior of this section."
        >
          <div style={gridTwoStyle}>
            <Field label="Section Title">
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter section title"
              />
            </Field>

            <Field label="Section Type">
              <select
                style={inputStyle}
                value={form.section_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    section_type: e.target.value as
                      | 'text'
                      | 'video'
                      | 'image'
                      | 'pdf'
                      | 'acknowledgement',
                  })
                }
              >
                <option value="text">Text</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
                <option value="pdf">PDF</option>
                <option value="acknowledgement">Acknowledgement</option>
              </select>
            </Field>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Body Text">
                <textarea
                  style={textareaStyle}
                  value={form.body_text}
                  onChange={(e) => setForm({ ...form, body_text: e.target.value })}
                  placeholder="Enter instructions, copy, or section text"
                />
              </Field>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Media URL">
                <input
                  style={inputStyle}
                  value={form.media_url}
                  onChange={(e) => setForm({ ...form, media_url: e.target.value })}
                  placeholder="Paste a Vimeo, image, or PDF URL if needed"
                />
              </Field>
            </div>

            <Field label="Sort Order">
              <input
                type="number"
                style={inputStyle}
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              />
            </Field>

            <Field label="Required">
              <div style={toggleWrapStyle}>
                <input
                  type="checkbox"
                  checked={form.is_required}
                  onChange={(e) =>
                    setForm({ ...form, is_required: e.target.checked })
                  }
                />
                <span>This section must be completed</span>
              </div>
            </Field>
          </div>
        </ContentCard>

        <ContentCard
          title="Builder Note"
          subtitle="This is the first step toward a full module builder."
        >
          <p style={noteTextStyle}>
            Later phases will allow drag-and-drop ordering, richer media blocks,
            trainee progress tracking, and completion logic per section.
          </p>
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

const gridTwoStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '16px',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: '13px',
  marginBottom: '6px',
  fontWeight: 700,
};

const inputStyle: CSSProperties = {
  width: '100%',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '13px 14px',
  fontSize: '14px',
  background: '#ffffff',
};

const textareaStyle: CSSProperties = {
  width: '100%',
  minHeight: '120px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  padding: '13px 14px',
  fontSize: '14px',
  background: '#ffffff',
  resize: 'vertical',
};

const toggleWrapStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '13px 14px',
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '14px',
  background: '#ffffff',
};

const noteTextStyle: CSSProperties = {
  margin: 0,
  color: theme.colors.mutedText,
  lineHeight: 1.65,
  fontSize: '14px',
};

export default CreateTrainingSectionPage;