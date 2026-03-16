import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import type { TrainingSectionCardModel } from './sectionTypes';

function TrainingSectionCard({
  section,
  moduleId,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: {
  section: TrainingSectionCardModel;
  moduleId: string;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  isDragging?: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      style={{
        padding: '16px',
        border: '1px solid #dbe4ee',
        borderRadius: '16px',
        background: isDragging ? '#f7f9fc' : '#ffffff',
        opacity: isDragging ? 0.7 : 1,
        cursor: 'grab',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: '#eef3f8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#5f6b76',
              flexShrink: 0,
            }}
            title="Drag to reorder"
          >
            ⋮⋮
          </div>

          <div>
            <div style={{ fontWeight: 800, fontSize: '16px' }}>
              {section.sortOrder}. {section.title}
            </div>
            <div style={{ marginTop: '6px', color: '#5f6b76', fontSize: '14px' }}>
              {section.typeLabel}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <StatusBadge
            label={section.isRequired ? 'Required' : 'Optional'}
            variant={section.isRequired ? 'info' : 'warning'}
          />

          <Link
            to={`/training/${moduleId}/sections/${section.id}/edit`}
            style={editLinkStyle}
          >
            ✎ Edit
          </Link>

          <button
            type="button"
            onClick={onDelete}
            style={deleteButtonStyle}
          >
            Delete
          </button>
        </div>
      </div>

      {section.bodyText ? (
        <div style={{ marginTop: '12px', color: '#5f6b76', lineHeight: 1.6 }}>
          {section.bodyText}
        </div>
      ) : null}

      {section.mediaUrl ? (
        <div
          style={{
            marginTop: '12px',
            fontSize: '13px',
            color: '#194f91',
            wordBreak: 'break-word',
          }}
        >
          {section.mediaUrl}
        </div>
      ) : null}
    </div>
  );
}

const editLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 700,
  color: '#194f91',
};

const deleteButtonStyle: React.CSSProperties = {
  border: '1px solid #f3cccc',
  background: '#fff7f7',
  color: '#a12828',
  borderRadius: '10px',
  padding: '6px 10px',
  cursor: 'pointer',
  fontWeight: 700,
};

export default TrainingSectionCard;