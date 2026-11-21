# FormForge

FormForge is a visual drag-and-drop form builder and Angular code generator designed to produce production-ready, type-safe, accessible Angular components styled with Tailwind CSS.

---

## Key Capabilities

- **Visual Drag-and-Drop Studio**: Drag from a palette of 20+ basic, choice, advanced, and layout components directly onto a responsive canvas using Angular CDK Drag & Drop.
- **Section & Layout Support**: Organize complex forms into collapsible, reorderable sections with responsive width controls (full, half, third, quarter).
- **Reactive Property Inspector**: Configure labels, identifiers, placeholders, validators, options, and conditional logic with instant canvas updates.
- **Dynamic Form Engine**: Converts schema configurations into Angular `FormGroup` and `FormControl` instances with built-in and custom validators.
- **Real-time Conditional Logic**: Evaluates visibility and enablement rules dynamically as form values change.
- **Interactive Live Preview**: Test real-time validation, simulate submissions, and inspect live JSON payloads with desktop, tablet, and mobile viewport simulation.
- **Angular Code Generator**: Produces clean, idiomatic Angular standalone TypeScript (`generated-form.component.ts`), HTML templates (`generated-form.component.html`), strongly typed models (`generated-form.model.ts`), and integration instructions.
- **Code Workspace**: Powered by Monaco Editor with tabs, syntax highlighting, code copying, and individual file downloads.
- **Project ZIP Exporter**: Packages the complete standalone Angular form component, models, configuration, and documentation into a single downloadable ZIP using JSZip.
- **Form Persistence & Templates**: Save and load form configurations locally, or jumpstart forms using pre-built templates.

---

## Supported Field Types

- **Basic**: Text, Textarea, Email, Password, Number, Phone, URL, Date, Time
- **Selection**: Select, Multi-select, Radio Group, Checkbox, Toggle Switch
- **Advanced**: Range Slider, Rating Stars, Color Picker, File Upload, Hidden Field
- **Layout**: Headings (H1-H6), Descriptive Paragraphs, Dividers, Form Sections

---

## Architecture

FormForge follows a feature-based architecture built with modern Angular APIs:

```
src/app/
├── core/
│   ├── models/        # Strongly typed schemas (FormConfiguration, FormField, etc.)
│   ├── services/      # Reactive state, code generation, dynamic form engine, storage
│   └── constants/     # Predefined starter templates and component palette data
├── features/
│   ├── builder/       # 3-pane visual studio (Palette, Canvas, Inspector, Header)
│   ├── preview/       # Interactive live simulation with device viewports
│   ├── code-workspace/# Monaco Editor code generation studio
│   ├── templates-modal/# Pre-built template picker
│   └── import-export-modal/ # Schema validator and JSON importer/exporter
└── shared/
    └── components/    # Reusable icons, toasts, modal windows, and dynamic field renderer
```

---

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm 10 or higher

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/` in your browser.

### Build
```bash
npm run build
```
The optimized production bundle will be generated in `dist/form-forge/`.
