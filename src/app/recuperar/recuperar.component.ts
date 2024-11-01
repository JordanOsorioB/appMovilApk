import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service'; // Servicio para acceder a Firestore
import { AuthService } from '../services/auth.service'; // Servicio de Firebase Authentication
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.css']
})
export class RecuperarComponent {
  forgotPasswordForm: FormGroup;
  submitted = false;
  message: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService, // Inyectar el servicio de Auth
    private router: Router
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]] // Solo pedimos el email
    });
  }

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  // Método para enviar el correo de restablecimiento de contraseña
  onEnviarCorreoRestablecimiento() {
    this.submitted = true;

    if (this.forgotPasswordForm.invalid) {
      this.message = 'Por favor, ingrese un correo electrónico válido.';
      return;
    }

    const email = this.email?.value;

    // Llamar al servicio para enviar el correo de restablecimiento
    this.authService.enviarCorreoRestablecimiento(email).then(() => {
      this.message = 'Se ha enviado un correo para restablecer la contraseña. Por favor, revisa tu bandeja de entrada.';
    }).catch(error => {
      this.message = `Hubo un error al enviar el correo: ${error.message}`;
    });
  }
}
