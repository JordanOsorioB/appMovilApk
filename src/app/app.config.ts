import { provideRouter, Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './login/login.component';
import { CrearusuarioComponent } from './crearusuario/crearusuario.component';
import { RecuperarComponent } from './recuperar/recuperar.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'crear', component: CrearusuarioComponent },
  { path: 'recuperar', component: RecuperarComponent },
  { path: '**', redirectTo: '/login' }
];

export const appConfig = [
  provideRouter(routes),
  importProvidersFrom(BrowserModule, FormsModule, ReactiveFormsModule)
];
