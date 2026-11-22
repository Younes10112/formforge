import { computed, inject, Injectable, signal } from '@angular/core';
import { STARTER_TEMPLATES } from '../constants/starter-templates';
import {
  FormConfiguration,
  FormField,
  FormSection,
  FormSettings,
  SectionAppearance
} from '../models/form-config.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  private readonly storageService = inject(StorageService);

  // Core state signals
  readonly form = signal<FormConfiguration>(this.getInitialForm());
  readonly selectedFieldId = signal<string | null>(null);
  readonly selectedSectionId = signal<string | null>(null);
  readonly isInspectorOpen = signal<boolean>(true);
  readonly canvasWidth = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  readonly activeTab = signal<'builder' | 'preview' | 'code'>('builder');
  readonly isDirty = signal<boolean>(false);
  readonly lastSaved = signal<string | null>(null);

  // History stacks for Undo / Redo
  private readonly undoStack = signal<FormConfiguration[]>([]);
  private readonly redoStack = signal<FormConfiguration[]>([]);

  // Computed signals
  readonly fields = computed(() => this.form().fields);
  readonly sections = computed(() => this.form().sections);
  readonly settings = computed(() => this.form().settings);
  readonly canUndo = computed(() => this.undoStack().length > 0);
  readonly canRedo = computed(() => this.redoStack().length > 0);

  readonly selectedField = computed(() => {
    const id = this.selectedFieldId();
    if (!id) return null;
    return this.form().fields.find(f => f.id === id) || null;
  });

  readonly selectedSection = computed(() => {
    const id = this.selectedSectionId();
    if (!id) return null;
    return this.form().sections.find(s => s.id === id) || null;
  });

  selectField(id: string | null): void {
    this.selectedFieldId.set(id);
    if (id) {
      this.selectedSectionId.set(null);
      this.isInspectorOpen.set(true);
    }
  }

  selectSection(id: string | null): void {
    this.selectedSectionId.set(id);
    if (id) {
      this.selectedFieldId.set(null);
      this.isInspectorOpen.set(true);
    }
  }

  clearSelection(): void {
    this.selectedFieldId.set(null);
    this.selectedSectionId.set(null);
  }

  constructor() {
    // Attempt to load active form from storage or default to first template
    const activeId = this.storageService.getActiveFormId();
    if (activeId) {
      const saved = this.storageService.loadForm(activeId);
      if (saved) {
        this.form.set(saved);
        this.lastSaved.set(saved.updatedAt || new Date().toISOString());
      }
    }
  }

  // --- Field Operations ---

  addField(field: FormField, index?: number, sectionId?: string): void {
    this.recordStateForUndo();

    const newField: FormField = {
      ...field,
      sectionId: sectionId ?? field.sectionId
    };

    this.form.update(current => {
      const updatedFields = [...current.fields];
      if (typeof index === 'number' && index >= 0 && index <= updatedFields.length) {
        updatedFields.splice(index, 0, newField);
      } else {
        updatedFields.push(newField);
      }
      return { ...current, fields: updatedFields };
    });

    this.selectedFieldId.set(newField.id);
    this.markDirty();
  }

  updateField(id: string, updates: Partial<FormField>): void {
    this.recordStateForUndo();

    this.form.update(current => ({
      ...current,
      fields: current.fields.map(f => (f.id === id ? { ...f, ...updates } : f))
    }));

    this.markDirty();
  }

  removeField(id: string): void {
    this.recordStateForUndo();

    this.form.update(current => ({
      ...current,
      fields: current.fields.filter(f => f.id !== id)
    }));

    if (this.selectedFieldId() === id) {
      this.selectedFieldId.set(null);
    }

    this.markDirty();
  }

  duplicateField(id: string): void {
    const field = this.form().fields.find(f => f.id === id);
    if (!field) return;

    this.recordStateForUndo();

    const newId = `field_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const baseName = field.name.replace(/_copy\d*$/, '');
    let counter = 1;
    let newName = `${baseName}_copy`;
    while (this.form().fields.some(f => f.name === newName)) {
      counter++;
      newName = `${baseName}_copy${counter}`;
    }

    const duplicated: FormField = {
      ...JSON.parse(JSON.stringify(field)),
      id: newId,
      name: newName,
      label: `${field.label} (Copy)`
    };

    const index = this.form().fields.findIndex(f => f.id === id);
    this.addField(duplicated, index + 1, field.sectionId);
  }

  reorderFields(previousIndex: number, currentIndex: number): void {
    if (previousIndex === currentIndex) return;

    this.recordStateForUndo();

    this.form.update(current => {
      const updated = [...current.fields];
      const [moved] = updated.splice(previousIndex, 1);
      updated.splice(currentIndex, 0, moved);
      return { ...current, fields: updated };
    });

    this.markDirty();
  }

  moveFieldToSection(fieldId: string, targetSectionId?: string, newIndex?: number): void {
    this.recordStateForUndo();

    this.form.update(current => {
      const fieldIndex = current.fields.findIndex(f => f.id === fieldId);
      if (fieldIndex === -1) return current;

      const field = { ...current.fields[fieldIndex], sectionId: targetSectionId };
      const remaining = current.fields.filter(f => f.id !== fieldId);

      if (typeof newIndex === 'number' && newIndex >= 0) {
        remaining.splice(newIndex, 0, field);
      } else {
        remaining.push(field);
      }

      return { ...current, fields: remaining };
    });

    this.markDirty();
  }

  // --- Section Operations ---

  addSection(title: string = 'New Section', description?: string): FormSection {
    this.recordStateForUndo();

    const newSection: FormSection = {
      id: `sec_${Date.now().toString(36)}`,
      title,
      description: description || 'Grouped fields container',
      collapsible: true,
      collapsed: false,
      order: this.form().sections.length,
      appearance: {
        shadow: 'xs',
        borderColor: 'default',
        borderWidth: 'thin',
        borderRadius: 'xl',
        background: 'default',
        headerStyle: 'default',
        padding: 'normal',
        margin: 'normal'
      }
    };

    this.form.update(current => ({
      ...current,
      sections: [...current.sections, newSection]
    }));

    this.markDirty();
    this.selectSection(newSection.id);
    return newSection;
  }

  updateSection(id: string, updates: Partial<FormSection>): void {
    this.recordStateForUndo();

    this.form.update(current => ({
      ...current,
      sections: current.sections.map(s => (s.id === id ? { ...s, ...updates } : s))
    }));

    this.markDirty();
  }

  updateSectionAppearance(id: string, appearanceUpdates: Partial<SectionAppearance>): void {
    this.recordStateForUndo();

    this.form.update(current => ({
      ...current,
      sections: current.sections.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          appearance: {
            ...(s.appearance || {}),
            ...appearanceUpdates
          }
        };
      })
    }));

    this.markDirty();
  }

  toggleSectionCollapse(id: string): void {
    this.form.update(current => ({
      ...current,
      sections: current.sections.map(s => (s.id === id ? { ...s, collapsed: !s.collapsed } : s))
    }));
  }

  moveSection(id: string, direction: 'up' | 'down'): void {
    const sections = [...this.form().sections];
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    this.recordStateForUndo();
    const [moved] = sections.splice(index, 1);
    sections.splice(targetIndex, 0, moved);

    sections.forEach((s, idx) => (s.order = idx));

    this.form.update(current => ({
      ...current,
      sections
    }));

    this.markDirty();
  }

  removeSection(id: string): void {
    this.recordStateForUndo();

    if (this.selectedSectionId() === id) {
      this.selectedSectionId.set(null);
    }

    this.form.update(current => ({
      ...current,
      sections: current.sections.filter(s => s.id !== id),
      // Move any fields inside that section to root
      fields: current.fields.map(f => (f.sectionId === id ? { ...f, sectionId: undefined } : f))
    }));

    this.markDirty();
  }

  getSectionClasses(section: FormSection, isSelected: boolean = false): string {
    const app = section.appearance || {};

    // Shadow
    let shadowClass = 'shadow-xs';
    switch (app.shadow) {
      case 'none': shadowClass = 'shadow-none'; break;
      case 'xs': shadowClass = 'shadow-xs'; break;
      case 'sm': shadowClass = 'shadow-sm'; break;
      case 'md': shadowClass = 'shadow-md'; break;
      case 'lg': shadowClass = 'shadow-lg'; break;
      case 'xl': shadowClass = 'shadow-xl'; break;
    }

    // Border color
    let borderColClass = 'border-gray-200/90 dark:border-gray-800';
    switch (app.borderColor) {
      case 'slate': borderColClass = 'border-slate-300 dark:border-slate-700'; break;
      case 'blue': borderColClass = 'border-blue-300 dark:border-blue-800'; break;
      case 'indigo': borderColClass = 'border-indigo-300 dark:border-indigo-800'; break;
      case 'emerald': borderColClass = 'border-emerald-300 dark:border-emerald-800'; break;
      case 'amber': borderColClass = 'border-amber-300 dark:border-amber-800'; break;
      case 'rose': borderColClass = 'border-rose-300 dark:border-rose-800'; break;
      case 'transparent': borderColClass = 'border-transparent'; break;
      case 'default':
      default:
        borderColClass = 'border-gray-200/90 dark:border-gray-800'; break;
    }

    // Border width
    let borderWidthClass = 'border';
    switch (app.borderWidth) {
      case 'none': borderWidthClass = 'border-0'; break;
      case 'thick': borderWidthClass = 'border-2'; break;
      case 'thin':
      default:
        borderWidthClass = 'border'; break;
    }

    // Border radius
    let radiusClass = 'rounded-2xl';
    switch (app.borderRadius) {
      case 'none': radiusClass = 'rounded-none'; break;
      case 'md': radiusClass = 'rounded-lg'; break;
      case 'lg': radiusClass = 'rounded-xl'; break;
      case 'xl': radiusClass = 'rounded-2xl'; break;
      case '2xl': radiusClass = 'rounded-3xl'; break;
      case '3xl': radiusClass = 'rounded-[2rem]'; break;
      default: radiusClass = 'rounded-2xl'; break;
    }

    // Background
    let bgClass = 'bg-white/95 dark:bg-gray-900/95';
    switch (app.background) {
      case 'white': bgClass = 'bg-white dark:bg-gray-900'; break;
      case 'slate': bgClass = 'bg-slate-50/80 dark:bg-slate-900/60'; break;
      case 'tinted': bgClass = 'bg-blue-50/40 dark:bg-blue-950/20'; break;
      case 'transparent': bgClass = 'bg-transparent'; break;
      case 'default':
      default:
        bgClass = 'bg-white/95 dark:bg-gray-900/95'; break;
    }

    // Padding
    let padClass = 'p-5 sm:p-6';
    switch (app.padding) {
      case 'none': padClass = 'p-0'; break;
      case 'compact': padClass = 'p-3 sm:p-4'; break;
      case 'comfortable': padClass = 'p-6 sm:p-8'; break;
      case 'relaxed':
      case 'spacious': padClass = 'p-8 sm:p-10'; break;
      case 'normal':
      default:
        padClass = 'p-5 sm:p-6'; break;
    }

    // Margin (bottom spacing between section cards)
    let marginClass = 'mb-6';
    switch (app.margin) {
      case 'none': marginClass = 'mb-0'; break;
      case 'compact': marginClass = 'mb-3'; break;
      case 'relaxed': marginClass = 'mb-8 sm:mb-10'; break;
      case 'spacious': marginClass = 'mb-12'; break;
      case 'normal':
      default:
        marginClass = 'mb-5 sm:mb-6'; break;
    }

    const selectedClass = isSelected
      ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-950 !border-blue-500 shadow-blue-500/10'
      : 'hover:border-gray-300 dark:hover:border-gray-700';

    return `${borderWidthClass} ${borderColClass} ${radiusClass} ${bgClass} ${shadowClass} ${padClass} ${marginClass} ${selectedClass} transition-all`;
  }

  getMainCardPaddingClass(): string {
    const p = this.form().settings.padding;
    switch (p) {
      case 'none': return 'p-0';
      case 'compact': return 'p-4 sm:p-6';
      case 'normal': return 'p-6 sm:p-8';
      case 'comfortable': return 'p-7 sm:p-10';
      case 'relaxed':
      case 'spacious': return 'p-10 sm:p-14';
      default: return 'p-6 sm:p-9';
    }
  }

  getMainCardMarginClass(): string {
    const m = this.form().settings.margin;
    switch (m) {
      case 'none': return 'my-0';
      case 'compact': return 'my-2 sm:my-3';
      case 'normal': return 'my-4 sm:my-6';
      case 'relaxed': return 'my-8 sm:my-10';
      case 'spacious': return 'my-12 sm:my-16';
      default: return 'my-4 sm:my-6';
    }
  }

  // --- Form Level Settings ---

  updateFormMeta(title: string, description?: string): void {
    this.recordStateForUndo();
    this.form.update(current => ({
      ...current,
      title,
      description: description ?? current.description
    }));
    this.markDirty();
  }

  updateFormSettings(settings: Partial<FormSettings>): void {
    this.recordStateForUndo();
    this.form.update(current => ({
      ...current,
      settings: { ...current.settings, ...settings }
    }));
    this.markDirty();
  }

  // selectField(id: string | null): void {
  //   this.selectedFieldId.set(id);
  //   if (id !== null) {
  //     this.isInspectorOpen.set(true);
  //   }
  // }

  toggleInspector(): void {
    this.isInspectorOpen.update(v => !v);
  }

  setInspectorOpen(open: boolean): void {
    this.isInspectorOpen.set(open);
  }

  setCanvasWidth(width: 'desktop' | 'tablet' | 'mobile'): void {
    this.canvasWidth.set(width);
  }

  setActiveTab(tab: 'builder' | 'preview' | 'code'): void {
    this.activeTab.set(tab);
  }

  // --- Undo / Redo ---

  undo(): void {
    const history = this.undoStack();
    if (history.length === 0) return;

    const previous = history[history.length - 1];
    const newUndo = history.slice(0, -1);

    this.redoStack.update(r => [...r, JSON.parse(JSON.stringify(this.form()))]);
    this.undoStack.set(newUndo);
    this.form.set(JSON.parse(JSON.stringify(previous)));
    this.markDirty();
  }

  redo(): void {
    const future = this.redoStack();
    if (future.length === 0) return;

    const next = future[future.length - 1];
    const newRedo = future.slice(0, -1);

    this.undoStack.update(u => [...u, JSON.parse(JSON.stringify(this.form()))]);
    this.redoStack.set(newRedo);
    this.form.set(JSON.parse(JSON.stringify(next)));
    this.markDirty();
  }

  // --- Persistence & Management ---

  setForm(config: FormConfiguration, recordHistory = true): void {
    if (recordHistory) {
      this.recordStateForUndo();
    }
    this.form.set(JSON.parse(JSON.stringify(config)));
    this.selectedFieldId.set(null);
    this.markDirty();
  }

  saveCurrentForm(): void {
    const current = this.form();
    this.storageService.saveForm(current);
    this.isDirty.set(false);
    this.lastSaved.set(new Date().toISOString());
  }

  loadTemplate(templateId: string): void {
    const template = STARTER_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    this.setForm(template);
    this.saveCurrentForm();
  }

  resetForm(): void {
    const emptyForm: FormConfiguration = {
      id: `form_${Date.now().toString(36)}`,
      title: 'Untitled Form',
      description: 'Create dynamic forms with FormForge',
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      sections: [],
      fields: [],
      settings: {
        submitButtonText: 'Submit Form',
        showResetButton: true,
        resetButtonText: 'Reset',
        layout: 'vertical',
        theme: 'modern'
      }
    };
    this.setForm(emptyForm);
    this.selectedSectionId.set(null);
    this.selectedFieldId.set(null);
    this.isDirty.set(false);
  }

  private markDirty(): void {
    this.isDirty.set(true);
  }

  private recordStateForUndo(): void {
    const snapshot = JSON.parse(JSON.stringify(this.form())) as FormConfiguration;
    this.undoStack.update(stack => [...stack.slice(-25), snapshot]);
    this.redoStack.set([]);
  }

  private getInitialForm(): FormConfiguration {
    return JSON.parse(JSON.stringify(STARTER_TEMPLATES[0]));
  }
}
