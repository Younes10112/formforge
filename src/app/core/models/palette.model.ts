import { FieldType, FormField } from './form-config.model';

export type ComponentCategory = 'basic' | 'selection' | 'advanced' | 'layout';

export interface PaletteItem {
  type: FieldType;
  label: string;
  category: ComponentCategory;
  icon: string;
  description: string;
  defaultField: Omit<FormField, 'id' | 'name'> & { namePrefix: string };
}
