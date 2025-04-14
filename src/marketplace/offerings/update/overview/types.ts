export interface Attribute {
  key: string;
  title: string;
  type: string;
  maxLength?: number;
  required?: boolean;
  description?: string;
  requiredMsg?: string;
}
export interface EditOfferingProps {
  offering;
  refetch;
  attribute: Attribute;
  disabled?: boolean;
}

export type MediaType = 'thumbnail' | 'image';
