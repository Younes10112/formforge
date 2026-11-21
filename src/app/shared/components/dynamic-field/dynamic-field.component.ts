import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormField, FormSettings } from '../../../core/models/form-config.model';
import { DynamicFormService } from '../../../core/services/dynamic-form.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-dynamic-field',
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: contents;'
  },
  template: `
    @if (isVisible()) {
      <div [class]="wrapperClasses()">
        @switch (field().type) {
          @case ('heading') {
            <div class="mt-3 mb-1">
              @switch (field().headingLevel || 2) {
                @case (1) {
                  <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ field().content || field().label }}</h1>
                }
                @case (3) {
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{{ field().content || field().label }}</h3>
                }
                @default {
                  <h2 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{{ field().content || field().label }}</h2>
                }
              }
            </div>
          }

          @case ('paragraph') {
            <div class="mb-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ field().content || field().label }}
            </div>
          }

          @case ('divider') {
            <div class="my-3">
              <hr class="border-gray-200 dark:border-gray-800" />
            </div>
          }

          @case ('section') {
            <div class="mt-5 mb-2 pt-3 border-t border-gray-200 dark:border-gray-800">
              <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ field().label }}</h3>
              @if (field().description) {
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ field().description }}</p>
              }
            </div>
          }

          @case ('textarea') {
            <div [formGroup]="formGroup()" [class]="fieldContainerClass()" [style]="fieldContainerStyle()">
              <label [for]="field().name" [class]="labelClasses()">
                <span>{{ field().label }}</span>
                @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
              </label>
              <div class="flex-1 min-w-0">
                <textarea
                  [id]="field().name"
                  [formControlName]="field().name"
                  [rows]="field().rows || 3"
                  [placeholder]="field().placeholder || ''"
                  [class]="inputClasses()"
                ></textarea>
                @if (field().description) {
                  <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{{ field().description }}</p>
                }
                @if (hasError()) {
                  <p class="mt-1 text-xs text-rose-500 font-medium">{{ errorMessage() }}</p>
                }
              </div>
            </div>
          }

          @case ('select') {
            <div [formGroup]="formGroup()" [class]="fieldContainerClass()" [style]="fieldContainerStyle()">
              <label [for]="field().name" [class]="labelClasses()">
                <span>{{ field().label }}</span>
                @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
              </label>
              <div class="flex-1 min-w-0 relative">
                <select
                  [id]="field().name"
                  [formControlName]="field().name"
                  [class]="inputClasses() + ' pr-8 appearance-none cursor-pointer'"
                >
                  <option value="" disabled>{{ field().placeholder || 'Select an option' }}</option>
                  @for (opt of field().options || []; track opt.value) {
                    <option [value]="opt.value" [disabled]="opt.disabled">{{ opt.label }}</option>
                  }
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                  <app-icon name="chevron-down" [size]="14" />
                </div>
                @if (hasError()) {
                  <p class="mt-1 text-xs text-rose-500 font-medium">{{ errorMessage() }}</p>
                }
              </div>
            </div>
          }

          @case ('multiselect') {
            <div [formGroup]="formGroup()" [class]="fieldContainerClass()" [style]="fieldContainerStyle()">
              <label class="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span>{{ field().label }}</span>
                @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
              </label>
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap gap-1.5 p-2 rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
                  @for (opt of field().options || []; track opt.value) {
                    <button
                      type="button"
                      (click)="toggleMultiSelectOption(opt.value)"
                      class="rounded-md px-2.5 py-1 text-xs font-medium transition-all"
                      [class]="isMultiSelected(opt.value) ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'"
                    >
                      {{ opt.label }}
                    </button>
                  }
                </div>
                @if (hasError()) {
                  <p class="mt-1 text-xs text-rose-500 font-medium">{{ errorMessage() }}</p>
                }
              </div>
            </div>
          }

          @case ('radio') {
            <div [formGroup]="formGroup()" [class]="fieldContainerClass()" [style]="fieldContainerStyle()">
              <label class="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span>{{ field().label }}</span>
                @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
              </label>
              <div class="flex-1 min-w-0 flex flex-wrap gap-4 py-1">
                @for (opt of field().options || []; track opt.value) {
                  <label class="flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      [value]="opt.value"
                      [formControlName]="field().name"
                      class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                    />
                    <span>{{ opt.label }}</span>
                  </label>
                }
                @if (hasError()) {
                  <p class="w-full mt-1 text-xs text-rose-500 font-medium">{{ errorMessage() }}</p>
                }
              </div>
            </div>
          }

          @case ('checkbox') {
            <div [formGroup]="formGroup()" class="py-1">
              <label class="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  [formControlName]="field().name"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
                />
                <span class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-normal">
                  {{ field().label }}
                  @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
                </span>
              </label>
              @if (hasError()) {
                <p class="mt-1 text-xs text-rose-500 font-medium">{{ errorMessage() }}</p>
              }
            </div>
          }

          @case ('toggle') {
            <div [formGroup]="formGroup()" class="flex items-center justify-between py-1.5">
              <div>
                <label [for]="field().name" class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  {{ field().label }}
                  @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
                </label>
                @if (field().description) {
                  <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ field().description }}</p>
                }
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  [id]="field().name"
                  [formControlName]="field().name"
                  class="sr-only peer"
                />
                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          }

          @case ('range') {
            <div [formGroup]="formGroup()" [class]="fieldContainerClass()" [style]="fieldContainerStyle()">
              <div class="flex justify-between items-center mb-1">
                <label [for]="field().name" [class]="labelClasses()">
                  <span>{{ field().label }}</span>
                  @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
                </label>
                <span class="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                  {{ controlValue() }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <input
                  type="range"
                  [id]="field().name"
                  [formControlName]="field().name"
                  [min]="field().min ?? 0"
                  [max]="field().max ?? 100"
                  [step]="field().step ?? 1"
                  class="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg dark:bg-gray-700"
                />
                <div class="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>{{ field().min ?? 0 }}</span>
                  <span>{{ field().max ?? 100 }}</span>
                </div>
              </div>
            </div>
          }

          @case ('rating') {
            <div [formGroup]="formGroup()" [class]="fieldContainerClass()" [style]="fieldContainerStyle()">
              <label [class]="labelClasses()">
                <span>{{ field().label }}</span>
                @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
              </label>
              <div class="flex-1 min-w-0 flex items-center gap-1">
                @for (star of starsArray(); track star) {
                  <button
                    type="button"
                    (click)="setRating(star)"
                    class="p-0.5 text-gray-300 hover:text-amber-400 transition-colors"
                    [class.text-amber-400]="controlValue() >= star"
                  >
                    <app-icon name="star" [size]="18" />
                  </button>
                }
                <span class="text-xs font-medium text-gray-500 ml-1.5">({{ controlValue() || 0 }}/{{ field().max ?? 5 }})</span>
              </div>
            </div>
          }

          @case ('color') {
            <div [formGroup]="formGroup()" [class]="fieldContainerClass()" [style]="fieldContainerStyle()">
              <label [for]="field().name" [class]="labelClasses()">
                <span>{{ field().label }}</span>
                @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
              </label>
              <div class="flex-1 min-w-0 flex items-center gap-2.5">
                <input
                  type="color"
                  [id]="field().name"
                  [formControlName]="field().name"
                  class="h-8 w-14 cursor-pointer rounded-lg border border-gray-300 bg-transparent p-0.5 dark:border-gray-700"
                />
                <span class="font-mono text-xs text-gray-600 dark:text-gray-400 uppercase">{{ controlValue() }}</span>
              </div>
            </div>
          }

          @case ('file') {
            <div [formGroup]="formGroup()" [class]="fieldContainerClass()" [style]="fieldContainerStyle()">
              <label [for]="field().name" [class]="labelClasses()">
                <span>{{ field().label }}</span>
                @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
              </label>
              <div class="flex-1 min-w-0">
                @if (selectedFileName()) {
                  <!-- Selected File Preview Card -->
                  <div class="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-3 shadow-xs transition-all">
                    <div class="flex items-center gap-3">
                      @if (isImageFile() && selectedFilePreview()) {
                        <!-- Image Thumbnail Preview -->
                        <div class="h-14 w-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 shrink-0">
                          <img [src]="selectedFilePreview()" [alt]="selectedFileName()" class="h-full w-full object-cover" />
                        </div>
                      } @else {
                        <!-- Document / Generic File Icon Preview -->
                        <div class="h-14 w-14 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center shrink-0">
                          <app-icon name="file-text" [size]="22" />
                          <span class="text-[9px] font-mono uppercase font-bold tracking-wider mt-0.5">FILE</span>
                        </div>
                      }

                      <!-- File Details -->
                      <div class="min-w-0 flex-1">
                        <p class="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {{ selectedFileName() }}
                        </p>
                        <div class="flex items-center gap-2 mt-0.5">
                          @if (selectedFileSize()) {
                            <span class="text-[11px] text-gray-400 font-mono">{{ selectedFileSize() }}</span>
                          }
                          <span class="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            <app-icon name="check" [size]="10" />
                            Ready
                          </span>
                        </div>
                      </div>

                      <!-- Action Buttons: Replace & Remove -->
                      <div class="flex items-center gap-1 shrink-0">
                        <label
                          [for]="field().name"
                          class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer transition-colors"
                          title="Change File"
                        >
                          <input
                            [id]="field().name"
                            type="file"
                            (change)="onFileSelected($event)"
                            [accept]="field().accept || '*/*'"
                            class="hidden"
                          />
                          <app-icon name="upload" [size]="14" />
                        </label>
                        <button
                          type="button"
                          (click)="removeFile($event)"
                          class="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Remove File"
                        >
                          <app-icon name="x" [size]="14" />
                        </button>
                      </div>
                    </div>
                  </div>
                } @else {
                  <!-- Default Upload Dropzone -->
                  <label
                    [for]="field().name"
                    class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 p-4 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50/20 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 group"
                  >
                    <input
                      [id]="field().name"
                      type="file"
                      (change)="onFileSelected($event)"
                      [accept]="field().accept || '*/*'"
                      class="hidden"
                    />
                    <app-icon name="upload-cloud" [size]="24" class="text-gray-400 group-hover:text-blue-500 mb-1 transition-colors" />
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Click to browse or drop file here
                    </span>
                    <span class="text-[10px] text-gray-400 mt-0.5">
                      {{ field().accept || 'All formats' }} (up to {{ field().maxFileSizeMb || 10 }}MB)
                    </span>
                  </label>
                }
                @if (hasError()) {
                  <p class="mt-1 text-xs text-rose-500 font-medium">{{ errorMessage() }}</p>
                }
              </div>
            </div>
          }

          @case ('hidden') {
            <div class="hidden">
              <input type="hidden" [formControlName]="field().name" />
            </div>
          }

          @default {
            <!-- Standard inputs (text, email, password, number, tel, url, date, time) -->
            <div [formGroup]="formGroup()" [class]="fieldContainerClass()" [style]="fieldContainerStyle()">
              <label [for]="field().name" [class]="labelClasses()">
                <span>{{ field().label }}</span>
                @if (isRequired()) { <span class="text-rose-500 ml-0.5">*</span> }
              </label>
              <div class="flex-1 min-w-0 relative">
                <input
                  [id]="field().name"
                  [type]="resolveInputType(field().type)"
                  [formControlName]="field().name"
                  [placeholder]="field().placeholder || ''"
                  [class]="inputClasses()"
                />
                @if (field().description) {
                  <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{{ field().description }}</p>
                }
                @if (hasError()) {
                  <p class="mt-1 text-xs text-rose-500 font-medium">{{ errorMessage() }}</p>
                }
              </div>
            </div>
          }
        }
      </div>
    }
  `
})
export class DynamicFieldComponent {
  private readonly dynamicFormService = inject(DynamicFormService);

  field = input.required<FormField>();
  formGroup = input.required<FormGroup>();
  visibilityMap = input<Record<string, boolean>>({});
  requiredMap = input<Record<string, boolean>>({});
  formSettings = input<FormSettings>();

  isVisible = computed(() => {
    const f = this.field();
    if (f.hidden) return false;
    const vMap = this.visibilityMap();
    if (vMap && vMap[f.name] !== undefined) {
      return vMap[f.name];
    }
    return true;
  });

  isRequired = computed(() => {
    const f = this.field();
    const rMap = this.requiredMap();
    if (rMap && rMap[f.name] !== undefined) {
      return rMap[f.name];
    }
    return !!f.required;
  });

  effectiveLabelPosition = computed<'top' | 'left'>(() => {
    const fieldPos = this.field().appearance?.labelPosition;
    if (fieldPos && fieldPos !== 'default') {
      return fieldPos;
    }
    const formLayout = this.formSettings()?.layout;
    if (formLayout === 'horizontal') {
      return 'left';
    }
    return 'top';
  });

  effectiveDensity = computed<'compact' | 'normal' | 'comfortable'>(() => {
    return this.field().appearance?.density || this.formSettings()?.density || 'compact';
  });

  labelWidthPx = computed(() => {
    return this.field().appearance?.labelWidth || this.formSettings()?.labelWidth || 135;
  });

  fieldContainerClass = computed(() => {
    if (this.effectiveLabelPosition() === 'left') {
      return 'grid sm:grid-cols-[var(--lbl-w)_1fr] items-center gap-x-3 gap-y-1';
    }
    return 'flex flex-col';
  });

  fieldContainerStyle = computed(() => {
    if (this.effectiveLabelPosition() === 'left') {
      return `--lbl-w: ${this.labelWidthPx()}px;`;
    }
    return '';
  });

  labelClasses = computed(() => {
    const isLeft = this.effectiveLabelPosition() === 'left';
    const density = this.effectiveDensity();
    const textSz = density === 'compact' ? 'text-xs' : 'text-sm';
    const mb = isLeft ? 'mb-0 truncate' : 'mb-1 block';
    return `${textSz} font-medium text-gray-700 dark:text-gray-300 ${mb}`;
  });

  inputClasses = computed(() => {
    const density = this.effectiveDensity();
    let sizeClasses = 'h-9 px-3 py-1.5 text-xs sm:text-sm rounded-lg';
    if (density === 'normal') {
      sizeClasses = 'h-10 px-3.5 py-2 text-sm rounded-xl';
    } else if (density === 'comfortable') {
      sizeClasses = 'h-11 px-4 py-2.5 text-sm rounded-xl';
    }

    return `w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-xs transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/40 ${sizeClasses}`;
  });

  wrapperClasses = computed(() => {
    const f = this.field();
    const isLayoutType = ['heading', 'paragraph', 'divider', 'section'].includes(f.type);
    if (isLayoutType) {
      return 'col-span-12';
    }

    const width = f.appearance?.width || 'full';
    const custom = f.appearance?.customClass || '';
    let span = 'col-span-12';
    switch (width) {
      case '1/2':
        span = 'col-span-12 sm:col-span-6';
        break;
      case '1/3':
        span = 'col-span-12 sm:col-span-4';
        break;
      case '2/3':
        span = 'col-span-12 sm:col-span-8';
        break;
      case '1/4':
        span = 'col-span-12 sm:col-span-6 lg:col-span-3';
        break;
      case '3/4':
        span = 'col-span-12 sm:col-span-9';
        break;
      case 'full':
      default:
        span = 'col-span-12';
        break;
    }
    return `${span} ${custom}`.trim();
  });

  starsArray = computed(() => {
    const count = this.field().max || 5;
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  controlValue(): any {
    const ctrl = this.formGroup().get(this.field().name);
    return ctrl ? ctrl.value : this.field().defaultValue;
  }

  hasError(): boolean {
    const ctrl = this.formGroup().get(this.field().name);
    return Boolean(ctrl && ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }

  errorMessage(): string {
    const ctrl = this.formGroup().get(this.field().name);
    if (!ctrl || !ctrl.errors) return '';
    const firstKey = Object.keys(ctrl.errors)[0];
    return this.dynamicFormService.getErrorMessage(this.field(), firstKey);
  }

  resolveInputType(type: string): string {
    switch (type) {
      case 'email':
        return 'email';
      case 'password':
        return 'password';
      case 'number':
        return 'number';
      case 'tel':
        return 'tel';
      case 'url':
        return 'url';
      case 'date':
        return 'date';
      case 'time':
        return 'time';
      default:
        return 'text';
    }
  }

  toggleMultiSelectOption(val: string): void {
    const ctrl = this.formGroup().get(this.field().name);
    if (!ctrl) return;
    const current: string[] = Array.isArray(ctrl.value) ? [...ctrl.value] : [];
    const idx = current.indexOf(val);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(val);
    }
    ctrl.setValue(current);
    ctrl.markAsDirty();
  }

  isMultiSelected(val: string): boolean {
    const valArr = this.controlValue();
    return Array.isArray(valArr) && valArr.includes(val);
  }

  setRating(score: number): void {
    const ctrl = this.formGroup().get(this.field().name);
    if (ctrl) {
      ctrl.setValue(score);
      ctrl.markAsDirty();
    }
  }

  selectedFileName = signal<string | null>(null);
  selectedFileSize = signal<string | null>(null);
  selectedFilePreview = signal<string | null>(null);
  isImageFile = signal<boolean>(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFileName.set(file.name);
      this.selectedFileSize.set(this.formatFileSize(file.size));

      const isImg = file.type.startsWith('image/');
      this.isImageFile.set(isImg);

      if (isImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedFilePreview.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        this.selectedFilePreview.set(null);
      }

      const ctrl = this.formGroup().get(this.field().name);
      if (ctrl) {
        ctrl.setValue(file);
        ctrl.markAsDirty();
        ctrl.markAsTouched();
      }
    }
  }

  removeFile(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.selectedFileName.set(null);
    this.selectedFileSize.set(null);
    this.selectedFilePreview.set(null);
    this.isImageFile.set(false);

    const ctrl = this.formGroup().get(this.field().name);
    if (ctrl) {
      ctrl.setValue(null);
      ctrl.markAsDirty();
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
