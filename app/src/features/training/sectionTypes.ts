export type TrainingSectionRecord = {
  id: string;
  module_id: string;
  title: string;
  section_type: 'text' | 'video' | 'image' | 'pdf' | 'acknowledgement';
  body_text?: string | null;
  media_url?: string | null;
  sort_order: number;
  is_required: boolean;
};

export type TrainingSectionCardModel = {
  id: string;
  title: string;
  sectionType: string;
  bodyText: string;
  mediaUrl: string;
  sortOrder: number;
  isRequired: boolean;
};