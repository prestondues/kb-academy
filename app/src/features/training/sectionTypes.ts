export type TrainingSectionType =
  | 'text'
  | 'video'
  | 'image'
  | 'pdf'
  | 'acknowledgement';

export type TrainingSectionRecord = {
  id: string;
  module_id: string;
  title: string;
  section_type: TrainingSectionType;
  body_text?: string | null;
  media_url?: string | null;
  sort_order: number;
  is_required: boolean;
};

export type TrainingSectionCardModel = {
  id: string;
  title: string;
  typeLabel: string;
  bodyText: string;
  mediaUrl: string;
  sortOrder: number;
  isRequired: boolean;
};