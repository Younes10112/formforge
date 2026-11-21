import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList
} from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormField, FormSection } from '../../../../core/models/form-config.model';
import { PaletteItem } from '../../../../core/models/palette.model';
import { FormStateService } from '../../../../core/services/form-state.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { CanvasFieldComponent } from '../canvas-field/canvas-field.component';

@Component({
  selector: 'app-canvas',
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder, CanvasFieldComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex-1 flex flex-col h-full min-w-0 overflow-hidden relative'
  },
  template: `
    <main class="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/70 dark:bg-gray-950">
      <!-- Canvas Control Bar (Width switcher, stats, clear, settings toggle) -->
      <div class="h-11 px-6 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm flex items-center justify-between text-xs shrink-0 select-none">
        <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <span class="font-medium text-gray-700 dark:text-gray-300">{{ formState.fields().length }} field(s)</span>
          <span>•</span>
          <span>{{ formState.sections().length }} section(s)</span>
        </div>

        <!-- Viewport Width Controls -->
        <div class="flex items-center rounded-lg border border-gray-200 dark:border-gray-800 p-0.5 bg-gray-100/70 dark:bg-gray-800/60">
          <button
            type="button"
            (click)="formState.setCanvasWidth('desktop')"
            [class]="formState.canvasWidth() === 'desktop' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
            class="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all"
            title="Desktop Canvas (100% / Max 900px)"
          >
            <app-icon name="monitor" [size]="13" />
            <span class="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            (click)="formState.setCanvasWidth('tablet')"
            [class]="formState.canvasWidth() === 'tablet' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
            class="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all"
            title="Tablet Canvas (768px)"
          >
            <app-icon name="tablet" [size]="13" />
            <span class="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            (click)="formState.setCanvasWidth('mobile')"
            [class]="formState.canvasWidth() === 'mobile' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
            class="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] transition-all"
            title="Mobile Canvas (375px)"
          >
            <app-icon name="smartphone" [size]="13" />
            <span class="hidden sm:inline">Mobile</span>
          </button>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Toggle Form Settings / Inspector Button -->
          <button
            type="button"
            (click)="formState.toggleInspector()"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
            [class]="formState.isInspectorOpen()
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-900/50'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100/70 dark:bg-gray-800/60 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'"
            [title]="formState.isInspectorOpen() ? 'Hide Settings panel' : 'Show Settings panel'"
          >
            <app-icon [name]="formState.isInspectorOpen() ? 'eye-off' : 'settings'" [size]="13" />
            <span class="hidden sm:inline">{{ formState.isInspectorOpen() ? 'Hide Settings' : 'Form Settings' }}</span>
          </button>

          <span class="text-gray-200 dark:text-gray-800 hidden sm:inline">|</span>

          <button
            type="button"
            (click)="onResetCanvas()"
            class="text-gray-400 hover:text-rose-600 transition-colors flex items-center gap-1 text-[11px]"
            title="Reset canvas to empty form"
          >
            <app-icon name="trash" [size]="13" />
            <span class="hidden sm:inline">Clear Canvas</span>
          </button>
        </div>
      </div>

      <!-- Canvas Scroll Area -->
      <div
        (click)="deselectAll()"
        class="flex-1 overflow-y-auto p-6 sm:p-8 flex justify-center"
      >
        <div
          class="w-full transition-all duration-200"
          [class]="canvasContainerClass()"
        >
          <!-- Form Header Box -->
          <div
            class="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all"
            [class]="formState.getMainCardPaddingClass() + ' ' + formState.getMainCardMarginClass()"
          >
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {{ formState.form().title }}
            </h1>
            @if (formState.form().description) {
              <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ formState.form().description }}
              </p>
            }
          </div>

          <!-- CDK Drop Lists Container -->
          <div class="flex flex-col">
            <!-- Form Sections (if any) -->
            @for (section of formState.sections(); track section.id; let sIdx = $index) {
              <div
                (click)="onSelectSection(section.id, $event)"
                [class]="formState.getSectionClasses(section, formState.selectedSectionId() === section.id)"
                class="cursor-pointer group relative"
              >
                <!-- Section Header -->
                <div class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800/80">
                  <div class="flex items-center gap-2.5 min-w-0">
                    @if (section.collapsible) {
                      <button
                        type="button"
                        (click)="onToggleCollapse(section.id, $event)"
                        class="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Toggle Section Collapse"
                      >
                        <app-icon [name]="section.collapsed ? 'chevron-right' : 'chevron-down'" [size]="14" />
                      </button>
                    }
                    <div class="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
                      <app-icon name="layout" [size]="13" />
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <h2 class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ section.title }}</h2>
                        @if (formState.selectedSectionId() === section.id) {
                          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500 text-white shadow-xs">
                            Editing Section
                          </span>
                        }
                      </div>
                      @if (section.description) {
                        <p class="text-[11px] text-gray-400 dark:text-gray-500 truncate">{{ section.description }}</p>
                      }
                    </div>
                  </div>

                  <div class="flex items-center gap-1 shrink-0" (click)="$event.stopPropagation()">
                    @if (formState.sections().length > 1) {
                      <button
                        type="button"
                        (click)="formState.moveSection(section.id, 'up')"
                        [disabled]="sIdx === 0"
                        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move Section Up"
                      >
                        <app-icon name="chevron-up" [size]="13" />
                      </button>
                      <button
                        type="button"
                        (click)="formState.moveSection(section.id, 'down')"
                        [disabled]="sIdx === formState.sections().length - 1"
                        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move Section Down"
                      >
                        <app-icon name="chevron-down" [size]="13" />
                      </button>
                    }
                    <button
                      type="button"
                      (click)="onSelectSection(section.id, $event)"
                      class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Section Settings & Styling"
                    >
                      <app-icon name="settings" [size]="13" />
                    </button>
                    <button
                      type="button"
                      (click)="deleteSection(section.id)"
                      class="p-1 text-gray-400 hover:text-rose-500 transition-colors"
                      title="Remove Section"
                    >
                      <app-icon name="trash" [size]="13" />
                    </button>
                  </div>
                </div>

                <!-- Drop List for Section (hidden when collapsed) -->
                @if (!section.collapsed) {
                  <div
                    cdkDropList
                    [id]="'section-' + section.id"
                    [cdkDropListData]="getFieldsForSection(section.id)"
                    (cdkDropListDropped)="onDrop($event, section.id)"
                    class="min-h-[85px] grid grid-cols-12 gap-3.5 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-3.5 transition-colors bg-blue-50/10"
                  >
                    @for (field of getFieldsForSection(section.id); track field.id) {
                      <div cdkDrag [cdkDragData]="field" [class]="getFieldColSpan(field)">
                        <div *cdkDragPlaceholder class="h-20 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/20 dark:bg-blue-950/20"></div>
                        <app-canvas-field [field]="field" />
                      </div>
                    }

                    @if (getFieldsForSection(section.id).length === 0) {
                      <div class="col-span-12 py-7 text-center text-xs text-gray-400 font-medium">
                        Drag components here or click components in palette to add to this section
                      </div>
                    }
                  </div>
                } @else {
                  <div class="py-2.5 text-center text-xs text-gray-400 font-medium italic">
                    Section collapsed ({{ getFieldsForSection(section.id).length }} field(s))
                  </div>
                }
              </div>
            }

            <!-- Root / Unsectioned Fields Drop List -->
            <div
              cdkDropList
              id="root-droplist"
              [cdkDropListData]="getRootFields()"
              (cdkDropListDropped)="onDrop($event)"
              class="min-h-[160px] grid grid-cols-12 gap-3.5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-4 transition-colors bg-blue-50/10"
            >
              @for (field of getRootFields(); track field.id) {
                <div cdkDrag [cdkDragData]="field" [class]="getFieldColSpan(field)">
                  <div *cdkDragPlaceholder class="h-20 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/20 dark:bg-blue-950/20"></div>
                  <app-canvas-field [field]="field" />
                </div>
              }

              <!-- Empty State in Canvas -->
              @if (formState.fields().length === 0) {
                <div class="col-span-12 py-14 flex flex-col items-center justify-center text-center">
                  <div class="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 mb-4 shadow-inner">
                    <app-icon name="layout" [size]="28" />
                  </div>
                  <h3 class="text-sm font-bold text-gray-900 dark:text-white">Your form canvas is empty</h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                    Drag components from the palette on the left, or click any component to add it here.
                  </p>
                  <div class="mt-4 flex gap-2">
                    <button
                      type="button"
                      (click)="loadEmployeeTemplate()"
                      class="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition-all"
                    >
                      Load Sample Form
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  `
})
export class CanvasComponent {
  readonly formState = inject(FormStateService);
  private readonly toast = inject(ToastService);

  canvasContainerClass = computed(() => {
    switch (this.formState.canvasWidth()) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'max-w-[860px]';
    }
  });

  getRootFields(): FormField[] {
    return this.formState.fields().filter(f => !f.sectionId);
  }

  getFieldsForSection(sectionId: string): FormField[] {
    return this.formState.fields().filter(f => f.sectionId === sectionId);
  }

  getFieldColSpan(field: FormField): string {
    const isLayout = ['heading', 'paragraph', 'divider', 'section'].includes(field.type);
    if (isLayout) return 'col-span-12';
    switch (field.appearance?.width) {
      case '1/2':
        return 'col-span-12 sm:col-span-6';
      case '1/3':
        return 'col-span-12 sm:col-span-4';
      case '2/3':
        return 'col-span-12 sm:col-span-8';
      case '1/4':
        return 'col-span-12 sm:col-span-6 lg:col-span-3';
      case '3/4':
        return 'col-span-12 sm:col-span-9';
      case 'full':
      default:
        return 'col-span-12';
    }
  }

  onDrop(event: CdkDragDrop<FormField[], any>, targetSectionId?: string): void {
    const itemData = event.item.data;
    if (!itemData) return;

    // Check if dragged from Palette
    const isPaletteItem =
      event.previousContainer.id === 'palette-items-list' ||
      (typeof itemData === 'object' && itemData !== null && 'defaultField' in itemData && Boolean((itemData as any).defaultField));

    if (isPaletteItem) {
      // Dragged new item from Palette!
      const paletteItem = itemData as PaletteItem;
      const id = `field_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const baseName = paletteItem.defaultField?.namePrefix || 'field';
      let name = baseName;
      let counter = 1;
      while (this.formState.form().fields.some(f => f.name === name)) {
        counter++;
        name = `${baseName}${counter}`;
      }

      const newField: FormField = {
        ...JSON.parse(JSON.stringify(paletteItem.defaultField)),
        id,
        name,
        sectionId: targetSectionId
      };

      this.formState.addField(newField, event.currentIndex, targetSectionId);
      this.toast.info(`Added ${paletteItem.label} to canvas`);
    } else {
      // Reordered an existing field
      const field = itemData as FormField;
      if (!field || !field.id) return;

      this.formState.moveFieldToSection(field.id, targetSectionId, event.currentIndex);
    }
  }

  onSelectSection(sectionId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.formState.selectSection(sectionId);
  }

  onToggleCollapse(sectionId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.formState.toggleSectionCollapse(sectionId);
  }

  deleteSection(sectionId: string): void {
    this.formState.removeSection(sectionId);
    this.toast.info('Section deleted');
  }

  deselectAll(): void {
    this.formState.clearSelection();
  }

  deselectField(): void {
    this.formState.clearSelection();
  }

  onResetCanvas(): void {
    if (confirm('Are you sure you want to clear the canvas?')) {
      this.formState.resetForm();
      this.toast.info('Canvas cleared');
    }
  }

  loadEmployeeTemplate(): void {
    this.formState.loadTemplate('employee-registration');
    this.toast.success('Loaded Employee Registration template');
  }
}
