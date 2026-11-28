import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField, FormSection } from '../../core/models/form-config.model';
import { DynamicFormService } from '../../core/services/dynamic-form.service';
import { FormStateService } from '../../core/services/form-state.service';
import { ToastService } from '../../core/services/toast.service';
import { DynamicFieldComponent } from '../../shared/components/dynamic-field/dynamic-field.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-preview',
  imports: [ReactiveFormsModule, DynamicFieldComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-1 flex flex-col h-full min-w-0 overflow-hidden'
  },
  template: `
    <div class="flex-1 flex flex-col h-full overflow-hidden bg-gray-100/80 dark:bg-gray-950">
      <!-- Preview Subheader Controls -->
      <div class="h-12 px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between shrink-0 select-none">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <app-icon name="play" [size]="14" class="text-blue-600" />
            <span>Interactive Live Simulation</span>
          </div>
          <span class="text-xs text-gray-400">•</span>
          <span
            class="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold"
            [class]="formGroup().valid ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200'"
          >
            STATUS: {{ formGroup().valid ? 'VALID' : 'INVALID' }}
          </span>
        </div>

        <!-- Viewport Switcher -->
        <div class="flex items-center rounded-lg border border-gray-200 dark:border-gray-800 p-0.5 bg-gray-100/70 dark:bg-gray-800/60">
          <button
            type="button"
            (click)="previewWidth.set('desktop')"
            [class]="previewWidth() === 'desktop' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
            class="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all"
          >
            <app-icon name="monitor" [size]="13" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            (click)="previewWidth.set('tablet')"
            [class]="previewWidth() === 'tablet' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
            class="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all"
          >
            <app-icon name="tablet" [size]="13" />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            (click)="previewWidth.set('mobile')"
            [class]="previewWidth() === 'mobile' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
            class="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all"
          >
            <app-icon name="smartphone" [size]="13" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      <!-- Preview Split Area: Form Viewport + Submission Inspector -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Main Form Device Frame -->
        <div class="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center items-start">

          <div
            class="w-full transition-all duration-200"
            [class]="previewContainerClass()"
          >
            <div
              class="rounded-2xl border border-gray-200/90 dark:border-gray-800 bg-white shadow-xl dark:bg-gray-900 transition-all"
              [class]="formState.getMainCardPaddingClass() + ' ' + formState.getMainCardMarginClass()"
            >
              <!-- Form Header -->
              <div class="mb-7 pb-5 border-b border-gray-100 dark:border-gray-800">
                <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {{ formState.form().title }}
                </h1>
                @if (formState.form().description) {
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ formState.form().description }}
                  </p>
                }
              </div>

              <!-- Interactive Reactive Form Body -->
              <form (ngSubmit)="onSubmit()" class="space-y-6">
                @if (formState.sections().length > 0) {
                  <!-- Render Section Cards -->
                  @for (section of formState.sections(); track section.id) {
                    <div [class]="formState.getSectionClasses(section, false)">
                      <!-- Section Card Header -->
                      <div class="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800">
                        <div class="flex items-center gap-2.5">
                          @if (section.collapsible) {
                            <button
                              type="button"
                              (click)="toggleSectionCollapse(section.id)"
                              class="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              title="Toggle Collapse"
                            >
                              <app-icon [name]="isSectionCollapsed(section) ? 'chevron-right' : 'chevron-down'" [size]="14" />
                            </button>
                          }
                          <div class="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
                            <app-icon name="layout" [size]="13" />
                          </div>
                          <div>
                            <h2 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{{ section.title }}</h2>
                            @if (section.description) {
                              <p class="text-xs text-gray-500 dark:text-gray-400">{{ section.description }}</p>
                            }
                          </div>
                        </div>
                      </div>

                      @if (!isSectionCollapsed(section)) {
                        <div class="grid grid-cols-12 gap-x-5 gap-y-4">
                          @for (field of getFieldsForSection(section.id); track field.id) {
                            <app-dynamic-field
                              [field]="field"
                              [formGroup]="formGroup()"
                              [visibilityMap]="visibilityMap()"
                              [requiredMap]="requiredMap()"
                              [formSettings]="formState.settings()"
                            />
                          }
                          @if (getFieldsForSection(section.id).length === 0) {
                            <div class="col-span-12 py-4 text-center text-xs text-gray-400 font-medium">
                              No fields in this section
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }

                  <!-- Unsectioned fields (if any) -->
                  @if (getRootFields().length > 0) {
                    <div class="grid grid-cols-12 gap-x-5 gap-y-4 pt-2">
                      @for (field of getRootFields(); track field.id) {
                        <app-dynamic-field
                          [field]="field"
                          [formGroup]="formGroup()"
                          [visibilityMap]="visibilityMap()"
                          [requiredMap]="requiredMap()"
                          [formSettings]="formState.settings()"
                        />
                      }
                    </div>
                  }
                } @else {
                  <!-- Standard Flat Form without sections -->
                  <div class="grid grid-cols-12 gap-x-5 gap-y-4">
                    @for (field of formState.fields(); track field.id) {
                      <app-dynamic-field
                        [field]="field"
                        [formGroup]="formGroup()"
                        [visibilityMap]="visibilityMap()"
                        [requiredMap]="requiredMap()"
                        [formSettings]="formState.settings()"
                      />
                    }
                  </div>
                }

                @if (formState.fields().length === 0) {
                  <div class="col-span-12 py-12 text-center text-gray-400 text-sm">
                    This form does not contain any fields yet.
                  </div>
                }

                <!-- Form Submit and Reset Buttons -->
                <div class="col-span-12 mt-6 flex items-center justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
                  @if (formState.settings().showResetButton) {
                    <button
                      type="button"
                      (click)="onReset()"
                      class="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      {{ formState.settings().resetButtonText || 'Reset' }}
                    </button>
                  }

                  <button
                    type="submit"
                    class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-blue-500/20"
                  >
                    {{ formState.settings().submitButtonText || 'Submit' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Right Side: Submission Inspector & State -->
        <aside class="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shrink-0 select-none hidden lg:flex">
          <div class="p-3 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-xs font-bold uppercase tracking-wider text-gray-400">Submission Inspector</h3>
          </div>

          <div class="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <!-- Last Submission Payload -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-semibold text-gray-700 dark:text-gray-300">Submitted JSON Payload</span>
                @if (lastSubmission()) {
                  <span class="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">Submitted</span>
                }
              </div>
              <pre class="w-full p-3 rounded-xl bg-gray-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">{{ submittedJson() }}</pre>
            </div>

            <!-- Current Realtime Value -->
            <div>
              <span class="font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">Live Raw Form Value</span>
              <pre class="w-full p-3 rounded-xl bg-gray-900 text-blue-300 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">{{ liveJson() }}</pre>
            </div>

            <!-- Form Validation Status Details -->
            <div class="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-1.5">
              <div class="flex justify-between">
                <span class="text-gray-500">Touched:</span>
                <span class="font-mono font-medium text-gray-800 dark:text-gray-200">{{ formGroup().touched ? 'Yes' : 'No' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Dirty:</span>
                <span class="font-mono font-medium text-gray-800 dark:text-gray-200">{{ formGroup().dirty ? 'Yes' : 'No' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Pristine:</span>
                <span class="font-mono font-medium text-gray-800 dark:text-gray-200">{{ formGroup().pristine ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `
})
export class PreviewComponent {
  readonly formState = inject(FormStateService);
  private readonly dynamicFormService = inject(DynamicFormService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  readonly previewWidth = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  readonly formGroup = signal<FormGroup>(this.fb.group({}));
  readonly visibilityMap = signal<Record<string, boolean>>({});
  readonly requiredMap = signal<Record<string, boolean>>({});
  readonly lastSubmission = signal<unknown | null>(null);
  readonly liveFormValue = signal<unknown>({});

  readonly previewContainerClass = computed(() => {
    switch (this.previewWidth()) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'max-w-[820px]';
        // return 'max-w-[1000px]';
    }
  });

  readonly submittedJson = computed(() => {
    const sub = this.lastSubmission();
    return sub ? JSON.stringify(sub, null, 2) : '// No submission yet.\n// Click "Submit" to test payload.';
  });

  readonly liveJson = computed(() => {
    return JSON.stringify(this.liveFormValue(), null, 2);
  });

  readonly collapsedSections = signal<Record<string, boolean>>({});

  toggleSectionCollapse(sectionId: string): void {
    this.collapsedSections.update(map => ({
      ...map,
      [sectionId]: !this.isSectionCollapsedById(sectionId)
    }));
  }

  isSectionCollapsed(section: FormSection): boolean {
    return this.isSectionCollapsedById(section.id, section.collapsed);
  }

  private isSectionCollapsedById(sectionId: string, defaultVal?: boolean): boolean {
    const val = this.collapsedSections()[sectionId];
    if (val !== undefined) return val;
    return Boolean(defaultVal);
  }

  getRootFields(): FormField[] {
    return this.formState.fields().filter(f => !f.sectionId);
  }

  getFieldsForSection(sectionId: string): FormField[] {
    return this.formState.fields().filter(f => f.sectionId === sectionId);
  }

  constructor() {
    effect(() => {
      // Rebuild form group when form configuration changes
      const config = this.formState.form();
      const group = this.dynamicFormService.buildFormGroup(config);
      this.formGroup.set(group);
      this.liveFormValue.set(group.getRawValue());

      // Evaluate initial conditional logic
      const cond = this.dynamicFormService.evaluateConditionalLogic(group, config.fields);
      this.visibilityMap.set(cond.visibilityMap);
      this.requiredMap.set(cond.requiredMap);

      // Listen to reactive value changes
      const sub = group.valueChanges.subscribe(() => {
        this.liveFormValue.set(group.getRawValue());
        const updatedCond = this.dynamicFormService.evaluateConditionalLogic(group, this.formState.fields());
        this.visibilityMap.set(updatedCond.visibilityMap);
        this.requiredMap.set(updatedCond.requiredMap);
      });

      return () => sub.unsubscribe();
    });
  }

  onSubmit(): void {
    const group = this.formGroup();
    if (group.invalid) {
      group.markAllAsTouched();
      this.toast.error('Form contains validation errors. Please fix highlighted fields.', 'Invalid Submission');
      return;
    }

    const payload = group.getRawValue();
    this.lastSubmission.set(payload);
    this.toast.success('Form simulated submission successful!', 'Success');
  }

  onReset(): void {
    this.formGroup().reset();
    this.lastSubmission.set(null);
    this.toast.info('Form cleared');
  }
}
