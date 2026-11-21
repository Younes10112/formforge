import { TestBed } from '@angular/core/testing';
import { FormField } from '../models/form-config.model';
import { FormStateService } from './form-state.service';

describe('FormStateService', () => {
  let service: FormStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormStateService);
    // Reset to empty for clean testing
    service.resetForm();
  });

  it('should add fields and select them', () => {
    const field: FormField = {
      id: 'field_test_1',
      name: 'testName',
      label: 'Test Name',
      type: 'text',
      appearance: { width: 'full' },
      validators: []
    };

    service.addField(field);
    expect(service.fields().length).toBe(1);
    expect(service.selectedFieldId()).toBe('field_test_1');
    expect(service.selectedField()?.name).toBe('testName');
  });

  it('should update field properties and record history for undo', () => {
    const field: FormField = {
      id: 'field_test_2',
      name: 'initial',
      label: 'Initial Label',
      type: 'text',
      appearance: { width: 'full' },
      validators: []
    };

    service.addField(field);
    service.updateField('field_test_2', { label: 'Updated Label' });

    expect(service.selectedField()?.label).toBe('Updated Label');
    expect(service.canUndo()).toBe(true);

    service.undo();
    expect(service.selectedField()?.label).toBe('Initial Label');
    expect(service.canRedo()).toBe(true);

    service.redo();
    expect(service.selectedField()?.label).toBe('Updated Label');
  });

  it('should duplicate fields with unique names', () => {
    const field: FormField = {
      id: 'field_orig',
      name: 'fieldOrig',
      label: 'Original Field',
      type: 'text',
      appearance: { width: 'full' },
      validators: []
    };

    service.addField(field);
    service.duplicateField('field_orig');

    expect(service.fields().length).toBe(2);
    expect(service.fields()[1].name).toBe('fieldOrig_copy');
    expect(service.fields()[1].id).not.toBe('field_orig');
  });

  it('should remove fields', () => {
    const field: FormField = {
      id: 'field_to_remove',
      name: 'removeMe',
      label: 'Remove Me',
      type: 'text',
      appearance: { width: 'full' },
      validators: []
    };

    service.addField(field);
    expect(service.fields().length).toBe(1);

    service.removeField('field_to_remove');
    expect(service.fields().length).toBe(0);
    expect(service.selectedFieldId()).toBeNull();
  });
});
