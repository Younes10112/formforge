import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/builder/builder.component').then(m => m.BuilderComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
