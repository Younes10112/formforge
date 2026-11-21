import { PaletteItem } from '../models/palette.model';

export const COMPONENT_PALETTE: PaletteItem[] = [
  // Basic Fields
  {
    type: 'text',
    label: 'Text Input',
    category: 'basic',
    icon: 'type',
    description: 'Single-line text input field',
    defaultField: {
      namePrefix: 'text',
      type: 'text',
      label: 'Text Field',
      placeholder: 'Enter text...',
      appearance: { width: 'full' },
      validators: []
    }
  },
  {
    type: 'textarea',
    label: 'Textarea',
    category: 'basic',
    icon: 'align-left',
    description: 'Multi-line expanded text area',
    defaultField: {
      namePrefix: 'textarea',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter details...',
      rows: 4,
      appearance: { width: 'full' },
      validators: []
    }
  },
  {
    type: 'email',
    label: 'Email',
    category: 'basic',
    icon: 'mail',
    description: 'Email address with built-in format check',
    defaultField: {
      namePrefix: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'user@example.com',
      appearance: { width: 'full' },
      validators: [
        { type: 'email', message: 'Please enter a valid email address' }
      ]
    }
  },
  {
    type: 'password',
    label: 'Password',
    category: 'basic',
    icon: 'key',
    description: 'Secure masked password input',
    defaultField: {
      namePrefix: 'password',
      type: 'password',
      label: 'Password',
      placeholder: '••••••••',
      appearance: { width: 'full' },
      validators: [
        { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
      ]
    }
  },
  {
    type: 'number',
    label: 'Number',
    category: 'basic',
    icon: 'hash',
    description: 'Numeric input with step and min/max limits',
    defaultField: {
      namePrefix: 'number',
      type: 'number',
      label: 'Age / Quantity',
      placeholder: '0',
      min: 0,
      max: 1000,
      step: 1,
      appearance: { width: '1/2' },
      validators: []
    }
  },
  {
    type: 'tel',
    label: 'Phone',
    category: 'basic',
    icon: 'phone',
    description: 'Telephone number input',
    defaultField: {
      namePrefix: 'phone',
      type: 'tel',
      label: 'Phone Number',
      placeholder: '+1 (555) 000-0000',
      appearance: { width: '1/2' },
      validators: []
    }
  },
  {
    type: 'url',
    label: 'URL',
    category: 'basic',
    icon: 'globe',
    description: 'Web URL input field',
    defaultField: {
      namePrefix: 'url',
      type: 'url',
      label: 'Website / Portfolio',
      placeholder: 'https://example.com',
      appearance: { width: 'full' },
      validators: [
        { type: 'pattern', value: '^https?://.+', message: 'Must start with http:// or https://' }
      ]
    }
  },
  {
    type: 'date',
    label: 'Date',
    category: 'basic',
    icon: 'calendar',
    description: 'Calendar date picker',
    defaultField: {
      namePrefix: 'date',
      type: 'date',
      label: 'Select Date',
      appearance: { width: '1/2' },
      validators: []
    }
  },
  {
    type: 'time',
    label: 'Time',
    category: 'basic',
    icon: 'clock',
    description: 'Clock time selector',
    defaultField: {
      namePrefix: 'time',
      type: 'time',
      label: 'Select Time',
      appearance: { width: '1/2' },
      validators: []
    }
  },

  // Selection Fields
  {
    type: 'select',
    label: 'Select',
    category: 'selection',
    icon: 'chevron-down',
    description: 'Dropdown selection menu',
    defaultField: {
      namePrefix: 'select',
      type: 'select',
      label: 'Dropdown Selection',
      placeholder: 'Choose an option',
      options: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
        { label: 'Option 3', value: 'opt3' }
      ],
      appearance: { width: 'full' },
      validators: []
    }
  },
  {
    type: 'multiselect',
    label: 'Multi-select',
    category: 'selection',
    icon: 'check-square',
    description: 'Select multiple items from a list',
    defaultField: {
      namePrefix: 'multiselect',
      type: 'multiselect',
      label: 'Multiple Choices',
      options: [
        { label: 'Engineering', value: 'eng' },
        { label: 'Design', value: 'design' },
        { label: 'Product', value: 'product' },
        { label: 'Marketing', value: 'marketing' }
      ],
      defaultValue: [],
      appearance: { width: 'full' },
      validators: []
    }
  },
  {
    type: 'radio',
    label: 'Radio Group',
    category: 'selection',
    icon: 'disc',
    description: 'Single choice radio button group',
    defaultField: {
      namePrefix: 'radio',
      type: 'radio',
      label: 'Single Choice',
      options: [
        { label: 'Standard Tier', value: 'standard' },
        { label: 'Pro Tier', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' }
      ],
      defaultValue: 'standard',
      appearance: { width: 'full' },
      validators: []
    }
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    category: 'selection',
    icon: 'check',
    description: 'Single boolean check agreement',
    defaultField: {
      namePrefix: 'agree',
      type: 'checkbox',
      label: 'I agree to the terms and privacy policy',
      defaultValue: false,
      appearance: { width: 'full' },
      validators: [
        { type: 'required', message: 'You must accept the terms to proceed' }
      ]
    }
  },
  {
    type: 'toggle',
    label: 'Toggle Switch',
    category: 'selection',
    icon: 'toggle-left',
    description: 'Interactive modern switch toggle',
    defaultField: {
      namePrefix: 'toggle',
      type: 'toggle',
      label: 'Enable Email Notifications',
      defaultValue: true,
      appearance: { width: 'full' },
      validators: []
    }
  },

  // Advanced Fields
  {
    type: 'file',
    label: 'File Upload',
    category: 'advanced',
    icon: 'upload-cloud',
    description: 'File upload zone with type restrictions',
    defaultField: {
      namePrefix: 'file',
      type: 'file',
      label: 'Upload Attachment',
      description: 'PDF, PNG, JPG up to 10MB',
      accept: '.pdf,.png,.jpg,.jpeg',
      maxFileSizeMb: 10,
      appearance: { width: 'full' },
      validators: []
    }
  },
  {
    type: 'range',
    label: 'Range Slider',
    category: 'advanced',
    icon: 'sliders',
    description: 'Continuous or stepped value slider',
    defaultField: {
      namePrefix: 'range',
      type: 'range',
      label: 'Budget Range ($k)',
      min: 0,
      max: 100,
      step: 5,
      defaultValue: 25,
      appearance: { width: 'full' },
      validators: []
    }
  },
  {
    type: 'rating',
    label: 'Rating',
    category: 'advanced',
    icon: 'star',
    description: 'Interactive 5-star rating control',
    defaultField: {
      namePrefix: 'rating',
      type: 'rating',
      label: 'Satisfaction Score',
      max: 5,
      defaultValue: 4,
      appearance: { width: '1/2' },
      validators: []
    }
  },
  {
    type: 'color',
    label: 'Color Picker',
    category: 'advanced',
    icon: 'palette',
    description: 'Hex color picker swatch',
    defaultField: {
      namePrefix: 'color',
      type: 'color',
      label: 'Brand Accent Color',
      defaultValue: '#3b82f6',
      appearance: { width: '1/2' },
      validators: []
    }
  },
  {
    type: 'hidden',
    label: 'Hidden Field',
    category: 'advanced',
    icon: 'eye-off',
    description: 'Hidden payload input value',
    defaultField: {
      namePrefix: 'hidden',
      type: 'hidden',
      label: 'Source Tracking ID',
      defaultValue: 'formforge-v1',
      appearance: { width: 'full' },
      validators: []
    }
  },

  // Layout Components
  {
    type: 'heading',
    label: 'Heading',
    category: 'layout',
    icon: 'heading',
    description: 'Section headline text',
    defaultField: {
      namePrefix: 'heading',
      type: 'heading',
      label: 'Section Heading',
      content: 'Personal & Contact Information',
      headingLevel: 2,
      appearance: { width: 'full' },
      validators: []
    }
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    category: 'layout',
    icon: 'file-text',
    description: 'Descriptive guidance text block',
    defaultField: {
      namePrefix: 'paragraph',
      type: 'paragraph',
      label: 'Description Block',
      content: 'Please ensure all submitted details match your official identification documents.',
      appearance: { width: 'full' },
      validators: []
    }
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'layout',
    icon: 'minus',
    description: 'Horizontal thematic break separator',
    defaultField: {
      namePrefix: 'divider',
      type: 'divider',
      label: 'Divider',
      appearance: { width: 'full' },
      validators: []
    }
  },
  {
    type: 'section',
    label: 'Form Section',
    category: 'layout',
    icon: 'layout',
    description: 'Container grouping related fields',
    defaultField: {
      namePrefix: 'section',
      type: 'section',
      label: 'Professional Experience',
      description: 'Details about your current role and tenure',
      appearance: { width: 'full' },
      validators: []
    }
  }
];
