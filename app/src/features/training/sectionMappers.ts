import type {
  TrainingSectionCardModel,
  TrainingSectionRecord,
} from './sectionTypes';

export function mapTrainingSectionToCard(
  section: TrainingSectionRecord
): TrainingSectionCardModel {
  const typeMap: Record<TrainingSectionRecord['section_type'], string> = {
    text: 'Text',
    video: 'Video',
    image: 'Image',
    pdf: 'PDF',
    acknowledgement: 'Acknowledgement',
  };

  return {
    id: section.id,
    title: section.title,
    typeLabel: typeMap[section.section_type],
    bodyText: section.body_text ?? '',
    mediaUrl: section.media_url ?? '',
    sortOrder: section.sort_order,
    isRequired: section.is_required,
  };
}