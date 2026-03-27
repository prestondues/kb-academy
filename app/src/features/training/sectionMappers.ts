import type { TrainingSectionCardModel, TrainingSectionRecord } from './sectionTypes';

export function mapTrainingSectionToCard(
  section: TrainingSectionRecord
): TrainingSectionCardModel {
  return {
    id: section.id,
    title: section.title,
    sectionType: section.section_type,
    bodyText: section.body_text ?? '',
    mediaUrl: section.media_url ?? '',
    sortOrder: section.sort_order,
    isRequired: section.is_required,
  };
}