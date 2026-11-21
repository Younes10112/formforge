import { TestBed } from '@angular/core/testing';
import { STARTER_TEMPLATES } from '../constants/starter-templates';
import { FormConfiguration } from '../models/form-config.model';
import { CodeGeneratorService } from './code-generator.service';

describe('CodeGeneratorService', () => {
  let service: CodeGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeGeneratorService);
  });

  it('should generate all required files for an Angular form component', () => {
    const config: FormConfiguration = STARTER_TEMPLATES[0]; // Employee Registration
    const project = service.generateProject(config);

    expect(project.componentTs).toBeDefined();
    expect(project.componentHtml).toBeDefined();
    expect(project.componentCss).toBeDefined();
    expect(project.modelTs).toBeDefined();
    expect(project.configJson).toBeDefined();
    expect(project.readmeMd).toBeDefined();

    expect(project.diagnostics.valid).toBe(true);
    expect(project.diagnostics.errors.length).toBe(0);
  });

  it('should generate valid TypeScript component structure with FormControl declarations and Validators', () => {
    const config: FormConfiguration = {
      id: 'contact-form',
      title: 'Contact Form',
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
          name: 'age',
          label: 'Age',
          type: 'number',
          min: 18,
          appearance: { width: '1/2' },
          validators: [{ type: 'min', value: 18, message: 'Minimum 18' }]
        }
      ],
      settings: {
        submitButtonText: 'Send',
        showResetButton: true,
        resetButtonText: 'Reset Form',
        layout: 'vertical',
        theme: 'modern'
      }
    };

    const ts = service.generateComponentTs(config);
    expect(ts.name).toBe('generated-form.component.ts');
    expect(ts.content).toContain("import { Component, OnInit, output } from '@angular/core'");
    expect(ts.content).toContain('ReactiveFormsModule');
    expect(ts.content).toContain('export class ContactFormComponent');
    expect(ts.content).toContain('email: new FormControl<string>');
    expect(ts.content).toContain('age: new FormControl<number>');
    expect(ts.content).toContain('Validators.required');
    expect(ts.content).toContain('Validators.email');
    expect(ts.content).toContain('Validators.min(18)');
    expect(ts.content).toContain('onSubmit(): void');
    expect(ts.content).toContain('onReset(): void');
    expect(ts.content).toContain('this.form.markAllAsTouched()');
  });

  it('should generate valid HTML template with Angular @if syntax and Tailwind CSS classes', () => {
    const config: FormConfiguration = {
      id: 'simple-form',
      title: 'Simple',
      version: '1.0.0',
      sections: [],
      fields: [
        {
          id: 'f1',
          name: 'fullName',
          label: 'Full Name',
          type: 'text',
          required: true,
          appearance: { width: 'full' },
          validators: [{ type: 'required', message: 'Name is required' }]
        }
      ],
      settings: {
        submitButtonText: 'Submit',
        showResetButton: false,
        layout: 'vertical',
        theme: 'default'
      }
    };

    const html = service.generateComponentHtml(config);
    expect(html.name).toBe('generated-form.component.html');
    expect(html.content).toContain('[formGroup]="form"');
    expect(html.content).toContain('formControlName="fullName"');
    expect(html.content).toContain("@if (form.controls.fullName.touched && form.controls.fullName.invalid)");
    expect(html.content).toContain("@if (form.controls.fullName.hasError('required'))");
    expect(html.content).toContain('Name is required');
    expect(html.content).toContain('rounded-2xl');
    expect(html.content).toContain('border');
  });

  it('should generate TypeScript model interface with correct types', () => {
    const config: FormConfiguration = {
      id: 'user-profile',
      title: 'User Profile',
      version: '1.0.0',
      sections: [],
      fields: [
        { id: '1', name: 'bio', label: 'Bio', type: 'textarea', appearance: { width: 'full' }, validators: [] },
        { id: '2', name: 'followers', label: 'Followers', type: 'number', appearance: { width: 'full' }, validators: [] },
        { id: '3', name: 'isActive', label: 'Active', type: 'toggle', appearance: { width: 'full' }, validators: [] },
        { id: '4', name: 'tags', label: 'Tags', type: 'multiselect', appearance: { width: 'full' }, validators: [] }
      ],
      settings: {
        submitButtonText: 'Submit',
        showResetButton: false,
        layout: 'vertical',
        theme: 'default'
      }
    };

    const model = service.generateModelTs(config);
    expect(model.name).toBe('generated-form.model.ts');
    expect(model.content).toContain('export interface UserProfileModel');
    expect(model.content).toContain('bio?: string;');
    expect(model.content).toContain('followers?: number;');
    expect(model.content).toContain('isActive?: boolean;');
    expect(model.content).toContain('tags?: string[];');
  });
});
