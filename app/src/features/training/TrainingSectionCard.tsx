import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { theme } from '../../styles/theme';
import type { TrainingSectionCardModel } from './sectionTypes';

function TrainingSectionCard({
  section,
  moduleId,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false,
}: {
  section: TrainingSectionCardModel;
  moduleId: string;
  onDelete: () => void;
  onDragStart?: () => void;
  onDragOver?: () => void;
  onDrop?: () => void;
  isDragging?: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver?.();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop?.();
      }}
      style={{
        ...cardStyle,
        opacity: isDragging ? 0.6 : 1,
      }}
    >
      <div style={headerRowStyle}>
        <div>
          <div style={titleRowStyle}>
            <span style={sortPillStyle}>{section.sortOrder}</span>
            <span style={titleStyle}>{section.title}</span>
          </div>
          <div style={metaStyle}>
            {section.sectionType}
            {section.isRequired ? ' • required' : ' • optional'}
          </div>
        </div>

        <div style={actionsStyle}>
          <Link
            to={`/training/${moduleId}/sections/${section.id}/edit`}
            style={actionLinkStyle}
          >
            Edit
          </Link>
          <button type="button" onClick={onDelete} style={deleteButtonStyle}>
            Delete
          </button>
        </div>
      </div>

      {section.bodyText ? (
        <div style={bodyStyle}>{section.bodyText}</div>
      ) : null}

      {section.mediaUrl ? (
        <div style={mediaStyle}>{section.mediaUrl}</div>
      ) : null}
    </div>
  );
}

const cardStyle: CSSProperties = {
  border: `1px solid ${theme.colors.border}`,
  borderRadius: '18px',
  padding: '16px',
  background: '#ffffff',
};

const headerRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  alignItems: 'flex-start',
};

const titleRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '6px',
};

const sortPillStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '28px',
  height: '28px',
  borderRadius: '999px',
  background: '#eef6ff',
  color: '#194f91',
  fontSize: '12px',
  fontWeight: 800,
  padding: '0 8px',
};

const titleStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
  color: theme.colors.text,
};

const metaStyle: CSSProperties = {
  fontSize: '13px',
  color: theme.colors.mutedText,
};

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexShrink: 0,
};

const actionLinkStyle: CSSProperties = {
  color: '#194f91',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '14px',
};

const deleteButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: '#a12828',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: '14px',
};

const bodyStyle: CSSProperties = {
  marginTop: '12px',
  color: theme.colors.mutedText,
  lineHeight: 1.6,
};

const mediaStyle: CSSProperties = {
  marginTop: '12px',
  color: '#194f91',
  fontSize: '13px',
  wordBreak: 'break-word',
};

export default TrainingSectionCard;