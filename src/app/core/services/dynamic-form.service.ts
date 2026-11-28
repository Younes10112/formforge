import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import {
  ConditionalLogic,
  ConditionalRule,
  FieldValidation,
  FormConfiguration,
  FormField
} from '../models/form-config.model';

export interface FormInstanceState {
  formGroup: FormGroup;
  visibilityMap: Record<string, boolean>;
  disabledMap: Record<string, boolean>;
  requiredMap: Record<string, boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {
  private readonly fb = inject(FormBuilder);

  buildFormGroup(config: FormConfiguration): FormGroup {
    const group: Record<string, [{ value: unknown; disabled: boolean }, ValidatorFn[]]> = {};

    for (const field of config.fields) {
      // Layout fields do not create form controls
      if (['heading', 'paragraph', 'divider', 'section'].includes(field.type)) {
        continue;
      }

      const initialValue = this.resolveDefaultValue(field);
      const validators = this.buildValidators(field.validators, field.required);

      group[field.name] = [
        { value: initialValue, disabled: !!field.disabled },
        validators
      ];
    }

    return this.fb.group(group);
  }

  buildValidators(validations: FieldValidation[], isRequired?: boolean): ValidatorFn[] {
    const fns: ValidatorFn[] = [];

    if (isRequired) {
      fns.push(Validators.required);
    }

    for (const v of validations) {
      switch (v.type) {
        case 'required':
          if (!fns.includes(Validators.required)) {
            fns.push(Validators.required);
          }
          break;
        case 'email':
          fns.push(Validators.email);
          break;
        case 'minLength':
          if (typeof v.value === 'number') {
            fns.push(Validators.minLength(v.value));
          }
          break;
        case 'maxLength':
          if (typeof v.value === 'number') {
            fns.push(Validators.maxLength(v.value));
          }
          break;
        case 'min':
          if (typeof v.value === 'number') {
            fns.push(Validators.min(v.value));
          }
          break;
        case 'max':
          if (typeof v.value === 'number') {
            fns.push(Validators.max(v.value));
          }
          break;
        case 'pattern':
          if (typeof v.value === 'string' && v.value) {
            try {
              fns.push(Validators.pattern(new RegExp(v.value)));
            } catch (e) {
              console.warn(`Invalid regex pattern: ${v.value}`, e);
            }
          }
          break;
      }
    }

    return fns;
  }

  resolveDefaultValue(field: FormField): unknown {
    if (field.defaultValue !== undefined && field.defaultValue !== null) {
      return field.defaultValue;
    }
    switch (field.type) {
      case 'checkbox':
      case 'toggle':
        return false;
      case 'multiselect':
        return [];
      case 'number':
      case 'range':
      case 'rating':
        return field.min ?? 0;
      default:
        return '';
    }
  }

  evaluateConditionalLogic(
    formGroup: FormGroup,
    fields: FormField[]
  ): {
    visibilityMap: Record<string, boolean>;
    disabledMap: Record<string, boolean>;
    requiredMap: Record<string, boolean>;
  } {
    const visibilityMap: Record<string, boolean> = {};
    const disabledMap: Record<string, boolean> = {};
    const requiredMap: Record<string, boolean> = {};

    const rawValues = formGroup.getRawValue();

    for (const field of fields) {
      // Default states
      let isVisible = !field.hidden;
      let isDisabled = !!field.disabled;
      let isRequired = !!field.required;

      if (field.conditionalLogic?.enabled && field.conditionalLogic.rules?.length) {
        const isMatch = this.evaluateRules(field.conditionalLogic, rawValues);

        switch (field.conditionalLogic.action) {
          case 'show':
            isVisible = isMatch;
            break;
          case 'hide':
            isVisible = !isMatch;
            break;
          case 'enable':
            isDisabled = !isMatch;
            break;
          case 'disable':
            isDisabled = isMatch;
            break;
          case 'require':
            isRequired = isMatch;
            break;
        }
      }

      visibilityMap[field.name] = isVisible;
      disabledMap[field.name] = isDisabled;
      requiredMap[field.name] = isRequired;

      // Update control disabled status if control exists
      const ctrl = formGroup.get(field.name);
      if (ctrl) {
        if (isDisabled && ctrl.enabled) {
          ctrl.disable({ emitEvent: false });
        } else if (!isDisabled && ctrl.disabled) {
          ctrl.enable({ emitEvent: false });
        }
      }
    }

    return { visibilityMap, disabledMap, requiredMap };
  }

  private evaluateRules(logic: ConditionalLogic, rawValues: Record<string, unknown>): boolean {
    const { rules, matchType } = logic;
    if (!rules || rules.length === 0) return true;

    if (matchType === 'AND') {
      return rules.every(rule => this.checkRule(rule, rawValues[rule.targetField]));
    } else {
      return rules.some(rule => this.checkRule(rule, rawValues[rule.targetField]));
    }
  }

  private checkRule(rule: ConditionalRule, actualValue: unknown): boolean {
    const expected = rule.value;

    switch (rule.operator) {
      case 'equals':
        return String(actualValue ?? '').toLowerCase() === String(expected ?? '').toLowerCase();

      case 'notEquals':
        return String(actualValue ?? '').toLowerCase() !== String(expected ?? '').toLowerCase();

      case 'contains':
        if (Array.isArray(actualValue)) {
          return actualValue.includes(expected);
        }
        return String(actualValue ?? '')
          .toLowerCase()
          .includes(String(expected ?? '').toLowerCase());

      case 'notContains':
        if (Array.isArray(actualValue)) {
          return !actualValue.includes(expected);
        }
        return !String(actualValue ?? '')
          .toLowerCase()
          .includes(String(expected ?? '').toLowerCase());

      case 'greaterThan':
        return Number(actualValue) > Number(expected);

      case 'lessThan':
        return Number(actualValue) < Number(expected);

      case 'isEmpty':
        if (actualValue === null || actualValue === undefined || actualValue === '') return true;
        if (Array.isArray(actualValue) && actualValue.length === 0) return true;
        return false;

      case 'isNotEmpty':
        if (actualValue === null || actualValue === undefined || actualValue === '') return false;
        if (Array.isArray(actualValue) && actualValue.length === 0) return false;
        return true;

      default:
        return true;
    }
  }

  getErrorMessage(field: FormField, errorKey: string): string {
    const custom = field.validators.find(v => {
      if (v.type === errorKey) return true;
      if (errorKey === 'minlength' && v.type === 'minLength') return true;
      if (errorKey === 'maxlength' && v.type === 'maxLength') return true;
      return false;
    });

    if (custom && custom.message) {
      return custom.message;
    }

    switch (errorKey) {
      case 'required':
        return `${field.label || 'This field'} is required.`;
      case 'email':
        return 'Please enter a valid email address.';
      case 'minlength':
      case 'minLength':
        return `${field.label || 'This field'} does not meet the minimum length.`;
      case 'maxlength':
      case 'maxLength':
        return `${field.label || 'This field'} exceeds the maximum length.`;
      case 'min':
        return `Value cannot be lower than the minimum allowed.`;
      case 'max':
        return `Value cannot exceed the maximum allowed.`;
      case 'pattern':
        return `${field.label || 'Value'} does not match the required format.`;
      default:
        return 'Invalid value.';
    }
  }
}
