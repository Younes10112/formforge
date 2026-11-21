export type BasicFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'time';

export type SelectionFieldType =
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'toggle';

export type AdvancedFieldType =
  | 'file'
  | 'range'
  | 'rating'
  | 'color'
  | 'hidden';

export type LayoutFieldType =
  | 'heading'
  | 'paragraph'
  | 'divider'
  | 'section';

export type FieldType =
  | BasicFieldType
  | SelectionFieldType
  | AdvancedFieldType
  | LayoutFieldType;

export type ValidatorType =
  | 'required'
  | 'email'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'custom';

export interface FieldValidation {
  type: ValidatorType;
  value?: string | number | boolean;
  message: string;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export type ConditionalOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'greaterThan'
  | 'lessThan'
  | 'isEmpty'
  | 'isNotEmpty';

export type ConditionalAction =
  | 'show'
  | 'hide'
  | 'enable'
  | 'disable'
  | 'require';

export interface ConditionalRule {
  targetField: string;
  operator: ConditionalOperator;
  value?: unknown;
}

export interface ConditionalLogic {
  enabled: boolean;
  action: ConditionalAction;
  matchType: 'AND' | 'OR';
  rules: ConditionalRule[];
}

export type FieldWidth = 'full' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4';
export type LabelPosition = 'top' | 'left' | 'default';
export type FormDensity = 'compact' | 'normal' | 'comfortable';
export type FormLayoutMode = 'vertical' | 'horizontal' | 'grid';
export type FormTheme = 'default' | 'modern' | 'minimal' | 'bordered' | 'classic';

export interface FieldAppearance {
  width: FieldWidth;
  labelPosition?: LabelPosition;
  labelWidth?: number;
  density?: FormDensity;
  helpText?: string;
  customClass?: string;
  minHeight?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  defaultValue?: unknown;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  sectionId?: string;
  validators: FieldValidation[];
  options?: SelectOption[];
  appearance: FieldAppearance;
  conditionalLogic?: ConditionalLogic;
  // Specific attributes based on field type
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  maxFileSizeMb?: number;
  rows?: number;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  content?: string; // For paragraph or heading
}

export type SectionShadow = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SectionBorderColor = 'default' | 'slate' | 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'transparent';
export type SectionBorderWidth = 'none' | 'thin' | 'thick';
export type SectionBorderRadius = 'none' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type SectionBackground = 'default' | 'white' | 'slate' | 'tinted' | 'transparent';
export type SectionHeaderStyle = 'default' | 'subtle' | 'tinted' | 'divided';
export type CardPadding = 'none' | 'compact' | 'normal' | 'comfortable' | 'relaxed' | 'spacious';
export type CardMargin = 'none' | 'compact' | 'normal' | 'relaxed' | 'spacious';
export type SectionPadding = CardPadding;
export type SectionMargin = CardMargin;

export interface SectionAppearance {
  shadow?: SectionShadow;
  borderColor?: SectionBorderColor;
  borderWidth?: SectionBorderWidth;
  borderRadius?: SectionBorderRadius;
  background?: SectionBackground;
  headerStyle?: SectionHeaderStyle;
  padding?: CardPadding;
  margin?: CardMargin;
  customClass?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  order: number;
  appearance?: SectionAppearance;
}

export interface FormSettings {
  submitButtonText: string;
  showResetButton: boolean;
  resetButtonText?: string;
  layout: FormLayoutMode;
  density?: FormDensity;
  theme?: FormTheme;
  labelWidth?: number;
  columns?: 1 | 2 | 3 | 4;
  padding?: CardPadding;
  margin?: CardMargin;
  successMessage?: string;
  errorMessage?: string;
}

export interface FormConfiguration {
  id: string;
  title: string;
  description?: string;
  version: string;
  updatedAt?: string;
  sections: FormSection[];
  fields: FormField[];
  settings: FormSettings;
}
