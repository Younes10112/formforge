import { Injectable } from '@angular/core';
import { STARTER_TEMPLATES } from '../constants/starter-templates';
import { FormConfiguration } from '../models/form-config.model';

export interface FormMetadata {
  id: string;
  title: string;
  description?: string;
  fieldCount: number;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly storagePrefix = 'formforge_form_';
  private readonly indexKey = 'formforge_index';
  private readonly activeFormKey = 'formforge_active_id';

  listForms(): FormMetadata[] {
    try {
      const raw = localStorage.getItem(this.indexKey);
      if (!raw) {
        return this.initializeWithDefaultTemplates();
      }
      return JSON.parse(raw) as FormMetadata[];
    } catch {
      return this.initializeWithDefaultTemplates();
    }
  }

  loadForm(id: string): FormConfiguration | null {
    try {
      const raw = localStorage.getItem(this.storagePrefix + id);
      if (raw) {
        return JSON.parse(raw) as FormConfiguration;
      }
      // Check starter templates
      const template = STARTER_TEMPLATES.find(t => t.id === id);
      if (template) {
        this.saveForm(template);
        return template;
      }
      return null;
    } catch (err) {
      console.error('Failed to load form from storage', err);
      return null;
    }
  }

  saveForm(config: FormConfiguration): void {
    try {
      const now = new Date().toISOString();
      const updatedConfig: FormConfiguration = {
        ...config,
        updatedAt: now
      };

      localStorage.setItem(this.storagePrefix + config.id, JSON.stringify(updatedConfig));
      localStorage.setItem(this.activeFormKey, config.id);

      // Update index
      const list = this.listForms().filter(f => f.id !== config.id);
      list.unshift({
        id: config.id,
        title: config.title,
        description: config.description,
        fieldCount: config.fields.length,
        updatedAt: now
      });

      localStorage.setItem(this.indexKey, JSON.stringify(list));
    } catch (err) {
      console.error('Failed to save form to storage', err);
    }
  }

  deleteForm(id: string): void {
    try {
      localStorage.removeItem(this.storagePrefix + id);
      const list = this.listForms().filter(f => f.id !== id);
      localStorage.setItem(this.indexKey, JSON.stringify(list));
      if (localStorage.getItem(this.activeFormKey) === id) {
        localStorage.removeItem(this.activeFormKey);
      }
    } catch (err) {
      console.error('Failed to delete form', err);
    }
  }

  duplicateForm(id: string): FormConfiguration | null {
    const original = this.loadForm(id);
    if (!original) return null;

    const newId = `${original.id}-copy-${Date.now().toString(36)}`;
    const copy: FormConfiguration = {
      ...original,
      id: newId,
      title: `${original.title} (Copy)`,
      updatedAt: new Date().toISOString(),
      fields: original.fields.map(f => ({
        ...f,
        id: `field_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
      }))
    };

    this.saveForm(copy);
    return copy;
  }

  getActiveFormId(): string | null {
    try {
      return localStorage.getItem(this.activeFormKey);
    } catch {
      return null;
    }
  }

  getStarterTemplates(): FormConfiguration[] {
    return STARTER_TEMPLATES;
  }

  private initializeWithDefaultTemplates(): FormMetadata[] {
    const list: FormMetadata[] = [];
    for (const template of STARTER_TEMPLATES) {
      try {
        localStorage.setItem(this.storagePrefix + template.id, JSON.stringify(template));
        list.push({
          id: template.id,
          title: template.title,
          description: template.description,
          fieldCount: template.fields.length,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.error('Failed initializing template', e);
      }
    }
    try {
      localStorage.setItem(this.indexKey, JSON.stringify(list));
    } catch {}
    return list;
  }
}
