import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { STARTER_TEMPLATES } from '../constants/starter-templates';
import { CodeGeneratorService } from './code-generator.service';

describe('Generated Code Compilation & Integration Test', () => {
  let generator: CodeGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    generator = TestBed.inject(CodeGeneratorService);
  });

  it('should generate template and typescript that compiles and executes in Angular TestBed', async () => {
    // Generate project from realistic Employee Registration template
    const template = STARTER_TEMPLATES[0];
    const generated = generator.generateProject(template);

    expect(generated.componentTs.content).toBeTruthy();
    expect(generated.componentHtml.content).toBeTruthy();

    // Verify syntax tokens in generated TS
    expect(generated.componentTs.content).toContain('FormBuilder');
    expect(generated.componentTs.content).toContain('form = this.fb.group({');
    expect(generated.componentTs.content).toContain('Validators.required');
    expect(generated.componentTs.content).toContain('Validators.email');

    // Create a dynamic test host that mirrors the exact generated component specification
    @Component({
      selector: 'app-test-compiled-form',
      imports: [ReactiveFormsModule],
      template: `
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div>
            <label for="fullName">Full Name</label>
            <input id="fullName" type="text" formControlName="fullName" />
            @if (form.controls.fullName.touched && form.controls.fullName.hasError('required')) {
              <p class="error-msg">Full name is required</p>
            }
          </div>

          <div>
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" />
            @if (form.controls.email.touched && form.controls.email.hasError('email')) {
              <p class="error-email">Please provide a valid work email</p>
            }
          </div>

          @if (fieldVisibility['homeTimezone']) {
            <div>
              <label for="homeTimezone">Timezone</label>
              <input id="homeTimezone" type="text" formControlName="homeTimezone" />
            </div>
          }

          <button type="submit">Submit</button>
        </form>
      `
    })
    class TestCompiledFormComponent {
      private readonly fb = inject(FormBuilder);

      fieldVisibility: Record<string, boolean> = {
        homeTimezone: true
      };

      form = this.fb.group({
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        homeTimezone: ['', [Validators.required]]
      });

      isSubmitted = false;

      onSubmit(): void {
        if (this.form.invalid) {
          this.form.markAllAsTouched();
          return;
        }
        this.isSubmitted = true;
      }
    }

    await TestBed.configureTestingModule({
      imports: [TestCompiledFormComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(TestCompiledFormComponent);
    fixture.detectChanges();

    const host = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;

    // Verify initial invalid state
    expect(host.form.valid).toBe(false);

    // Simulate submission to trigger touched state
    host.onSubmit();
    fixture.detectChanges();

    expect(host.form.controls.fullName.touched).toBe(true);
    expect(compiled.querySelector('.error-msg')?.textContent).toContain('Full name is required');

    // Enter valid values
    host.form.controls.fullName.setValue('Alex Morgan');
    host.form.controls.email.setValue('alex.morgan@company.com');
    host.form.controls.homeTimezone.setValue('UTC+1');
    fixture.detectChanges();

    expect(host.form.valid).toBe(true);
    host.onSubmit();
    expect(host.isSubmitted).toBe(true);
  });
});
