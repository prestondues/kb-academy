import StatusBadge from '../../components/StatusBadge';
import type { TrainingSectionCardModel } from './sectionTypes';

function TrainingSectionCard({
  section,
}: {
  section: TrainingSectionCardModel;
}) {
  return (
    <div
      style={{
        padding: '16px',
        border: '1px solid #dbe4ee',
        borderRadius: '16px',
        background: '#ffffff',
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
        <div>
          <div style={{ fontWeight: 800, fontSize: '16px' }}>
            {section.sortOrder}. {section.title}
          </div>
          <div style={{ marginTop: '6px', color: '#5f6b76', fontSize: '14px' }}>
            {section.typeLabel}
          </div>
        </div>

        <StatusBadge
          label={section.isRequired ? 'Required' : 'Optional'}
          variant={section.isRequired ? 'info' : 'warning'}
        />
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

export default TrainingSectionCard;