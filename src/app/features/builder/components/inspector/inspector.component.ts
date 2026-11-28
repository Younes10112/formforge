import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ConditionalAction,
  ConditionalOperator,
  ConditionalRule,
  FieldValidation,
  FieldWidth,
  SectionAppearance,
  SelectOption
} from '../../../../core/models/form-config.model';
import { FormStateService } from '../../../../core/services/form-state.service';
import { ValidationService } from '../../../../core/services/validation.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

type InspectorTab = 'general' | 'validation' | 'options' | 'condition' | 'appearance';

@Component({
  selector: 'app-inspector',
  imports: [FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full shrink-0 flex'
  },
  template: `
    <aside class="w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-full shrink-0 select-none overflow-hidden">
      @if (field(); as f) {
        <!-- Field Header -->
        <div class="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[170px]">
              {{ f.label || 'Field Properties' }}
            </span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
              {{ f.type }}
            </span>
          </div>

          <button
            type="button"
            (click)="closeInspector()"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
          >
            <app-icon name="x" [size]="14" />
          </button>
        </div>

        <!-- Property Tabs -->
        <div class="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-[11px] font-semibold text-gray-500 overflow-x-auto no-scrollbar">
          <button
            type="button"
            (click)="activeTab.set('general')"
            [class]="activeTab() === 'general' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white bg-white dark:bg-gray-800' : 'hover:text-gray-900'"
            class="px-3 py-2 shrink-0 transition-colors"
          >
            General
          </button>
          <button
            type="button"
            (click)="activeTab.set('validation')"
            [class]="activeTab() === 'validation' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white bg-white dark:bg-gray-800' : 'hover:text-gray-900'"
            class="px-3 py-2 shrink-0 transition-colors"
          >
            Validation
          </button>
          @if (isOptionField(f.type)) {
            <button
              type="button"
              (click)="activeTab.set('options')"
              [class]="activeTab() === 'options' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white bg-white dark:bg-gray-800' : 'hover:text-gray-900'"
              class="px-3 py-2 shrink-0 transition-colors"
            >
              Options
            </button>
          }
          <button
            type="button"
            (click)="activeTab.set('condition')"
            [class]="activeTab() === 'condition' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white bg-white dark:bg-gray-800' : 'hover:text-gray-900'"
            class="px-3 py-2 shrink-0 transition-colors"
          >
            Condition
          </button>
          <button
            type="button"
            (click)="activeTab.set('appearance')"
            [class]="activeTab() === 'appearance' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white bg-white dark:bg-gray-800' : 'hover:text-gray-900'"
            class="px-3 py-2 shrink-0 transition-colors"
          >
            Layout
          </button>
        </div>

        <!-- Tab Contents -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <!-- 1. GENERAL TAB -->
          @if (activeTab() === 'general') {
            <!-- Field Label -->
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Field Label</label>
              <input
                type="text"
                [ngModel]="f.label"
                (ngModelChange)="updateFieldLabel($event)"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <!-- Variable Name (Identifier) -->
            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="font-semibold text-gray-700 dark:text-gray-300">Variable Name</label>
                <span class="text-[10px] text-gray-400 font-mono">TypeScript / Form key</span>
              </div>
              <input
                type="text"
                [ngModel]="f.name"
                (ngModelChange)="updateProp('name', $event)"
                class="w-full px-3 py-1.5 font-mono text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <!-- Placeholder (if applicable) -->
            @if (supportsPlaceholder(f.type)) {
              <div>
                <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Placeholder</label>
                <input
                  type="text"
                  [ngModel]="f.placeholder"
                  (ngModelChange)="updateProp('placeholder', $event)"
                  class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            }

            <!-- Description / Help text -->
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Help Text / Description</label>
              <textarea
                rows="2"
                [ngModel]="f.description"
                (ngModelChange)="updateProp('description', $event)"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>

            <!-- Content for Headings/Paragraphs -->
            @if (f.type === 'heading' || f.type === 'paragraph') {
              <div>
                <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Content Text</label>
                <textarea
                  rows="3"
                  [ngModel]="f.content"
                  (ngModelChange)="updateProp('content', $event)"
                  class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>
            }

            <!-- State Toggles (Required, Disabled, Hidden) -->
            <div class="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <label class="flex items-center justify-between cursor-pointer">
                <span class="font-medium text-gray-700 dark:text-gray-300">Required Field</span>
                <input
                  type="checkbox"
                  [ngModel]="f.required"
                  (ngModelChange)="updateProp('required', $event)"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label class="flex items-center justify-between cursor-pointer">
                <span class="font-medium text-gray-700 dark:text-gray-300">Disabled State</span>
                <input
                  type="checkbox"
                  [ngModel]="f.disabled"
                  (ngModelChange)="updateProp('disabled', $event)"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label class="flex items-center justify-between cursor-pointer">
                <span class="font-medium text-gray-700 dark:text-gray-300">Hidden from View</span>
                <input
                  type="checkbox"
                  [ngModel]="f.hidden"
                  (ngModelChange)="updateProp('hidden', $event)"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          }

          <!-- 2. VALIDATION TAB -->
          @if (activeTab() === 'validation') {
            <div class="space-y-4">
              <!-- Required Validator -->
              <div class="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-semibold text-gray-800 dark:text-gray-200">Required</span>
                  <input
                    type="checkbox"
                    [ngModel]="f.required"
                    (ngModelChange)="updateProp('required', $event)"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                </div>
                @if (f.required) {
                  <input
                    type="text"
                    [value]="getValidatorMessage('required')"
                    (change)="setValidatorMessage('required', $event)"
                    placeholder="Custom required message..."
                    class="w-full px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                }
              </div>

              <!-- Min Length -->
              @if (f.type === 'text' || f.type === 'textarea' || f.type === 'password') {
                <div class="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-gray-800 dark:text-gray-200">Min Length</span>
                    <input
                      type="number"
                      [value]="getValidatorValue('minLength')"
                      (change)="setNumericValidator('minLength', $event)"
                      placeholder="e.g. 3"
                      class="w-20 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-right"
                    />
                  </div>
                  @if (hasValidator('minLength')) {
                    <input
                      type="text"
                      [value]="getValidatorMessage('minLength')"
                      (change)="setValidatorMessage('minLength', $event)"
                      placeholder="Error message..."
                      class="w-full px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  }
                </div>

                <!-- Max Length -->
                <div class="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-gray-800 dark:text-gray-200">Max Length</span>
                    <input
                      type="number"
                      [value]="getValidatorValue('maxLength')"
                      (change)="setNumericValidator('maxLength', $event)"
                      placeholder="e.g. 50"
                      class="w-20 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-right"
                    />
                  </div>
                  @if (hasValidator('maxLength')) {
                    <input
                      type="text"
                      [value]="getValidatorMessage('maxLength')"
                      (change)="setValidatorMessage('maxLength', $event)"
                      placeholder="Error message..."
                      class="w-full px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  }
                </div>
              }

              <!-- Regex Pattern -->
              <div class="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-2">
                <span class="font-semibold text-gray-800 dark:text-gray-200 block">Pattern Regex</span>
                <input
                  type="text"
                  [value]="getPatternValidator()"
                  (change)="setPatternValidator($event)"
                  placeholder="e.g. ^[0-9]{5}$"
                  class="w-full px-2.5 py-1 font-mono text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                />
                @if (hasValidator('pattern')) {
                  <input
                    type="text"
                    [value]="getValidatorMessage('pattern')"
                    (change)="setValidatorMessage('pattern', $event)"
                    placeholder="Pattern error message..."
                    class="w-full px-2.5 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                }
              </div>
            </div>
          }

          <!-- 3. OPTIONS TAB -->
          @if (activeTab() === 'options' && isOptionField(f.type)) {
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-gray-700 dark:text-gray-300">Choice Options</span>
                <button
                  type="button"
                  (click)="addOption()"
                  class="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                >
                  <app-icon name="plus" [size]="12" />
                  <span>Add Option</span>
                </button>
              </div>

              <div class="space-y-2">
                @for (opt of f.options || []; track $index) {
                  <div class="flex items-center gap-1.5 p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <input
                      type="text"
                      [value]="opt.label"
                      (change)="updateOption($index, 'label', $event)"
                      placeholder="Label"
                      class="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                    <input
                      type="text"
                      [value]="opt.value"
                      (change)="updateOption($index, 'value', $event)"
                      placeholder="Value"
                      class="w-20 px-2 py-1 font-mono text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                    <button
                      type="button"
                      (click)="removeOption($index)"
                      class="text-gray-400 hover:text-rose-500 p-1"
                    >
                      <app-icon name="x" [size]="12" />
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- 4. CONDITION TAB -->
          @if (activeTab() === 'condition') {
            <div class="space-y-4">
              <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <span class="font-semibold text-gray-800 dark:text-gray-200">Enable Logic</span>
                <input
                  type="checkbox"
                  [ngModel]="f.conditionalLogic?.enabled"
                  (ngModelChange)="toggleConditionalLogic($event)"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
              </div>

              @if (f.conditionalLogic?.enabled) {
                <!-- Action and Match Type -->
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block font-medium text-gray-600 dark:text-gray-400 mb-1">Action</label>
                    <select
                      [ngModel]="f.conditionalLogic?.action"
                      (ngModelChange)="updateLogicAction($event)"
                      class="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <option value="show">Show Field</option>
                      <option value="hide">Hide Field</option>
                      <option value="enable">Enable Field</option>
                      <option value="disable">Disable Field</option>
                    </select>
                  </div>

                  <div>
                    <label class="block font-medium text-gray-600 dark:text-gray-400 mb-1">When Rules</label>
                    <select
                      [ngModel]="f.conditionalLogic?.matchType"
                      (ngModelChange)="updateLogicMatch($event)"
                      class="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    >
                      <option value="AND">All Match (AND)</option>
                      <option value="OR">Any Matches (OR)</option>
                    </select>
                  </div>
                </div>

                <!-- Rules list -->
                <div class="space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-gray-700 dark:text-gray-300">Rules</span>
                    <button
                      type="button"
                      (click)="addConditionRule()"
                      class="text-blue-600 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <app-icon name="plus" [size]="12" />
                      <span>Add Rule</span>
                    </button>
                  </div>

                  @for (rule of f.conditionalLogic?.rules || []; track $index) {
                    <div class="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] uppercase font-mono text-gray-400">Rule #{{ $index + 1 }}</span>
                        <button
                          type="button"
                          (click)="removeConditionRule($index)"
                          class="text-gray-400 hover:text-rose-500"
                        >
                          <app-icon name="x" [size]="12" />
                        </button>
                      </div>

                      <!-- Target Field Selector -->
                      <select
                        [ngModel]="rule.targetField"
                        (ngModelChange)="updateRuleProp($index, 'targetField', $event)"
                        class="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                      >
                        <option value="" disabled>Select target field</option>
                        @for (other of availableTargetFields(); track other.name) {
                          <option [value]="other.name">{{ other.label }} ({{ other.name }})</option>
                        }
                      </select>

                      <!-- Operator -->
                      <select
                        [ngModel]="rule.operator"
                        (ngModelChange)="updateRuleProp($index, 'operator', $event)"
                        class="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                      >
                        <option value="equals">Equals</option>
                        <option value="notEquals">Not Equals</option>
                        <option value="contains">Contains</option>
                        <option value="notContains">Not Contains</option>
                        <option value="greaterThan">Greater Than</option>
                        <option value="lessThan">Less Than</option>
                        <option value="isEmpty">Is Empty</option>
                        <option value="isNotEmpty">Is Not Empty</option>
                      </select>

                      <!-- Value to Match -->
                      @if (rule.operator !== 'isEmpty' && rule.operator !== 'isNotEmpty') {
                        <input
                          type="text"
                          [ngModel]="rule.value"
                          (ngModelChange)="updateRuleProp($index, 'value', $event)"
                          placeholder="Expected value..."
                          class="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                        />
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- 5. APPEARANCE / LAYOUT TAB -->
          @if (activeTab() === 'appearance') {
            <div class="space-y-4">
              <!-- Field Width -->
              <div>
                <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Field Width</label>
                <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
                  @for (w of widthOptions; track w.value) {
                    <button
                      type="button"
                      (click)="updateAppearance('width', w.value)"
                      [class]="f.appearance.width === w.value ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                      class="py-1.5 px-2 rounded-lg transition-all"
                    >
                      {{ w.label }}
                    </button>
                  }
                </div>
              </div>

              <!-- Label Position (Vertical vs Horizontal) -->
              <div>
                <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Label Position</label>
                <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <button
                    type="button"
                    (click)="updateAppearance('labelPosition', 'default')"
                    [class]="(!f.appearance.labelPosition || f.appearance.labelPosition === 'default') ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    class="py-1.5 px-2 rounded-lg transition-all"
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    (click)="updateAppearance('labelPosition', 'top')"
                    [class]="f.appearance.labelPosition === 'top' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    class="py-1.5 px-2 rounded-lg transition-all"
                  >
                    Top
                  </button>
                  <button
                    type="button"
                    (click)="updateAppearance('labelPosition', 'left')"
                    [class]="f.appearance.labelPosition === 'left' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    class="py-1.5 px-2 rounded-lg transition-all"
                  >
                    Left (Inline)
                  </button>
                </div>
              </div>

              <!-- Inline Label Width (when Left) -->
              @if (f.appearance.labelPosition === 'left' || (!f.appearance.labelPosition && formState.settings().layout === 'horizontal')) {
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <label class="font-semibold text-gray-700 dark:text-gray-300">Inline Label Width</label>
                    <span class="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">{{ f.appearance.labelWidth || formState.settings().labelWidth || 135 }}px</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="220"
                    step="10"
                    [value]="f.appearance.labelWidth || formState.settings().labelWidth || 135"
                    (input)="updateAppearance('labelWidth', +$any($event.target).value)"
                    class="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg dark:bg-gray-700"
                  />
                  <div class="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>80px</span>
                    <span>150px</span>
                    <span>220px</span>
                  </div>
                </div>
              }

              <!-- Field Density / Input Size -->
              <div>
                <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Input Size / Density</label>
                <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <button
                    type="button"
                    (click)="updateAppearance('density', 'compact')"
                    [class]="f.appearance.density === 'compact' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    class="py-1.5 px-2 rounded-lg transition-all"
                  >
                    Compact
                  </button>
                  <button
                    type="button"
                    (click)="updateAppearance('density', 'normal')"
                    [class]="(!f.appearance.density || f.appearance.density === 'normal') ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    class="py-1.5 px-2 rounded-lg transition-all"
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    (click)="updateAppearance('density', 'comfortable')"
                    [class]="f.appearance.density === 'comfortable' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    class="py-1.5 px-2 rounded-lg transition-all"
                  >
                    Spacious
                  </button>
                </div>
              </div>

              <!-- Custom CSS Class -->
              <div>
                <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Custom CSS Class</label>
                <input
                  type="text"
                  [ngModel]="f.appearance.customClass"
                  (ngModelChange)="updateAppearance('customClass', $event)"
                  placeholder="e.g. shadow-sm my-custom-input"
                  class="w-full px-3 py-1.5 font-mono text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          }
        </div>
      } @else if (section(); as s) {
        <!-- Section Level Settings & Card Styling -->
        <div class="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div class="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
              <app-icon name="layout" [size]="13" />
            </div>
            <div class="min-w-0">
              <h2 class="text-xs font-bold text-gray-900 dark:text-white truncate">Section Settings</h2>
              <span class="text-[10px] text-gray-400 truncate block">{{ s.title }}</span>
            </div>
          </div>

          <button
            type="button"
            (click)="closeInspector()"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
            title="Deselect Section"
          >
            <app-icon name="x" [size]="14" />
          </button>
        </div>

        <!-- Section Settings Tabs -->
        <div class="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-[11px] font-semibold text-gray-500">
          <button
            type="button"
            (click)="sectionTab.set('style')"
            [class]="sectionTab() === 'style' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white bg-white dark:bg-gray-800' : 'hover:text-gray-900 dark:hover:text-white'"
            class="flex-1 py-2 text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <app-icon name="palette" [size]="12" />
            <span>Card Styling</span>
          </button>
          <button
            type="button"
            (click)="sectionTab.set('content')"
            [class]="sectionTab() === 'content' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white bg-white dark:bg-gray-800' : 'hover:text-gray-900 dark:hover:text-white'"
            class="flex-1 py-2 text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <app-icon name="file-text" [size]="12" />
            <span>Content & Info</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          @if (sectionTab() === 'content') {
            <!-- Section Title / Label -->
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Section Title</label>
              <input
                type="text"
                [ngModel]="s.title"
                (ngModelChange)="updateSectionTitle(s.id, $event)"
                placeholder="e.g. Personal Information"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Description / Subtitle</label>
              <textarea
                rows="2"
                [ngModel]="s.description"
                (ngModelChange)="updateSectionDescription(s.id, $event)"
                placeholder="Brief description for this section card"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              ></textarea>
            </div>

            <!-- Collapsible Switch -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <span class="font-semibold text-gray-700 dark:text-gray-300 block">Collapsible Card</span>
                <span class="text-[10px] text-gray-400">Allow users to collapse/expand this card</span>
              </div>
              <input
                type="checkbox"
                [ngModel]="s.collapsible"
                (ngModelChange)="updateSectionCollapsible(s.id, $event)"
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
              />
            </div>

            <!-- Section Reorder -->
            <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
              <span class="font-semibold text-gray-700 dark:text-gray-300 block mb-2">Section Position</span>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="formState.moveSection(s.id, 'up')"
                  class="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <app-icon name="chevron-up" [size]="13" />
                  <span>Move Up</span>
                </button>
                <button
                  type="button"
                  (click)="formState.moveSection(s.id, 'down')"
                  class="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <app-icon name="chevron-down" [size]="13" />
                  <span>Move Down</span>
                </button>
              </div>
            </div>
          } @else {
            <!-- Card Style Tab -->
            <!-- Card Shadow -->
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Card Shadow</label>
              <div class="grid grid-cols-3 gap-1.5 text-center">
                @for (sh of [
                  { label: 'None', val: 'none' },
                  { label: 'Subtle', val: 'xs' },
                  { label: 'Small', val: 'sm' },
                  { label: 'Medium', val: 'md' },
                  { label: 'Large', val: 'lg' },
                  { label: 'Elevated', val: 'xl' }
                ]; track sh.val) {
                  <button
                    type="button"
                    (click)="updateSectionAppearanceProp(s.id, 'shadow', sh.val)"
                    [class]="(s.appearance?.shadow || 'xs') === sh.val ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    class="py-1.5 rounded-lg text-[11px] transition-all"
                  >
                    {{ sh.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Border Color -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Border Color</label>
              <div class="grid grid-cols-4 gap-1.5">
                @for (col of [
                  { label: 'Default', val: 'default', bg: 'bg-gray-200 dark:bg-gray-700' },
                  { label: 'Slate', val: 'slate', bg: 'bg-slate-400' },
                  { label: 'Blue', val: 'blue', bg: 'bg-blue-500' },
                  { label: 'Indigo', val: 'indigo', bg: 'bg-indigo-500' },
                  { label: 'Emerald', val: 'emerald', bg: 'bg-emerald-500' },
                  { label: 'Amber', val: 'amber', bg: 'bg-amber-500' },
                  { label: 'Rose', val: 'rose', bg: 'bg-rose-500' },
                  { label: 'None', val: 'transparent', bg: 'border border-dashed border-gray-400' }
                ]; track col.val) {
                  <button
                    type="button"
                    (click)="updateSectionAppearanceProp(s.id, 'borderColor', col.val)"
                    [class]="(s.appearance?.borderColor || 'default') === col.val ? 'ring-2 ring-blue-500 font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'"
                    class="flex flex-col items-center gap-1 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-[10px] transition-all"
                  >
                    <span class="w-3.5 h-3.5 rounded-full shrink-0" [class]="col.bg"></span>
                    <span class="truncate">{{ col.label }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Border Width -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Border Width</label>
              <div class="grid grid-cols-3 gap-1.5 text-center">
                @for (bw of [
                  { label: 'None (0px)', val: 'none' },
                  { label: 'Thin (1px)', val: 'thin' },
                  { label: 'Thick (2px)', val: 'thick' }
                ]; track bw.val) {
                  <button
                    type="button"
                    (click)="updateSectionAppearanceProp(s.id, 'borderWidth', bw.val)"
                    [class]="(s.appearance?.borderWidth || 'thin') === bw.val ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'"
                    class="py-1.5 rounded-lg text-[11px] transition-all"
                  >
                    {{ bw.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Corner Radius (Rounded) -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Border Radius</label>
              <div class="grid grid-cols-3 gap-1.5 text-center">
                @for (rd of [
                  { label: 'Square', val: 'none' },
                  { label: 'Small', val: 'md' },
                  { label: 'Medium', val: 'lg' },
                  { label: 'Rounded', val: 'xl' },
                  { label: 'Extra', val: '2xl' },
                  { label: 'Smooth', val: '3xl' }
                ]; track rd.val) {
                  <button
                    type="button"
                    (click)="updateSectionAppearanceProp(s.id, 'borderRadius', rd.val)"
                    [class]="(s.appearance?.borderRadius || 'xl') === rd.val ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'"
                    class="py-1.5 rounded-lg text-[11px] transition-all"
                  >
                    {{ rd.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Card Background -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Card Background</label>
              <div class="grid grid-cols-2 gap-1.5 text-center">
                @for (bg of [
                  { label: 'Default Card', val: 'default' },
                  { label: 'Pure White', val: 'white' },
                  { label: 'Slate Subtle', val: 'slate' },
                  { label: 'Blue Tint', val: 'tinted' },
                  { label: 'Transparent', val: 'transparent' }
                ]; track bg.val) {
                  <button
                    type="button"
                    (click)="updateSectionAppearanceProp(s.id, 'background', bg.val)"
                    [class]="(s.appearance?.background || 'default') === bg.val ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'"
                    class="py-1.5 rounded-lg text-[11px] transition-all"
                  >
                    {{ bg.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Card Inner Spacing (Padding) -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Card Padding (Inner)</label>
              <div class="grid grid-cols-3 gap-1.5 text-center">
                @for (pd of [
                  { label: 'None (0px)', val: 'none' },
                  { label: 'Compact (14px)', val: 'compact' },
                  { label: 'Normal (20px)', val: 'normal' },
                  { label: 'Comfortable (28px)', val: 'comfortable' },
                  { label: 'Spacious (36px)', val: 'spacious' }
                ]; track pd.val) {
                  <button
                    type="button"
                    (click)="updateSectionAppearanceProp(s.id, 'padding', pd.val)"
                    [class]="(s.appearance?.padding || 'normal') === pd.val ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'"
                    class="py-1.5 rounded-lg text-[10px] transition-all"
                  >
                    {{ pd.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Card Margin (Bottom Spacing) -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Card Margin (Bottom Spacing)</label>
              <div class="grid grid-cols-3 gap-1.5 text-center">
                @for (mg of [
                  { label: 'None (0px)', val: 'none' },
                  { label: 'Compact (12px)', val: 'compact' },
                  { label: 'Normal (20px)', val: 'normal' },
                  { label: 'Relaxed (32px)', val: 'relaxed' },
                  { label: 'Spacious (48px)', val: 'spacious' }
                ]; track mg.val) {
                  <button
                    type="button"
                    (click)="updateSectionAppearanceProp(s.id, 'margin', mg.val)"
                    [class]="(s.appearance?.margin || 'normal') === mg.val ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'"
                    class="py-1.5 rounded-lg text-[10px] transition-all"
                  >
                    {{ mg.label }}
                  </button>
                }
              </div>
            </div>
          }

          <!-- Danger Zone: Remove Section -->
          <div class="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              (click)="deleteCurrentSection(s.id)"
              class="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <app-icon name="trash" [size]="13" />
              <span>Delete Section Card</span>
            </button>
            <p class="text-[10px] text-gray-400 text-center mt-1">Fields inside will remain on the canvas</p>
          </div>
        </div>
      } @else {
        <!-- Form Level Settings (When no field is selected) -->
        <div class="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <app-icon name="settings" [size]="14" class="text-gray-400" />
            <h2 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Form Settings</h2>
          </div>

          <button
            type="button"
            (click)="hideInspector()"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors"
            title="Hide Form Settings"
            aria-label="Hide Form Settings"
          >
            <app-icon name="x" [size]="14" />
          </button>
        </div>
        
        <!-- Form Level Settings Tabs -->
        <div class="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-[11px] font-semibold text-gray-500">
          <button
            type="button"
            (click)="formLevelTab.set('content')"
            [class]="formLevelTab() === 'content' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white bg-white dark:bg-gray-800' : 'hover:text-gray-900 dark:hover:text-white'"
            class="flex-1 py-2 text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <app-icon name="file-text" [size]="12" />
            <span>Content & Info</span>
          </button>
          <button
            type="button"
            (click)="formLevelTab.set('style')"
            [class]="formLevelTab() === 'style' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-white bg-white dark:bg-gray-800' : 'hover:text-gray-900 dark:hover:text-white'"
            class="flex-1 py-2 text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <app-icon name="palette" [size]="12" />
            <span>Styling</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 text-xs">

          @if (formLevelTab() == "content") {

            <!-- Form Title -->
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Form Title</label>
              <input
                type="text"
                [ngModel]="formState.form().title"
                (ngModelChange)="formState.updateFormMeta($event)"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                rows="2"
                [ngModel]="formState.form().description"
                (ngModelChange)="formState.updateFormMeta(formState.form().title, $event)"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              ></textarea>
            </div>

            <!-- Submit Button Text -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Submit Button Label</label>
              <input
                type="text"
                [ngModel]="formState.settings().submitButtonText"
                (ngModelChange)="formState.updateFormSettings({ submitButtonText: $event })"
                class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <!-- Reset Button Toggle -->
            <div class="space-y-2">
              <label class="flex items-center justify-between cursor-pointer">
                <span class="font-medium text-gray-700 dark:text-gray-300">Show Reset Button</span>
                <input
                  type="checkbox"
                  [ngModel]="formState.settings().showResetButton"
                  (ngModelChange)="formState.updateFormSettings({ showResetButton: $event })"
                  class="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
              </label>
  
              @if (formState.settings().showResetButton) {
                <div>
                  <label class="block font-medium text-gray-600 dark:text-gray-400 mb-1">Reset Button Label</label>
                  <input
                    type="text"
                    [ngModel]="formState.settings().resetButtonText || 'Reset'"
                    (ngModelChange)="formState.updateFormSettings({ resetButtonText: $event })"
                    class="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              }
            </div>
          }

          @if (formLevelTab() == "style") {

            <!-- Form Global Layout Style (Vertical vs Horizontal ERP) -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Form Layout Style</label>
              <div class="grid grid-cols-2 gap-1.5 text-center">
                <button
                  type="button"
                  (click)="formState.updateFormSettings({ layout: 'vertical' })"
                  [class]="formState.settings().layout !== 'horizontal' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                  class="py-2 px-2.5 rounded-lg transition-all text-xs"
                >
                  Top Labels (Vertical)
                </button>
                <button
                  type="button"
                  (click)="formState.updateFormSettings({ layout: 'horizontal' })"
                  [class]="formState.settings().layout === 'horizontal' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                  class="py-2 px-2.5 rounded-lg transition-all text-xs"
                >
                  Left Labels (Inline ERP)
                </button>
              </div>
              <p class="mt-1 text-[10px] text-gray-400">Controls default label positioning for all fields in the form.</p>
            </div>

            <!-- Default Inline Label Width (when horizontal) -->
            @if (formState.settings().layout === 'horizontal') {
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="font-semibold text-gray-700 dark:text-gray-300">Default Label Width</label>
                  <span class="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">{{ formState.settings().labelWidth || 135 }}px</span>
                </div>
                <input
                  type="range"
                  min="90"
                  max="220"
                  step="10"
                  [value]="formState.settings().labelWidth || 135"
                  (input)="formState.updateFormSettings({ labelWidth: +$any($event.target).value })"
                  class="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg dark:bg-gray-700"
                />
              </div>
            }

            <!-- Global Form Density -->
            <div class="pt-2 border-t border-gray-100 dark:border-gray-800">
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Field Density / Sizing</label>
              <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
                <button
                  type="button"
                  (click)="formState.updateFormSettings({ density: 'compact' })"
                  [class]="(formState.settings().density === 'compact' || !formState.settings().density) ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                  class="py-1.5 px-2 rounded-lg transition-all"
                  title="High density ERP style"
                >
                  Compact (ERP)
                </button>
                <button
                  type="button"
                  (click)="formState.updateFormSettings({ density: 'normal' })"
                  [class]="formState.settings().density === 'normal' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                  class="py-1.5 px-2 rounded-lg transition-all"
                >
                  Normal
                </button>
                <button
                  type="button"
                  (click)="formState.updateFormSettings({ density: 'comfortable' })"
                  [class]="formState.settings().density === 'comfortable' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                  class="py-1.5 px-2 rounded-lg transition-all"
                >
                  Comfortable
                </button>
              </div>
            </div>
  
            <!-- Main Form Card Padding & Spacing -->
            <div class="pt-3 border-t border-gray-100 dark:border-gray-800">
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Main Form Card Padding (Inner)</label>
              <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
                @for (pad of [
                  { label: 'None (0px)', val: 'none' },
                  { label: 'Compact (16px)', val: 'compact' },
                  { label: 'Normal (24px)', val: 'normal' },
                  { label: 'Comfortable (32px)', val: 'comfortable' },
                  { label: 'Spacious (48px)', val: 'spacious' }
                ]; track pad.val) {
                  <button
                    type="button"
                    (click)="formState.updateFormSettings({ padding: $any(pad.val) })"
                    [class]="(formState.settings().padding || 'normal') === pad.val ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    class="py-1.5 px-1 rounded-lg transition-all text-[10px]"
                  >
                    {{ pad.label }}
                  </button>
                }
              </div>
            </div>

            <div>
              <label class="block font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Main Form Card Margin (Outer Spacing)</label>
              <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
                @for (m of [
                  { label: 'None (0px)', val: 'none' },
                  { label: 'Compact (12px)', val: 'compact' },
                  { label: 'Normal (24px)', val: 'normal' },
                  { label: 'Relaxed (36px)', val: 'relaxed' },
                  { label: 'Spacious (56px)', val: 'spacious' }
                ]; track m.val) {
                  <button
                    type="button"
                    (click)="formState.updateFormSettings({ margin: $any(m.val) })"
                    [class]="(formState.settings().margin || 'normal') === m.val ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'"
                    class="py-1.5 px-1 rounded-lg transition-all text-[10px]"
                  >
                    {{ m.label }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </aside>
  `
})
export class InspectorComponent {
  readonly formState = inject(FormStateService);
  private readonly validationService = inject(ValidationService);

  readonly activeTab = signal<InspectorTab>('general');
  readonly field = computed(() => this.formState.selectedField());
  readonly section = computed(() => this.formState.selectedSection());
  readonly sectionTab = signal<'content' | 'style'>('style');
  readonly formLevelTab = signal<'content' | 'style'>('content');

  readonly widthOptions: { label: string; value: FieldWidth }[] = [
    { label: '100%', value: 'full' },
    { label: '50%', value: '1/2' },
    { label: '33%', value: '1/3' },
    { label: '66%', value: '2/3' },
    { label: '25%', value: '1/4' },
    { label: '75%', value: '3/4' }
  ];

  readonly availableTargetFields = computed(() => {
    const current = this.field();
    return this.formState.fields().filter(f => f.id !== current?.id && !['heading', 'paragraph', 'divider', 'section'].includes(f.type));
  });

  closeInspector(): void {
    this.formState.clearSelection();
  }

  updateSectionTitle(id: string, title: string): void {
    this.formState.updateSection(id, { title });
  }

  updateSectionDescription(id: string, description: string): void {
    this.formState.updateSection(id, { description });
  }

  updateSectionCollapsible(id: string, collapsible: boolean): void {
    this.formState.updateSection(id, { collapsible });
  }

  updateSectionAppearanceProp(id: string, prop: keyof SectionAppearance, value: any): void {
    this.formState.updateSectionAppearance(id, { [prop]: value });
  }

  deleteCurrentSection(id: string): void {
    if (confirm('Delete this section? Any fields inside will remain on the canvas.')) {
      this.formState.removeSection(id);
    }
  }

  hideInspector(): void {
    this.formState.setInspectorOpen(false);
  }

  isOptionField(type: string): boolean {
    return ['select', 'multiselect', 'radio'].includes(type);
  }

  supportsPlaceholder(type: string): boolean {
    return ['text', 'textarea', 'email', 'password', 'number', 'tel', 'url', 'select'].includes(type);
  }

  updateProp(key: string, value: unknown): void {
    const f = this.field();
    if (!f) return;
    this.formState.updateField(f.id, { [key]: value });
  }

  updateFieldLabel(label: string): void {
    const f = this.field();
    if (!f) return;
    this.formState.updateField(f.id, { label });
  }

  updateAppearance(key: string, value: unknown): void {
    const f = this.field();
    if (!f) return;
    const currentApp = f.appearance || { width: 'full' };
    this.formState.updateField(f.id, {
      appearance: { ...currentApp, [key]: value }
    });
  }

  // --- Validation Helpers ---

  hasValidator(type: string): boolean {
    const f = this.field();
    return Boolean(f?.validators.some(v => v.type === type));
  }

  getValidatorValue(type: string): number | string {
    const f = this.field();
    const v = f?.validators.find(val => val.type === type);
    return (v?.value as number | string) ?? '';
  }

  getValidatorMessage(type: string): string {
    const f = this.field();
    const v = f?.validators.find(val => val.type === type);
    return v?.message || '';
  }

  setValidatorMessage(type: string, event: Event): void {
    const f = this.field();
    if (!f) return;
    const message = (event.target as HTMLInputElement).value;
    const existing = [...f.validators];
    const idx = existing.findIndex(v => v.type === type);
    if (idx > -1) {
      existing[idx] = { ...existing[idx], message };
    } else {
      existing.push({ type: type as any, message });
    }
    this.formState.updateField(f.id, { validators: existing });
  }

  setNumericValidator(type: string, event: Event): void {
    const f = this.field();
    if (!f) return;
    const val = (event.target as HTMLInputElement).value;
    const num = val === '' ? null : Number(val);
    let existing = [...f.validators];
    if (num === null) {
      existing = existing.filter(v => v.type !== type);
    } else {
      const idx = existing.findIndex(v => v.type === type);
      if (idx > -1) {
        existing[idx] = { ...existing[idx], value: num };
      } else {
        existing.push({ type: type as any, value: num, message: `${f.label} must satisfy ${type} (${num})` });
      }
    }
    this.formState.updateField(f.id, { validators: existing });
  }

  getPatternValidator(): string {
    const f = this.field();
    const v = f?.validators.find(val => val.type === 'pattern');
    return (v?.value as string) || '';
  }

  setPatternValidator(event: Event): void {
    const f = this.field();
    if (!f) return;
    const pattern = (event.target as HTMLInputElement).value;
    let existing = [...f.validators];
    if (!pattern) {
      existing = existing.filter(v => v.type !== 'pattern');
    } else {
      const idx = existing.findIndex(v => v.type === 'pattern');
      if (idx > -1) {
        existing[idx] = { ...existing[idx], value: pattern };
      } else {
        existing.push({ type: 'pattern', value: pattern, message: `${f.label} is formatted incorrectly` });
      }
    }
    this.formState.updateField(f.id, { validators: existing });
  }

  // --- Options Helpers ---

  addOption(): void {
    const f = this.field();
    if (!f) return;
    const currentOptions = f.options ? [...f.options] : [];
    const count = currentOptions.length + 1;
    currentOptions.push({ label: `Option ${count}`, value: `opt${count}` });
    this.formState.updateField(f.id, { options: currentOptions });
  }

  updateOption(index: number, key: 'label' | 'value', event: Event): void {
    const f = this.field();
    if (!f || !f.options) return;
    const updated = [...f.options];
    updated[index] = { ...updated[index], [key]: (event.target as HTMLInputElement).value };
    this.formState.updateField(f.id, { options: updated });
  }

  removeOption(index: number): void {
    const f = this.field();
    if (!f || !f.options) return;
    const updated = f.options.filter((_, i) => i !== index);
    this.formState.updateField(f.id, { options: updated });
  }

  // --- Conditional Logic Helpers ---

  toggleConditionalLogic(enabled: boolean): void {
    const f = this.field();
    if (!f) return;
    const logic = f.conditionalLogic || {
      enabled: false,
      action: 'show' as ConditionalAction,
      matchType: 'AND',
      rules: []
    };
    this.formState.updateField(f.id, {
      conditionalLogic: { ...logic, enabled }
    });
  }

  updateLogicAction(action: ConditionalAction): void {
    const f = this.field();
    if (!f || !f.conditionalLogic) return;
    this.formState.updateField(f.id, {
      conditionalLogic: { ...f.conditionalLogic, action }
    });
  }

  updateLogicMatch(matchType: 'AND' | 'OR'): void {
    const f = this.field();
    if (!f || !f.conditionalLogic) return;
    this.formState.updateField(f.id, {
      conditionalLogic: { ...f.conditionalLogic, matchType }
    });
  }

  addConditionRule(): void {
    const f = this.field();
    if (!f || !f.conditionalLogic) return;
    const rules = [...(f.conditionalLogic.rules || [])];
    const targets = this.availableTargetFields();
    rules.push({
      targetField: targets.length > 0 ? targets[0].name : '',
      operator: 'equals',
      value: ''
    });
    this.formState.updateField(f.id, {
      conditionalLogic: { ...f.conditionalLogic, rules }
    });
  }

  updateRuleProp(index: number, prop: keyof ConditionalRule, value: any): void {
    const f = this.field();
    if (!f || !f.conditionalLogic) return;
    const rules = [...f.conditionalLogic.rules];
    rules[index] = { ...rules[index], [prop]: value };
    this.formState.updateField(f.id, {
      conditionalLogic: { ...f.conditionalLogic, rules }
    });
  }

  removeConditionRule(index: number): void {
    const f = this.field();
    if (!f || !f.conditionalLogic) return;
    const rules = f.conditionalLogic.rules.filter((_, i) => i !== index);
    this.formState.updateField(f.id, {
      conditionalLogic: { ...f.conditionalLogic, rules }
    });
  }
}
