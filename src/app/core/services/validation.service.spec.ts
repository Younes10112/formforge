import { TestBed } from '@angular/core/testing';
import { FormConfiguration } from '../models/form-config.model';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  it('should validate valid form configuration correctly', () => {
    const config: FormConfiguration = {
      id: 'test-form',
      title: 'Test Form',
      version: '1.0.0',
      sections: [],
      fields: [
        {
          id: 'f1',
          name: 'username',
          label: 'Username',
          type: 'text',
          appearance: { width: 'full' },
          validators: [{ type: 'required', message: 'Required' }]
        }
      ],
      settings: {
        submitButtonText: 'Submit',
        showResetButton: false,
        layout: 'vertical',
        theme: 'default'
      }
    };

    const result = service.validateFormConfiguration(config);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should detect duplicate field names', () => {
    const config: any = {
      id: 'test-form',
      title: 'Test Form',
      fields: [
        { id: 'f1', name: 'email', label: 'Email', type: 'email' },
        { id: 'f2', name: 'email', label: 'Repeat Email', type: 'email' }
      ]
    };

    const result = service.validateFormConfiguration(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate field name detected'))).toBe(true);
  });

  it('should detect invalid variable identifier names', () => {
    const config: any = {
      id: 'test-form',
      title: 'Test Form',
      fields: [
        { id: 'f1', name: 'user-name', label: 'User Name', type: 'text' },
        { id: 'f2', name: '123num', label: 'Number', type: 'number' }
      ]
    };

    const result = service.validateFormConfiguration(config);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('not a valid TypeScript variable identifier'))).toBe(true);
  });

  it('should detect circular dependencies in conditional rules', () => {
    const fields: any[] = [
      {
        id: 'f1',
        name: 'fieldA',
        type: 'text',
        conditionalLogic: {
          enabled: true,
          rules: [{ targetField: 'fieldB', operator: 'equals', value: '1' }]
        }
      },
      {
        id: 'f2',
        name: 'fieldB',
        type: 'text',
        conditionalLogic: {
          enabled: true,
          rules: [{ targetField: 'fieldA', operator: 'equals', value: '2' }]
        }
      }
    ];

    const cycleErrors = service.detectCircularConditions(fields);
    expect(cycleErrors.length).toBeGreaterThan(0);
    expect(cycleErrors[0]).toContain('Circular dependency');
  });

  it('should slugify field labels into camelCase variable names', () => {
    expect(service.slugify('Full Name')).toBe('fullName');
    expect(service.slugify('Email Address')).toBe('emailAddress');
    expect(service.slugify('years_of_experience')).toBe('yearsOfExperience');
  });
});
