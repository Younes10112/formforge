import { TestBed } from '@angular/core/testing';
import { FormConfiguration, FormField } from '../models/form-config.model';
import { DynamicFormService } from './dynamic-form.service';

describe('DynamicFormService', () => {
  let service: DynamicFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicFormService);
  });

  it('should build a reactive FormGroup from configuration', () => {
    const config: FormConfiguration = {
      id: 'login-form',
      title: 'Login',
      version: '1.0.0',
      sections: [],
      fields: [
        {
          id: 'f1',
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          appearance: { width: 'full' },
          validators: [{ type: 'email', message: 'Invalid email' }]
        },
        {
          id: 'f2',
          name: 'password',
          label: 'Password',
          type: 'password',
          required: true,
          appearance: { width: 'full' },
          validators: [{ type: 'minLength', value: 6, message: 'Min 6 chars' }]
        },
        {
          id: 'layout1',
          name: 'heading',
          label: 'Heading',
          type: 'heading',
          appearance: { width: 'full' },
          validators: []
        }
      ],
      settings: {
        submitButtonText: 'Log In',
        showResetButton: false,
        layout: 'vertical',
        theme: 'default'
      }
    };

    const group = service.buildFormGroup(config);
    expect(group.contains('email')).toBe(true);
    expect(group.contains('password')).toBe(true);
    // Heading layout field should not be in form controls
    expect(group.contains('heading')).toBe(false);

    // Initial state
    expect(group.get('email')?.valid).toBe(false); // required
    group.get('email')?.setValue('test@domain.com');
    expect(group.get('email')?.valid).toBe(true);

    group.get('password')?.setValue('123');
    expect(group.get('password')?.hasError('minlength')).toBe(true);
    group.get('password')?.setValue('123456');
    expect(group.get('password')?.valid).toBe(true);
  });

  it('should evaluate conditional visibility rules dynamically', () => {
    const fields: FormField[] = [
      {
        id: 'f1',
        name: 'hasPet',
        label: 'Do you have a pet?',
        type: 'toggle',
        defaultValue: false,
        appearance: { width: 'full' },
        validators: []
      },
      {
        id: 'f2',
        name: 'petType',
        label: 'Pet Type',
        type: 'text',
        appearance: { width: 'full' },
        validators: [],
        conditionalLogic: {
          enabled: true,
          action: 'show',
          matchType: 'AND',
          rules: [{ targetField: 'hasPet', operator: 'equals', value: true }]
        }
      }
    ];

    const config: FormConfiguration = {
      id: 'survey',
      title: 'Survey',
      version: '1.0.0',
      sections: [],
      fields,
      settings: {
        submitButtonText: 'Submit',
        showResetButton: false,
        layout: 'vertical',
        theme: 'default'
      }
    };

    const group = service.buildFormGroup(config);
    const initialEval = service.evaluateConditionalLogic(group, fields);
    expect(initialEval.visibilityMap['petType']).toBe(false);

    // When hasPet becomes true
    group.get('hasPet')?.setValue(true);
    const updatedEval = service.evaluateConditionalLogic(group, fields);
    expect(updatedEval.visibilityMap['petType']).toBe(true);
  });

  it('should return custom error messages', () => {
    const field: FormField = {
      id: 'f1',
      name: 'age',
      label: 'Age',
      type: 'number',
      appearance: { width: 'full' },
      validators: [
        { type: 'min', value: 18, message: 'You must be at least 18 years old.' }
      ]
    };

    const msg = service.getErrorMessage(field, 'min');
    expect(msg).toBe('You must be at least 18 years old.');
  });
});
