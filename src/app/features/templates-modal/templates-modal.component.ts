import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { STARTER_TEMPLATES } from '../../core/constants/starter-templates';
import { FormConfiguration } from '../../core/models/form-config.model';
import { FormStateService } from '../../core/services/form-state.service';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-templates-modal',
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal
      [isOpen]="isOpen()"
      title="Form Templates Library"
      subtitle="Select a pre-configured, production-ready form template"
      (close)="close.emit()"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        @for (tpl of templates; track tpl.id) {
          <div
            (click)="selectTemplate(tpl)"
            class="group p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/60 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {{ tpl.title }}
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  {{ tpl.fields.length }} fields
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                {{ tpl.description }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 font-medium">
              <span>{{ tpl.sections.length }} section(s)</span>
              <span class="text-blue-600 group-hover:translate-x-0.5 transition-transform font-semibold flex items-center gap-1">
                Load Template &rarr;
              </span>
            </div>
          </div>
        }
      </div>
    </app-modal>
  `
})
export class TemplatesModalComponent {
  isOpen = input<boolean>(false);
  close = output<void>();

  private readonly formState = inject(FormStateService);
  private readonly toast = inject(ToastService);

  readonly templates: FormConfiguration[] = STARTER_TEMPLATES;

  selectTemplate(template: FormConfiguration): void {
    this.formState.setForm(template);
    this.formState.saveCurrentForm();
    this.toast.success(`Loaded "${template.title}" template`, 'Template Ready');
    this.close.emit();
  }
}
