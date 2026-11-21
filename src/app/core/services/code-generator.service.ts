import { inject, Injectable } from '@angular/core';
import { GeneratedFile, GeneratedProject } from '../models/code-generation.model';
import { FormConfiguration, FormField, FormSection } from '../models/form-config.model';
import { ValidationService } from './validation.service';

@Injectable({
  providedIn: 'root'
})
export class CodeGeneratorService {
  private readonly validationService = inject(ValidationService);

  generateProject(config: FormConfiguration): GeneratedProject {
    const diagnostics = this.validationService.getDiagnostics(config);

    const componentTs = this.generateComponentTs(config);
    const componentHtml = this.generateComponentHtml(config);
    const componentCss = this.generateComponentCss();
    const modelTs = this.generateModelTs(config);
    const configJson = this.generateConfigJson(config);
    const readmeMd = this.generateReadmeMd(config);

    return {
      componentTs,
      componentHtml,
      componentCss,
      modelTs,
      configJson,
      readmeMd,
      diagnostics
    };
  }

  generateComponentTs(config: FormConfiguration): GeneratedFile {
    const inputFields = config.fields.filter(
      f => !['heading', 'paragraph', 'divider', 'section'].includes(f.type)
    );

    const hasConditionalFields = inputFields.some(
      f => f.conditionalLogic?.enabled && f.conditionalLogic.rules?.length
    );

    // Build FormControls
    const controlsCode = inputFields
      .map(field => {
        const valArray: string[] = [];

        if (field.required) {
          valArray.push('Validators.required');
        }

        for (const v of field.validators) {
          switch (v.type) {
            case 'required':
              if (!valArray.includes('Validators.required')) valArray.push('Validators.required');
              break;
            case 'email':
              valArray.push('Validators.email');
              break;
            case 'minLength':
              valArray.push(`Validators.minLength(${v.value ?? 3})`);
              break;
            case 'maxLength':
              valArray.push(`Validators.maxLength(${v.value ?? 100})`);
              break;
            case 'min':
              valArray.push(`Validators.min(${v.value ?? 0})`);
              break;
            case 'max':
              valArray.push(`Validators.max(${v.value ?? 100})`);
              break;
            case 'pattern':
              valArray.push(`Validators.pattern(/${v.value}/)`);
              break;
          }
        }

        const defaultValue = this.formatDefaultValue(field);
        const validatorsStr =
          valArray.length > 0 ? `\n      validators: [${valArray.join(', ')}],` : '';

        return `    ${field.name}: new FormControl<${this.getTypeScriptType(field)}>(${defaultValue}, {${validatorsStr}
      nonNullable: true
    })`;
      })
      .join(',\n\n');

    const hasFileFields = inputFields.some(f => f.type === 'file');
    let fileHandlerMethod = '';
    let filePreviewState = '';
    if (hasFileFields) {
      filePreviewState = `\n  filePreview: Record<string, { name: string; size: string; isImage: boolean; url: string }> = {};`;
      fileHandlerMethod = `
  onFileChange(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const isImg = file.type.startsWith('image/');
      const previewUrl = isImg ? URL.createObjectURL(file) : '';

      this.filePreview[controlName] = {
        name: file.name,
        size: this.formatFileSize(file.size),
        isImage: isImg,
        url: previewUrl
      };

      this.form.get(controlName)?.setValue(file as any);
      this.form.get(controlName)?.markAsDirty();
      this.form.get(controlName)?.markAsTouched();
    }
  }

  onRemoveFile(controlName: string): void {
    if (this.filePreview[controlName]?.url) {
      URL.revokeObjectURL(this.filePreview[controlName].url);
    }
    delete this.filePreview[controlName];
    this.form.get(controlName)?.setValue(null);
    this.form.get(controlName)?.markAsDirty();
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
`;
    }

    // Conditional logic code
    let conditionalLogicMethod = '';
    let conditionalLogicOnInit = '';

    if (hasConditionalFields) {
      conditionalLogicOnInit = `
    // Listen to form changes to evaluate conditional field visibility
    this.form.valueChanges.subscribe(() => {
      this.evaluateConditionalRules();
    });
    this.evaluateConditionalRules();`;

      const visibilityInitializers = inputFields
        .filter(f => f.conditionalLogic?.enabled)
        .map(f => `    ${f.name}: ${!f.hidden}`)
        .join(',\n');

      const evaluationRules = inputFields
        .filter(f => f.conditionalLogic?.enabled && f.conditionalLogic.rules?.length)
        .map(field => {
          const logic = field.conditionalLogic!;
          const conditionChecks = logic.rules
            .map(rule => {
              const target = `values.${rule.targetField}`;
              switch (rule.operator) {
                case 'equals':
                  return `String(${target} ?? '') === String(${JSON.stringify(rule.value)})`;
                case 'notEquals':
                  return `String(${target} ?? '') !== String(${JSON.stringify(rule.value)})`;
                case 'contains':
                  return `String(${target} ?? '').includes(String(${JSON.stringify(rule.value)}))`;
                case 'notContains':
                  return `!String(${target} ?? '').includes(String(${JSON.stringify(rule.value)}))`;
                case 'greaterThan':
                  return `Number(${target}) > ${Number(rule.value)}`;
                case 'lessThan':
                  return `Number(${target}) < ${Number(rule.value)}`;
                case 'isEmpty':
                  return `!${target} || (Array.isArray(${target}) && ${target}.length === 0)`;
                case 'isNotEmpty':
                  return `Boolean(${target} && (!Array.isArray(${target}) || ${target}.length > 0))`;
                default:
                  return 'true';
              }
            })
            .join(logic.matchType === 'AND' ? ' && ' : ' || ');

          if (logic.action === 'show') {
            return `    this.fieldVisibility['${field.name}'] = Boolean(${conditionChecks});`;
          } else if (logic.action === 'hide') {
            return `    this.fieldVisibility['${field.name}'] = !Boolean(${conditionChecks});`;
          }
          return '';
        })
        .filter(Boolean)
        .join('\n');

      conditionalLogicMethod = `
  fieldVisibility: Record<string, boolean> = {
${visibilityInitializers}
  };

  private evaluateConditionalRules(): void {
    const values = this.form.getRawValue();
${evaluationRules}
  }
`;
    }

    const componentClass = this.toPascalCase(config.id || 'GeneratedForm') + 'Component';

    const content = `import { Component, OnInit, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ${this.toPascalCase(config.id || 'GeneratedForm')}Model } from './generated-form.model';

@Component({
  selector: 'app-generated-form',
  imports: [ReactiveFormsModule],
  templateUrl: './generated-form.component.html',
  styleUrl: './generated-form.component.css'
})
export class ${componentClass} implements OnInit {
  formSubmit = output<${this.toPascalCase(config.id || 'GeneratedForm')}Model>();
  formReset = output<void>();${filePreviewState}

  form = new FormGroup({
${controlsCode}
  });
${conditionalLogicMethod}
  ngOnInit(): void {${conditionalLogicOnInit}
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as ${this.toPascalCase(config.id || 'GeneratedForm')}Model;
    this.formSubmit.emit(value);
  }

  onReset(): void {
    ${hasFileFields ? `Object.values(this.filePreview).forEach(fp => { if (fp.url) URL.revokeObjectURL(fp.url); });\n    this.filePreview = {};\n    ` : ''}this.form.reset();
    this.formReset.emit();
  }${fileHandlerMethod}
}
`;

    return {
      name: 'generated-form.component.ts',
      language: 'typescript',
      content
    };
  }

  generateComponentHtml(config: FormConfiguration): GeneratedFile {
    let formBodyHtml = '';

    if (config.sections && config.sections.length > 0) {
      const sectionsHtml = config.sections
        .map(section => {
          const sectionFields = config.fields.filter(f => f.sectionId === section.id);
          const sectionFieldsHtml = sectionFields
            .map(field => this.generateFieldHtml(field, config))
            .join('\n\n');

          const cardClasses = this.getSectionClasses(section);

          return `    <!-- Section Card: ${this.escapeHtml(section.title)} -->
    <div class="${cardClasses}">
      <div class="mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
        <h3 class="text-base font-bold text-gray-900 dark:text-white">${this.escapeHtml(section.title)}</h3>
        @if ('${this.escapeHtml(section.description || '')}') {
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${this.escapeHtml(section.description || '')}</p>
        }
      </div>
      <div class="grid grid-cols-12 gap-5">
${sectionFieldsHtml}
      </div>
    </div>`;
        })
        .join('\n\n');

      const rootFields = config.fields.filter(f => !f.sectionId);
      let rootFieldsHtml = '';
      if (rootFields.length > 0) {
        rootFieldsHtml = `\n\n    <!-- Additional Unsectioned Fields -->
    <div class="grid grid-cols-12 gap-5">
${rootFields.map(f => this.generateFieldHtml(f, config)).join('\n\n')}
    </div>`;
      }

      formBodyHtml = `  <!-- Form Body with Section Cards -->
  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
${sectionsHtml}${rootFieldsHtml}`;
    } else {
      const fieldsHtml = config.fields
        .map(field => this.generateFieldHtml(field, config))
        .join('\n\n');

      formBodyHtml = `  <!-- Form Body (Flat Layout) -->
  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-12 gap-5">
${fieldsHtml}`;
    }

    const mainPadding = this.getMainCardPaddingClass(config);
    const mainMargin = this.getMainCardMarginClass(config);

    const content = `<div class="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900 ${mainPadding} ${mainMargin}">
  <!-- Form Header -->
  <div class="mb-8">
    <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">${this.escapeHtml(config.title)}</h2>
    @if ('${this.escapeHtml(config.description || '')}') {
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">${this.escapeHtml(config.description || '')}</p>
    }
  </div>

${formBodyHtml}

    <!-- Form Actions -->
    <div class="col-span-12 mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
      @if (${config.settings.showResetButton}) {
        <button
          type="button"
          (click)="onReset()"
          class="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          ${this.escapeHtml(config.settings.resetButtonText || 'Reset')}
        </button>
      }

      <button
        type="submit"
        class="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-blue-500"
      >
        ${this.escapeHtml(config.settings.submitButtonText || 'Submit')}
      </button>
    </div>
  </form>
</div>
`;

    return {
      name: 'generated-form.component.html',
      language: 'html',
      content
    };
  }

  generateComponentCss(): GeneratedFile {
    return {
      name: 'generated-form.component.css',
      language: 'css',
      content: `/* Custom component overrides for FormForge generated template */
:host {
  display: block;
}
`
    };
  }

  generateModelTs(config: FormConfiguration): GeneratedFile {
    const inputFields = config.fields.filter(
      f => !['heading', 'paragraph', 'divider', 'section'].includes(f.type)
    );

    const properties = inputFields
      .map(field => {
        const tsType = this.getTypeScriptType(field);
        const optional = field.required ? '' : '?';
        return `  ${field.name}${optional}: ${tsType};`;
      })
      .join('\n');

    const interfaceName = this.toPascalCase(config.id || 'GeneratedForm') + 'Model';

    const content = `/**
 * FormForge Data Model
 * Auto-generated interface for ${config.title}
 */
export interface ${interfaceName} {
${properties}
}
`;

    return {
      name: 'generated-form.model.ts',
      language: 'typescript',
      content
    };
  }

  generateConfigJson(config: FormConfiguration): GeneratedFile {
    return {
      name: 'form-config.json',
      language: 'json',
      content: JSON.stringify(config, null, 2)
    };
  }

  generateReadmeMd(config: FormConfiguration): GeneratedFile {
    const componentClass = this.toPascalCase(config.id || 'GeneratedForm') + 'Component';

    const content = `# ${config.title}

Generated by **FormForge** - The Angular Dynamic Form Builder & Code Generator.

## Integration Guide

### 1. Requirements
Ensure your Angular application has Tailwind CSS installed and configured:
\`\`\`bash
npm install -D tailwindcss @tailwindcss/postcss postcss
\`\`\`

### 2. Add Component to your Project
Copy the following files into your Angular project (e.g., \`src/app/components/generated-form/\`):
- \`generated-form.component.ts\`
- \`generated-form.component.html\`
- \`generated-form.component.css\`
- \`generated-form.model.ts\`

### 3. Usage in Parent Component
Import and declare the standalone component:

\`\`\`typescript
import { Component } from '@angular/core';
import { ${componentClass} } from './components/generated-form/generated-form.component';
import { ${this.toPascalCase(config.id || 'GeneratedForm')}Model } from './components/generated-form/generated-form.model';

@Component({
  selector: 'app-root',
  imports: [${componentClass}],
  template: \`
    <main class="min-h-screen bg-gray-50 py-12 px-4 dark:bg-gray-950">
      <app-generated-form 
        (formSubmit)="onFormSubmit($event)"
        (formReset)="onFormReset()" 
      />
    </main>
  \`
})
export class AppComponent {
  onFormSubmit(data: ${this.toPascalCase(config.id || 'GeneratedForm')}Model): void {
    console.log('Submitted Form Data:', data);
  }

  onFormReset(): void {
    console.log('Form was reset');
  }
}
\`\`\`

---
Generated on ${new Date().toISOString()} by FormForge.
`;

    return {
      name: 'README.md',
      language: 'markdown',
      content
    };
  }

  private generateFieldHtml(field: FormField, config: FormConfiguration): string {
    const colSpan = this.getColSpanClass(field.appearance?.width || 'full');
    const hasCondition = field.conditionalLogic?.enabled && field.conditionalLogic.rules?.length;

    const isHorizontal =
      field.appearance?.labelPosition === 'left' ||
      (config.settings.layout === 'horizontal' && field.appearance?.labelPosition !== 'top');

    const density = field.appearance?.density || config.settings.density || 'normal';
    const labelWidth = field.appearance?.labelWidth || config.settings.labelWidth || 140;

    const inputClasses =
      density === 'compact'
        ? 'w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 shadow-xs transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
        : density === 'comfortable'
        ? 'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
        : 'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900/50';

    const labelClasses = isHorizontal
      ? 'text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-left sm:text-right truncate'
      : 'block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

    const containerClasses = isHorizontal
      ? `${colSpan} grid sm:grid-cols-[${labelWidth}px_1fr] items-center gap-x-3 gap-y-1`
      : `${colSpan}`;

    let fieldContent = '';

    switch (field.type) {
      case 'heading': {
        const level = field.headingLevel || 2;
        fieldContent = `    <div class="${colSpan} mt-4 mb-2">
      <h${level} class="text-xl font-semibold text-gray-900 dark:text-white">${this.escapeHtml(field.content || field.label)}</h${level}>
    </div>`;
        break;
      }

      case 'paragraph': {
        fieldContent = `    <div class="${colSpan} mb-2">
      <p class="text-sm text-gray-600 dark:text-gray-400">${this.escapeHtml(field.content || field.label)}</p>
    </div>`;
        break;
      }

      case 'divider': {
        fieldContent = `    <div class="${colSpan} my-3">
      <hr class="border-gray-200 dark:border-gray-800" />
    </div>`;
        break;
      }

      case 'section': {
        fieldContent = `    <div class="${colSpan} mt-6 mb-2 pt-4 border-t border-gray-100 dark:border-gray-800">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">${this.escapeHtml(field.label)}</h3>
      @if ('${this.escapeHtml(field.description || '')}') {
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">${this.escapeHtml(field.description || '')}</p>
      }
    </div>`;
        break;
      }

      case 'textarea': {
        fieldContent = `    <div class="${containerClasses}">
      <label for="${field.name}" class="${labelClasses}">
        ${this.escapeHtml(field.label)}
        ${field.required ? '<span class="text-red-500 ml-0.5">*</span>' : ''}
      </label>
      <div class="flex-1 min-w-0">
        <textarea
          id="${field.name}"
          formControlName="${field.name}"
          rows="${field.rows || 3}"
          placeholder="${this.escapeHtml(field.placeholder || '')}"
          class="${inputClasses}"
        ></textarea>
        ${this.generateValidationErrorsHtml(field)}
      </div>
    </div>`;
        break;
      }

      case 'select': {
        const optionsHtml = (field.options || [])
          .map(
            opt =>
              `          <option value="${this.escapeHtml(opt.value)}">${this.escapeHtml(opt.label)}</option>`
          )
          .join('\n');

        fieldContent = `    <div class="${containerClasses}">
      <label for="${field.name}" class="${labelClasses}">
        ${this.escapeHtml(field.label)}
        ${field.required ? '<span class="text-red-500 ml-0.5">*</span>' : ''}
      </label>
      <div class="flex-1 min-w-0">
        <select
          id="${field.name}"
          formControlName="${field.name}"
          class="${inputClasses} cursor-pointer"
        >
          <option value="" disabled>${this.escapeHtml(field.placeholder || 'Select an option')}</option>
${optionsHtml}
        </select>
        ${this.generateValidationErrorsHtml(field)}
      </div>
    </div>`;
        break;
      }

      case 'checkbox': {
        fieldContent = `    <div class="${colSpan} flex flex-col justify-center">
      <div class="flex items-start gap-3">
        <input
          id="${field.name}"
          type="checkbox"
          formControlName="${field.name}"
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
        />
        <label for="${field.name}" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          ${this.escapeHtml(field.label)}
          ${field.required ? '<span class="text-red-500 ml-0.5">*</span>' : ''}
        </label>
      </div>
      ${this.generateValidationErrorsHtml(field)}
    </div>`;
        break;
      }

      case 'toggle': {
        fieldContent = `    <div class="${colSpan} flex items-center justify-between py-2">
      <div>
        <label for="${field.name}" class="text-sm font-medium text-gray-700 dark:text-gray-300">
          ${this.escapeHtml(field.label)}
          ${field.required ? '<span class="text-red-500 ml-0.5">*</span>' : ''}
        </label>
        @if ('${this.escapeHtml(field.description || '')}') {
          <p class="text-xs text-gray-500 dark:text-gray-400">${this.escapeHtml(field.description || '')}</p>
        }
      </div>
      <input
        id="${field.name}"
        type="checkbox"
        formControlName="${field.name}"
        class="h-5 w-9 rounded-full border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
      />
    </div>`;
        break;
      }

      case 'radio': {
        const radioItems = (field.options || [])
          .map(
            opt => `        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="${this.escapeHtml(opt.value)}"
            formControlName="${field.name}"
            class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
          />
          <span class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">${this.escapeHtml(opt.label)}</span>
        </label>`
          )
          .join('\n');

        fieldContent = `    <div class="${containerClasses}">
      <span class="${labelClasses}">
        ${this.escapeHtml(field.label)}
        ${field.required ? '<span class="text-red-500 ml-0.5">*</span>' : ''}
      </span>
      <div class="flex-1 min-w-0 flex flex-wrap gap-4 py-1">
${radioItems}
      </div>
      ${this.generateValidationErrorsHtml(field)}
    </div>`;
        break;
      }

      case 'range': {
        fieldContent = `    <div class="${containerClasses}">
      <div class="flex justify-between items-center mb-1.5 sm:mb-0">
        <label for="${field.name}" class="${labelClasses}">
          ${this.escapeHtml(field.label)}
          ${field.required ? '<span class="text-red-500 ml-0.5">*</span>' : ''}
        </label>
        <span class="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 sm:hidden">{{ form.controls.${field.name}.value }}</span>
      </div>
      <div class="flex-1 min-w-0 flex items-center gap-3">
        <input
          id="${field.name}"
          type="range"
          min="${field.min ?? 0}"
          max="${field.max ?? 100}"
          step="${field.step ?? 1}"
          formControlName="${field.name}"
          class="w-full accent-blue-600 cursor-pointer"
        />
        <span class="hidden sm:inline-block text-xs font-mono font-medium text-blue-600 dark:text-blue-400 w-10 text-right">{{ form.controls.${field.name}.value }}</span>
      </div>
    </div>`;
        break;
      }

      case 'file': {
        const acceptAttr = field.accept ? `accept="${this.escapeHtml(field.accept)}"` : '';
        const maxSizeText = field.maxFileSizeMb ? `(up to ${field.maxFileSizeMb}MB)` : '(up to 10MB)';
        const acceptText = field.accept || 'All formats';

        fieldContent = `    <div class="${containerClasses}">
      <label for="${field.name}" class="${labelClasses}">
        ${this.escapeHtml(field.label)}
        ${field.required ? '<span class="text-red-500 ml-0.5">*</span>' : ''}
      </label>
      <div class="flex-1 min-w-0">
        @if (filePreview['${field.name}']) {
          <!-- Selected File Preview Card -->
          <div class="relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-xs transition-all">
            <div class="flex items-center gap-3">
              @if (filePreview['${field.name}'].isImage) {
                <div class="h-14 w-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 shrink-0">
                  <img [src]="filePreview['${field.name}'].url" [alt]="filePreview['${field.name}'].name" class="h-full w-full object-cover" />
                </div>
              } @else {
                <div class="h-14 w-14 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <span class="text-[9px] font-mono font-bold mt-0.5">FILE</span>
                </div>
              }

              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {{ filePreview['${field.name}'].name }}
                </p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-[11px] text-gray-400 font-mono">{{ filePreview['${field.name}'].size }}</span>
                  <span class="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    Selected
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <label
                  for="${field.name}"
                  class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 cursor-pointer transition-colors"
                  title="Change File"
                >
                  <input
                    id="${field.name}"
                    type="file"
                    (change)="onFileChange($event, '${field.name}')"
                    ${acceptAttr}
                    class="hidden"
                  />
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                </label>
                <button
                  type="button"
                  (click)="onRemoveFile('${field.name}')"
                  class="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Remove File"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        } @else {
          <!-- Default Dropzone when no file selected -->
          <label
            for="${field.name}"
            class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 p-5 text-center cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50/20 dark:hover:border-blue-500 dark:hover:bg-blue-950/20 group"
          >
            <input
              id="${field.name}"
              type="file"
              (change)="onFileChange($event, '${field.name}')"
              ${acceptAttr}
              class="hidden"
            />
            <svg class="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="text-xs font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Click to browse or drop file here
            </span>
            <span class="text-[11px] text-gray-400 mt-1">
              ${this.escapeHtml(acceptText)} ${maxSizeText}
            </span>
          </label>
        }
        ${this.generateValidationErrorsHtml(field)}
      </div>
    </div>`;
        break;
      }

      case 'multiselect': {
        const optionsHtml = (field.options || [])
          .map(
            opt =>
              `          <option value="${this.escapeHtml(opt.value)}">${this.escapeHtml(opt.label)}</option>`
          )
          .join('\n');

        fieldContent = `    <div class="${containerClasses}">
      <label for="${field.name}" class="${labelClasses}">
        ${this.escapeHtml(field.label)}
        ${field.required ? '<span class="text-red-500 ml-0.5">*</span>' : ''}
      </label>
      <div class="flex-1 min-w-0">
        <select
          id="${field.name}"
          multiple
          formControlName="${field.name}"
          class="${inputClasses} cursor-pointer min-h-[90px]"
        >
${optionsHtml}
        </select>
        ${this.generateValidationErrorsHtml(field)}
      </div>
    </div>`;
        break;
      }

      case 'rating': {
        fieldContent = `    <div class="${containerClasses}">
      <label for="${field.name}" class="${labelClasses}">
        ${this.escapeHtml(field.label)}
        ${field.required ? '<span class="text-red-500 ml-0.5">*</span>' : ''}
      </label>
      <div class="flex-1 min-w-0 flex items-center gap-2">
        <input
          id="${field.name}"
          type="number"
          min="1"
          max="${field.max || 5}"
          formControlName="${field.name}"
          class="${inputClasses} max-w-[120px]"
        />
        <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">/ ${field.max || 5} Stars</span>
        ${this.generateValidationErrorsHtml(field)}
      </div>
    </div>`;
        break;
      }

      case 'hidden': {
        fieldContent = `    <input type="hidden" id="${field.name}" formControlName="${field.name}" />`;
        break;
      }

      default: {
        // Standard inputs: text, email, password, number, tel, url, date, time, color
        const inputType = this.resolveHtmlInputType(field.type);
        fieldContent = `    <div class="${containerClasses}">
      <label for="${field.name}" class="${labelClasses}">
        ${this.escapeHtml(field.label)}
        ${field.required ? '<span class="text-red-500 ml-0.5">*</span>' : ''}
      </label>
      <div class="flex-1 min-w-0">
        <input
          id="${field.name}"
          type="${inputType}"
          formControlName="${field.name}"
          placeholder="${this.escapeHtml(field.placeholder || '')}"
          class="${inputClasses}"
        />
        ${this.generateValidationErrorsHtml(field)}
      </div>
    </div>`;
        break;
      }
    }

    if (hasCondition) {
      return `    @if (fieldVisibility['${field.name}']) {
  ${fieldContent.trim()}
    }`;
    }

    return fieldContent;
  }

  private generateValidationErrorsHtml(field: FormField): string {
    const errorBlocks: string[] = [];

    if (field.required) {
      const msg =
        field.validators.find(v => v.type === 'required')?.message ||
        `${field.label || 'This field'} is required.`;
      errorBlocks.push(`        @if (form.controls.${field.name}.hasError('required')) {
          <p class="mt-1.5 text-xs text-red-500">${this.escapeHtml(msg)}</p>
        }`);
    }

    for (const v of field.validators) {
      if (v.type === 'required') continue;

      let errorKey: string = v.type;
      if (v.type === 'minLength') errorKey = 'minlength';
      if (v.type === 'maxLength') errorKey = 'maxlength';

      errorBlocks.push(`        @if (form.controls.${field.name}.hasError('${errorKey}')) {
          <p class="mt-1.5 text-xs text-red-500">${this.escapeHtml(v.message)}</p>
        }`);
    }

    if (errorBlocks.length === 0) return '';

    return `
      @if (form.controls.${field.name}.touched && form.controls.${field.name}.invalid) {
${errorBlocks.join('\n')}
      }`;
  }

  private getColSpanClass(width?: string): string {
    switch (width) {
      case '1/2':
        return 'col-span-12 sm:col-span-6';
      case '1/3':
        return 'col-span-12 sm:col-span-4';
      case '2/3':
        return 'col-span-12 sm:col-span-8';
      case '1/4':
        return 'col-span-12 sm:col-span-3';
      case '3/4':
        return 'col-span-12 sm:col-span-9';
      case 'full':
      default:
        return 'col-span-12';
    }
  }

  private resolveHtmlInputType(fieldType: string): string {
    switch (fieldType) {
      case 'file':
        return 'file';
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
      case 'color':
        return 'color';
      default:
        return 'text';
    }
  }

  private getTypeScriptType(field: FormField): string {
    switch (field.type) {
      case 'number':
      case 'range':
      case 'rating':
        return 'number';
      case 'checkbox':
      case 'toggle':
        return 'boolean';
      case 'multiselect':
        return 'string[]';
      case 'file':
        return 'File | null';
      default:
        return 'string';
    }
  }

  private formatDefaultValue(field: FormField): string {
    if (field.defaultValue !== undefined && field.defaultValue !== null) {
      return JSON.stringify(field.defaultValue);
    }
    switch (field.type) {
      case 'checkbox':
      case 'toggle':
        return 'false';
      case 'multiselect':
        return '[]';
      case 'file':
        return 'null';
      case 'number':
      case 'range':
      case 'rating':
        return `${field.min ?? 0}`;
      default:
        return "''";
    }
  }

  private escapeHtml(str: string): string {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getSectionClasses(section: FormSection): string {
    const app = section.appearance || {};

    let shadowClass = 'shadow-xs';
    switch (app.shadow) {
      case 'none': shadowClass = 'shadow-none'; break;
      case 'xs': shadowClass = 'shadow-xs'; break;
      case 'sm': shadowClass = 'shadow-sm'; break;
      case 'md': shadowClass = 'shadow-md'; break;
      case 'lg': shadowClass = 'shadow-lg'; break;
      case 'xl': shadowClass = 'shadow-xl'; break;
    }

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

    let borderWidthClass = 'border';
    switch (app.borderWidth) {
      case 'none': borderWidthClass = 'border-0'; break;
      case 'thick': borderWidthClass = 'border-2'; break;
      case 'thin':
      default:
        borderWidthClass = 'border'; break;
    }

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

    let bgClass = 'bg-white dark:bg-gray-900';
    switch (app.background) {
      case 'white': bgClass = 'bg-white dark:bg-gray-900'; break;
      case 'slate': bgClass = 'bg-slate-50 dark:bg-slate-900/60'; break;
      case 'tinted': bgClass = 'bg-blue-50/50 dark:bg-blue-950/20'; break;
      case 'transparent': bgClass = 'bg-transparent'; break;
      case 'default':
      default:
        bgClass = 'bg-white dark:bg-gray-900'; break;
    }

    let padClass = 'p-6';
    switch (app.padding) {
      case 'none': padClass = 'p-0'; break;
      case 'compact': padClass = 'p-4'; break;
      case 'comfortable': padClass = 'p-7'; break;
      case 'relaxed':
      case 'spacious': padClass = 'p-8 sm:p-10'; break;
      case 'normal':
      default:
        padClass = 'p-6'; break;
    }

    let marginClass = 'mb-6';
    switch (app.margin) {
      case 'none': marginClass = 'mb-0'; break;
      case 'compact': marginClass = 'mb-3'; break;
      case 'relaxed': marginClass = 'mb-8 sm:mb-10'; break;
      case 'spacious': marginClass = 'mb-12'; break;
      case 'normal':
      default:
        marginClass = 'mb-6'; break;
    }

    return `${borderWidthClass} ${borderColClass} ${radiusClass} ${bgClass} ${shadowClass} ${padClass} ${marginClass}`;
  }

  private getMainCardPaddingClass(config: FormConfiguration): string {
    const p = config.settings.padding;
    switch (p) {
      case 'none': return 'p-0';
      case 'compact': return 'p-4 sm:p-6';
      case 'comfortable': return 'p-7 sm:p-10';
      case 'relaxed':
      case 'spacious': return 'p-10 sm:p-14';
      case 'normal':
      default:
        return 'p-6 sm:p-10';
    }
  }

  private getMainCardMarginClass(config: FormConfiguration): string {
    const m = config.settings.margin;
    switch (m) {
      case 'none': return 'my-0';
      case 'compact': return 'my-2 sm:my-3';
      case 'relaxed': return 'my-8 sm:my-10';
      case 'spacious': return 'my-12 sm:my-16';
      case 'normal':
      default:
        return 'my-4 sm:my-6';
    }
  }

  private toPascalCase(str: string): string {
    return (str || 'Form')
      .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
      .replace(/^\w/, c => c.toUpperCase());
  }
}
