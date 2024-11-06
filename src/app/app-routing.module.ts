import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { CrearusuarioComponent } from './crearusuario/crearusuario.component';
import { RecuperarComponent } from './recuperar/recuperar.component';
import { EncuestaComponent } from './encuesta/encuesta.component';
import { QrLoginComponent } from './qr-login/qr-login.component';
import { SplashComponent } from './splash/splash.component';

const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'login', component: LoginComponent },
  { path: 'crear', component: CrearusuarioComponent },
  { path: 'encuesta', component: EncuestaComponent },
  { path: 'recuperar', component: RecuperarComponent },
  { path: 'qr-login', component: QrLoginComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
