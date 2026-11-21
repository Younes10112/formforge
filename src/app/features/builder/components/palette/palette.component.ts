import { CdkDrag, CdkDragPlaceholder, CdkDragPreview, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { COMPONENT_PALETTE } from '../../../../core/constants/component-palette.data';
import { FormField } from '../../../../core/models/form-config.model';
import { ComponentCategory, PaletteItem } from '../../../../core/models/palette.model';
import { FormStateService } from '../../../../core/services/form-state.service';
import { ToastService } from '../../../../core/services/toast.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-palette',
  imports: [CdkDropList, CdkDrag, CdkDragPreview, CdkDragPlaceholder, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full shrink-0 flex'
  },
  template: `
    <aside class="w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-full shrink-0 select-none">
      <!-- Search Header -->
      <div class="p-3 border-b border-gray-100 dark:border-gray-800">
        <div class="relative">
          <app-icon name="search" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Search components..."
            class="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
          />
          @if (searchQuery()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <app-icon name="x" [size]="12" />
            </button>
          }
        </div>

        <!-- Category Tabs -->
        <div class="flex gap-1 mt-2.5 overflow-x-auto pb-0.5 text-[11px] font-medium no-scrollbar">
          @for (cat of categories; track cat.id) {
            <button
              type="button"
              (click)="selectedCategory.set(cat.id)"
              [class]="selectedCategory() === cat.id ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
              class="px-2.5 py-1 rounded-lg shrink-0 transition-all capitalize"
            >
              {{ cat.label }}
            </button>
          }
        </div>
      </div>

      <!-- Component Items List with CDK Drop List -->
      <div
        cdkDropList
        id="palette-items-list"
        [cdkDropListData]="filteredItems()"
        [cdkDropListSortingDisabled]="true"
        [cdkDropListEnterPredicate]="noDropPredicate"
        class="flex-1 overflow-y-auto p-3 space-y-2"
      >
        @if (filteredItems().length === 0) {
          <div class="text-center py-8 text-xs text-gray-400">
            No components match your search
          </div>
        }

        @for (item of filteredItems(); track item.type + '_' + dragKey()) {
          <div
            cdkDrag
            [cdkDragData]="item"
            (cdkDragEnded)="onDragEnded()"
            (click)="onItemClick(item)"
            class="group flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs cursor-grab active:cursor-grabbing transition-all select-none"
          >
            <!-- Floating Drag Preview -->
            <div
              *cdkDragPreview
              class="flex items-center gap-3 p-3 rounded-xl border-2 border-blue-500 bg-white dark:bg-gray-800 shadow-2xl z-50 pointer-events-none min-w-[220px]"
            >
              <div class="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <app-icon [name]="item.icon" [size]="16" />
              </div>
              <div>
                <div class="text-xs font-bold text-gray-900 dark:text-white">
                  {{ item.label }}
                </div>
                <div class="text-[10px] text-gray-400">
                  Drop into canvas
                </div>
              </div>
            </div>

            <!-- In-place Placeholder so item doesn't collapse in palette -->
            <div
              *cdkDragPlaceholder
              class="flex items-center gap-2.5 p-2.5 rounded-xl border border-dashed border-blue-400 bg-blue-50/20 dark:bg-blue-950/20 opacity-60"
            >
              <div class="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700/60 flex items-center justify-center text-gray-400">
                <app-icon [name]="item.icon" [size]="16" />
              </div>
              <div class="text-xs font-semibold text-gray-500">
                {{ item.label }}
              </div>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="h-8 w-8 rounded-lg bg-gray-50 dark:bg-gray-700/60 border border-gray-200/60 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-400 transition-colors">
                <app-icon [name]="item.icon" [size]="16" />
              </div>
              <div class="text-left">
                <div class="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {{ item.label }}
                </div>
                <div class="text-[10px] text-gray-400 truncate max-w-[140px]">
                  {{ item.description }}
                </div>
              </div>
            </div>

            <button
              type="button"
              (click)="onAddClick($event, item)"
              title="Click to add to canvas"
              class="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
            >
              <app-icon name="plus" [size]="14" />
            </button>
          </div>
        }
      </div>

      <!-- Quick Add Section Button -->
      <div class="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <button
          type="button"
          (click)="addSection()"
          class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 transition-all"
        >
          <app-icon name="plus" [size]="14" />
          <span>Add Form Section</span>
        </button>
      </div>
    </aside>
  `
})
export class PaletteComponent {
  private readonly formState = inject(FormStateService);
  private readonly toast = inject(ToastService);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<ComponentCategory | 'all'>('all');
  readonly dragKey = signal<number>(0);
  readonly noDropPredicate = () => false;

  onDragEnded(): void {
    this.dragKey.update(v => v + 1);
  }

  readonly categories = [
    { id: 'all' as const, label: 'All' },
    { id: 'basic' as const, label: 'Basic' },
    { id: 'selection' as const, label: 'Choice' },
    { id: 'advanced' as const, label: 'Advanced' },
    { id: 'layout' as const, label: 'Layout' }
  ];

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();

    return COMPONENT_PALETTE.filter(item => {
      const matchesCat = cat === 'all' || item.category === cat;
      const matchesSearch = !q || item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.type.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  });

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onItemClick(item: PaletteItem): void {
    this.createAndAddField(item);
  }

  onAddClick(event: MouseEvent, item: PaletteItem): void {
    event.stopPropagation();
    this.createAndAddField(item);
  }

  addSection(): void {
    const section = this.formState.addSection('New Section', 'Grouped fields container');
    this.toast.info(`Section "${section.title}" created`);
  }

  private createAndAddField(item: PaletteItem): void {
    const id = `field_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    
    // Generate unique variable name
    const baseName = item.defaultField.namePrefix;
    let name = baseName;
    let counter = 1;
    while (this.formState.form().fields.some(f => f.name === name)) {
      counter++;
      name = `${baseName}${counter}`;
    }

    const newField: FormField = {
      ...JSON.parse(JSON.stringify(item.defaultField)),
      id,
      name
    };

    this.formState.addField(newField);
    this.toast.info(`Added ${item.label} to form`);
  }
}
