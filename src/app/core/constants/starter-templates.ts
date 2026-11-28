import { FormConfiguration } from '../models/form-config.model';

export const STARTER_TEMPLATES: FormConfiguration[] = [
  // {
  //   id: 'enterprise-journal-entry',
  //   title: 'Enterprise Journal Entry',
  //   description: 'High-density 4-column accounting journal entry voucher form',
  //   version: '1.0.0',
  //   sections: [],
  //   fields: [
  //     {
  //       id: 'doc-no',
  //       type: 'text',
  //       name: 'documentNo',
  //       label: 'Document No.',
  //       defaultValue: 'JVE-260000062',
  //       appearance: { width: '1/4', density: 'compact' },
  //       validators: [{ type: 'required', message: 'Document No. is required' }]
  //     },
  //     {
  //       id: 'ref-no',
  //       type: 'text',
  //       name: 'referenceNo',
  //       label: 'Reference No',
  //       placeholder: 'Enter Reference No',
  //       appearance: { width: '1/4', density: 'compact' },
  //       validators: []
  //     },
  //     {
  //       id: 'trans-type',
  //       type: 'select',
  //       name: 'transactionType',
  //       label: 'Transaction Type',
  //       required: true,
  //       defaultValue: 'jve',
  //       options: [
  //         { label: 'JVE - Journal Entry', value: 'jve' },
  //         { label: 'PV - Payment Voucher', value: 'pv' },
  //         { label: 'RV - Receipt Voucher', value: 'rv' }
  //       ],
  //       appearance: { width: '1/4', density: 'compact' },
  //       validators: [{ type: 'required', message: 'Transaction Type is required' }]
  //     },
  //     {
  //       id: 'trans-date',
  //       type: 'date',
  //       name: 'date',
  //       label: 'Date',
  //       required: true,
  //       defaultValue: '2026-08-30',
  //       appearance: { width: '1/4', density: 'compact' },
  //       validators: [{ type: 'required', message: 'Date is required' }]
  //     },
  //     {
  //       id: 'narration',
  //       type: 'text',
  //       name: 'narration',
  //       label: 'Narration',
  //       defaultValue: 'JVE - Journal Entry JVE-260000062',
  //       appearance: { width: '1/4', density: 'compact' },
  //       validators: []
  //     },
  //     {
  //       id: 'currency',
  //       type: 'select',
  //       name: 'currency',
  //       label: 'Currency',
  //       required: true,
  //       defaultValue: 'sar',
  //       options: [
  //         { label: 'SAR - Saudi Riyal', value: 'sar' },
  //         { label: 'USD - US Dollar', value: 'usd' },
  //         { label: 'EUR - Euro', value: 'eur' },
  //         { label: 'AED - UAE Dirham', value: 'aed' }
  //       ],
  //       appearance: { width: '1/4', density: 'compact' },
  //       validators: [{ type: 'required', message: 'Currency is required' }]
  //     },
  //     {
  //       id: 'exchange-rate',
  //       type: 'number',
  //       name: 'exchangeRate',
  //       label: 'Exchange Rate (SAR)',
  //       defaultValue: 1.0,
  //       step: 0.0001,
  //       appearance: { width: '1/4', density: 'compact' },
  //       validators: [{ type: 'required', message: 'Exchange rate is required' }]
  //     },
  //     {
  //       id: 'fin-batch',
  //       type: 'select',
  //       name: 'financialBatch',
  //       label: 'Financial Batch',
  //       defaultValue: '163',
  //       options: [
  //         { label: '163 - test', value: '163' },
  //         { label: '164 - production batch', value: '164' }
  //       ],
  //       appearance: { width: '1/4', density: 'compact' },
  //       validators: []
  //     },
  //     {
  //       id: 'notes',
  //       type: 'text',
  //       name: 'notes',
  //       label: 'Notes',
  //       placeholder: 'Notes ...',
  //       appearance: { width: '1/4', density: 'compact' },
  //       validators: []
  //     },
  //     {
  //       id: 'status',
  //       type: 'text',
  //       name: 'status',
  //       label: 'Status',
  //       defaultValue: 'Posted',
  //       appearance: { width: '1/4', density: 'compact' },
  //       validators: []
  //     }
  //   ],
  //   settings: {
  //     submitButtonText: 'Post Journal Entry',
  //     showResetButton: true,
  //     resetButtonText: 'Clear',
  //     layout: 'vertical',
  //     density: 'compact',
  //     theme: 'classic'
  //   }
  // },
  // {
  //   id: 'enterprise-master-data',
  //   title: 'Enterprise Master Data',
  //   description: 'ERP dimension master data configuration with inline horizontal labels',
  //   version: '1.0.0',
  //   sections: [],
  //   fields: [
  //     {
  //       id: 'dim-type',
  //       type: 'select',
  //       name: 'dimensionType',
  //       label: 'Dimension Type',
  //       defaultValue: 'lob',
  //       options: [
  //         { label: 'Line of business', value: 'lob' },
  //         { label: 'Cost Center', value: 'cc' },
  //         { label: 'Project', value: 'proj' }
  //       ],
  //       appearance: { width: 'full', labelPosition: 'left', labelWidth: 150, density: 'compact' },
  //       validators: []
  //     },
  //     {
  //       id: 'parent-dim',
  //       type: 'select',
  //       name: 'parentDimension',
  //       label: 'Parent Dimension',
  //       placeholder: 'Select Parent Dimension',
  //       options: [
  //         { label: 'Corporate Office', value: 'corp' },
  //         { label: 'Operations Division', value: 'ops' }
  //       ],
  //       appearance: { width: '1/2', labelPosition: 'left', labelWidth: 150, density: 'compact' },
  //       validators: []
  //     },
  //     {
  //       id: 'parent-dim-code',
  //       type: 'text',
  //       name: 'parentDimensionCode',
  //       label: 'Parent Dimension Code',
  //       placeholder: 'Select Parent Dimension to Show Code',
  //       appearance: { width: '1/2', labelPosition: 'left', labelWidth: 160, density: 'compact' },
  //       validators: []
  //     },
  //     {
  //       id: 'name',
  //       type: 'text',
  //       name: 'name',
  //       label: 'Name',
  //       placeholder: 'Enter a Name',
  //       required: true,
  //       appearance: { width: '1/2', labelPosition: 'left', labelWidth: 150, density: 'compact' },
  //       validators: [{ type: 'required', message: 'Name is required' }]
  //     },
  //     {
  //       id: 'code',
  //       type: 'text',
  //       name: 'code',
  //       label: 'Code',
  //       placeholder: 'Enter a Code',
  //       required: true,
  //       appearance: { width: '1/2', labelPosition: 'left', labelWidth: 160, density: 'compact' },
  //       validators: [{ type: 'required', message: 'Code is required' }]
  //     },
  //     {
  //       id: 'search-key',
  //       type: 'text',
  //       name: 'searchKey',
  //       label: 'Search Key',
  //       placeholder: 'Enter a Search Key',
  //       appearance: { width: '1/2', labelPosition: 'left', labelWidth: 150, density: 'compact' },
  //       validators: []
  //     },
  //     {
  //       id: 'general-type',
  //       type: 'select',
  //       name: 'generalType',
  //       label: 'General Type',
  //       required: true,
  //       defaultValue: 'na',
  //       options: [
  //         { label: 'Not Applicable', value: 'na' },
  //         { label: 'Financial Unit', value: 'fin' },
  //         { label: 'Cost Aggregation', value: 'agg' }
  //       ],
  //       appearance: { width: '1/2', labelPosition: 'left', labelWidth: 160, density: 'compact' },
  //       validators: [{ type: 'required', message: 'General type is required' }]
  //     },
  //     {
  //       id: 'level',
  //       type: 'number',
  //       name: 'level',
  //       label: 'Level',
  //       required: true,
  //       defaultValue: 0,
  //       appearance: { width: '1/2', labelPosition: 'left', labelWidth: 150, density: 'compact' },
  //       validators: [{ type: 'required', message: 'Level is required' }]
  //     },
  //     {
  //       id: 'print-seq',
  //       type: 'number',
  //       name: 'printSequence',
  //       label: 'Print Sequence',
  //       defaultValue: 0,
  //       appearance: { width: '1/2', labelPosition: 'left', labelWidth: 160, density: 'compact' },
  //       validators: []
  //     },
  //     {
  //       id: 'responsible',
  //       type: 'select',
  //       name: 'personResponsible',
  //       label: 'Person Responsible',
  //       placeholder: 'Enter value',
  //       options: [
  //         { label: 'Finance Director', value: 'fd' },
  //         { label: 'Lead Accountant', value: 'la' }
  //       ],
  //       appearance: { width: '1/2', labelPosition: 'left', labelWidth: 150, density: 'compact' },
  //       validators: []
  //     },
  //     {
  //       id: 'description',
  //       type: 'textarea',
  //       name: 'description',
  //       label: 'Description',
  //       placeholder: 'Description',
  //       rows: 2,
  //       appearance: { width: '1/2', labelPosition: 'left', labelWidth: 160, density: 'compact' },
  //       validators: []
  //     }
  //   ],
  //   settings: {
  //     submitButtonText: 'Save Master Record',
  //     showResetButton: true,
  //     resetButtonText: 'Discard',
  //     layout: 'horizontal',
  //     density: 'compact',
  //     labelWidth: 150,
  //     theme: 'classic'
  //   }
  // },
  {
    id: 'employee-registration',
    title: 'Employee Registration',
    description: 'Onboard and register new team members with personal and role details',
    version: '1.0.0',
    sections: [
      {
        id: 'sec-personal',
        title: 'Personal Information',
        description: 'Provide your legal identity and contact channels',
        order: 0,
        appearance: { shadow: 'xs', borderRadius: 'xl', borderColor: 'default', background: 'default' }
      },
      {
        id: 'sec-employment',
        title: 'Employment Details',
        description: 'Organizational department and role positioning',
        order: 1,
        appearance: { shadow: 'xs', borderRadius: 'xl', borderColor: 'default', background: 'default' }
      }
    ],
    fields: [
      {
        id: 'field-name',
        type: 'text',
        name: 'fullName',
        label: 'Full Name',
        placeholder: 'e.g. Alex Morgan',
        required: true,
        sectionId: 'sec-personal',
        appearance: { width: '1/2' },
        validators: [
          { type: 'required', message: 'Full name is required' },
          { type: 'minLength', value: 3, message: 'Minimum 3 characters required' }
        ]
      },
      {
        id: 'field-email',
        type: 'email',
        name: 'email',
        label: 'Work Email Address',
        placeholder: 'alex.morgan@company.com',
        required: true,
        sectionId: 'sec-personal',
        appearance: { width: '1/2' },
        validators: [
          { type: 'required', message: 'Email address is required' },
          { type: 'email', message: 'Please provide a valid work email' }
        ]
      },
      {
        id: 'field-phone',
        type: 'tel',
        name: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 234-5678',
        required: false,
        sectionId: 'sec-personal',
        appearance: { width: '1/2' },
        validators: []
      },
      {
        id: 'field-startdate',
        type: 'date',
        name: 'startDate',
        label: 'Official Start Date',
        required: true,
        sectionId: 'sec-personal',
        appearance: { width: '1/2' },
        validators: [
          { type: 'required', message: 'Start date is required' }
        ]
      },
      {
        id: 'field-dept',
        type: 'select',
        name: 'department',
        label: 'Department',
        placeholder: 'Select department',
        required: true,
        sectionId: 'sec-employment',
        appearance: { width: '1/2' },
        options: [
          { label: 'Engineering', value: 'engineering' },
          { label: 'Product Design', value: 'design' },
          { label: 'Marketing & Growth', value: 'marketing' },
          { label: 'Sales & Customer Success', value: 'sales' },
          { label: 'Operations & People', value: 'operations' }
        ],
        defaultValue: 'engineering',
        validators: [
          { type: 'required', message: 'Department selection is required' }
        ]
      },
      {
        id: 'field-role',
        type: 'text',
        name: 'jobTitle',
        label: 'Job Title',
        placeholder: 'e.g. Senior Frontend Architect',
        required: true,
        sectionId: 'sec-employment',
        appearance: { width: '1/2' },
        validators: [
          { type: 'required', message: 'Job title is required' }
        ]
      },
      {
        id: 'field-remote',
        type: 'toggle',
        name: 'isRemote',
        label: 'Remote Employee',
        description: 'Toggle if this employee works remotely from home',
        defaultValue: true,
        sectionId: 'sec-employment',
        appearance: { width: 'full' },
        validators: []
      },
      {
        id: 'field-timezone',
        type: 'text',
        name: 'homeTimezone',
        label: 'Home Timezone / Country',
        placeholder: 'e.g. UTC+1 (Paris)',
        required: true,
        sectionId: 'sec-employment',
        appearance: { width: 'full' },
        validators: [
          { type: 'required', message: 'Timezone is required for remote team members' }
        ],
        conditionalLogic: {
          enabled: true,
          action: 'show',
          matchType: 'AND',
          rules: [
            { targetField: 'isRemote', operator: 'equals', value: true }
          ]
        }
      },
      {
        id: 'field-agree',
        type: 'checkbox',
        name: 'ndaSigned',
        label: 'I confirm the employee handbook and NDA have been countersigned',
        required: true,
        defaultValue: false,
        appearance: { width: 'full' },
        validators: [
          { type: 'required', message: 'Handbook and NDA acknowledgment is mandatory' }
        ]
      }
    ],
    settings: {
      submitButtonText: 'Register Employee',
      showResetButton: true,
      resetButtonText: 'Clear Form',
      layout: 'vertical',
      theme: 'modern',
      successMessage: 'Employee registration completed successfully!'
    }
  },
  {
    id: 'contact-inquiry',
    title: 'Contact & Project Inquiry',
    description: 'Get in touch regarding product inquiries, partnership proposals, and support',
    version: '1.0.0',
    sections: [],
    fields: [
      {
        id: 'field-cname',
        type: 'text',
        name: 'senderName',
        label: 'Your Name',
        placeholder: 'e.g. Jordan Lee',
        required: true,
        appearance: { width: '1/2' },
        validators: [
          { type: 'required', message: 'Please enter your name' }
        ]
      },
      {
        id: 'field-cemail',
        type: 'email',
        name: 'senderEmail',
        label: 'Email Address',
        placeholder: 'jordan@domain.com',
        required: true,
        appearance: { width: '1/2' },
        validators: [
          { type: 'required', message: 'Email address is required' },
          { type: 'email', message: 'Enter a valid email address' }
        ]
      },
      {
        id: 'field-category',
        type: 'radio',
        name: 'inquiryType',
        label: 'Inquiry Subject',
        options: [
          { label: 'General Question', value: 'general' },
          { label: 'New Project / Quote', value: 'project' },
          { label: 'Technical Support', value: 'support' }
        ],
        defaultValue: 'project',
        appearance: { width: 'full' },
        validators: []
      },
      {
        id: 'field-budget',
        type: 'range',
        name: 'projectBudget',
        label: 'Estimated Budget ($k)',
        min: 5,
        max: 150,
        step: 5,
        defaultValue: 25,
        appearance: { width: 'full' },
        validators: [],
        conditionalLogic: {
          enabled: true,
          action: 'show',
          matchType: 'AND',
          rules: [
            { targetField: 'inquiryType', operator: 'equals', value: 'project' }
          ]
        }
      },
      {
        id: 'field-message',
        type: 'textarea',
        name: 'inquiryMessage',
        label: 'Detailed Message',
        placeholder: 'Tell us about your requirements or issue...',
        required: true,
        rows: 5,
        appearance: { width: 'full' },
        validators: [
          { type: 'required', message: 'Message content is required' },
          { type: 'minLength', value: 10, message: 'Message must be at least 10 characters long' }
        ]
      }
    ],
    settings: {
      submitButtonText: 'Send Inquiry',
      showResetButton: false,
      layout: 'vertical',
      theme: 'default',
      successMessage: 'Thank you! Your message has been received.'
    }
  },
  {
    id: 'customer-feedback',
    title: 'Customer Satisfaction Feedback',
    description: 'Collect net satisfaction scores, reviews, and feature requests',
    version: '1.0.0',
    sections: [],
    fields: [
      {
        id: 'field-rating',
        type: 'rating',
        name: 'overallScore',
        label: 'Overall Experience Rating',
        max: 5,
        defaultValue: 5,
        appearance: { width: 'full' },
        validators: []
      },
      {
        id: 'field-recommend',
        type: 'radio',
        name: 'wouldRecommend',
        label: 'Would you recommend FormForge to a colleague?',
        options: [
          { label: 'Definitely Yes', value: 'yes' },
          { label: 'Maybe / Neutral', value: 'maybe' },
          { label: 'Not at this time', value: 'no' }
        ],
        defaultValue: 'yes',
        appearance: { width: 'full' },
        validators: []
      },
      {
        id: 'field-favfeatures',
        type: 'multiselect',
        name: 'favoriteFeatures',
        label: 'What features impressed you most?',
        options: [
          { label: 'Drag and Drop Canvas', value: 'dnd' },
          { label: 'Angular Code Generator', value: 'codegen' },
          { label: 'Tailwind CSS Templates', value: 'tailwind' },
          { label: 'Real-time Form Preview', value: 'preview' },
          { label: 'Conditional Logic', value: 'conditions' }
        ],
        defaultValue: ['codegen', 'tailwind'],
        appearance: { width: 'full' },
        validators: []
      },
      {
        id: 'field-comments',
        type: 'textarea',
        name: 'feedbackComments',
        label: 'Additional Feedback or Feature Requests',
        placeholder: 'What can we improve for you?',
        rows: 3,
        appearance: { width: 'full' },
        validators: []
      }
    ],
    settings: {
      submitButtonText: 'Submit Feedback',
      showResetButton: false,
      layout: 'vertical',
      theme: 'modern',
      successMessage: 'Thank you for your valuable feedback!'
    }
  }
];
