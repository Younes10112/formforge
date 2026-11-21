import { Injectable } from '@angular/core';
import { CodeGenDiagnostics } from '../models/code-generation.model';
import { FormConfiguration, FormField } from '../models/form-config.model';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  private readonly validIdentifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

  validateFormConfiguration(config: unknown): { valid: boolean; errors: string[]; parsed?: FormConfiguration } {
    const errors: string[] = [];

    if (!config || typeof config !== 'object') {
      return { valid: false, errors: ['Configuration must be a valid JSON object'] };
    }

    const c = config as Record<string, unknown>;

    if (!c['id'] || typeof c['id'] !== 'string') {
      errors.push('Form "id" is required and must be a string');
    }

    if (!c['title'] || typeof c['title'] !== 'string') {
      errors.push('Form "title" is required and must be a string');
    }

    if (!Array.isArray(c['fields'])) {
      errors.push('Form "fields" must be an array');
      return { valid: false, errors };
    }

    const fields = c['fields'] as FormField[];
    const fieldNames = new Set<string>();
    const fieldIds = new Set<string>();

    fields.forEach((field, index) => {
      if (!field.id) {
        errors.push(`Field at index ${index} is missing an "id"`);
      } else if (fieldIds.has(field.id)) {
        errors.push(`Duplicate field id detected: "${field.id}"`);
      } else {
        fieldIds.add(field.id);
      }

      if (!field.name) {
        errors.push(`Field "${field.id || index}" is missing a "name"`);
      } else {
        if (!this.validIdentifierRegex.test(field.name)) {
          errors.push(`Field name "${field.name}" is not a valid TypeScript variable identifier`);
        }
        if (fieldNames.has(field.name)) {
          errors.push(`Duplicate field name detected: "${field.name}". Each field must have a unique name.`);
        }
        fieldNames.add(field.name);
      }

      if (!field.type) {
        errors.push(`Field "${field.name || index}" is missing a "type"`);
      }
    });

    // Detect circular dependencies in conditional rules
    const cycleErrors = this.detectCircularConditions(fields);
    errors.push(...cycleErrors);

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Default structure normalization
    const normalized: FormConfiguration = {
      id: String(c['id'] || 'untitled-form'),
      title: String(c['title'] || 'Untitled Form'),
      description: typeof c['description'] === 'string' ? c['description'] : '',
      version: typeof c['version'] === 'string' ? c['version'] : '1.0.0',
      updatedAt: new Date().toISOString(),
      sections: Array.isArray(c['sections']) ? (c['sections'] as FormConfiguration['sections']) : [],
      fields: fields.map(f => ({
        ...f,
        validators: Array.isArray(f.validators) ? f.validators : [],
        appearance: f.appearance || { width: 'full' }
      })),
      settings: (c['settings'] as FormConfiguration['settings']) || {
        submitButtonText: 'Submit',
        showResetButton: false,
        layout: 'vertical',
        theme: 'default'
      }
    };

    return { valid: true, errors: [], parsed: normalized };
  }

  getDiagnostics(config: FormConfiguration): CodeGenDiagnostics {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldNames = new Set<string>();

    if (!config.fields || config.fields.length === 0) {
      warnings.push('The form has no fields. A valid empty form will be generated.');
    }

    for (const field of config.fields) {
      if (['heading', 'paragraph', 'divider', 'section'].includes(field.type)) {
        continue;
      }

      if (!field.name || !field.name.trim()) {
        errors.push(`Field with id "${field.id}" is missing a variable name`);
      } else if (!this.validIdentifierRegex.test(field.name)) {
        errors.push(`Field name "${field.name}" is not a valid TypeScript variable name`);
      } else if (fieldNames.has(field.name)) {
        errors.push(`Duplicate field name "${field.name}" detected`);
      } else {
        fieldNames.add(field.name);
      }

      if (!field.label || !field.label.trim()) {
        warnings.push(`Field "${field.name}" has an empty label`);
      }

      if (['select', 'multiselect', 'radio'].includes(field.type)) {
        if (!field.options || field.options.length === 0) {
          warnings.push(`Choice field "${field.name}" has no options configured`);
        }
      }
    }

    const cycleErrors = this.detectCircularConditions(config.fields);
    errors.push(...cycleErrors);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  detectCircularConditions(fields: FormField[]): string[] {
    const graph = new Map<string, string[]>();

    for (const field of fields) {
      if (field.conditionalLogic?.enabled && field.conditionalLogic.rules) {
        const dependencies = field.conditionalLogic.rules.map(r => r.targetField).filter(Boolean);
        graph.set(field.name, dependencies);
      }
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const circularErrors: string[] = [];

    const dfs = (node: string, path: string[]): boolean => {
      visited.add(node);
      recStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor, [...path, neighbor])) {
            return true;
          }
        } else if (recStack.has(neighbor)) {
          circularErrors.push(`Circular dependency in conditional logic: ${[...path, neighbor].join(' -> ')}`);
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, [node]);
      }
    }

    return circularErrors;
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '');
  }
}
