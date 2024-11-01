import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  private splashShown = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService, // Servicio para manejar autenticación
  ) {
    this.initializeApp();
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(12)]],
    });
  }

  initializeApp() {
    // Muestra una pantalla de splash al iniciar, si no se ha mostrado antes
    if (!this.splashShown) {
      this.splashShown = true;
      this.router.navigateByUrl('splash');
    }
  }

  // Método para validar el inicio de sesión
  onSubmit() {
    if (this.loginForm.valid) {
      const { usuario, password } = this.loginForm.value;

      this.authService.loginPorNombre(usuario, password)
        .then((credenciales) => {
          const usuarioLogueado = this.authService.getUsuarioLogueado();

          if (usuarioLogueado) {
            console.log(usuarioLogueado.tipoUsuario); // Verificación del tipo de usuario

            // Navega a diferentes vistas según el tipo de usuario
            if (usuarioLogueado.tipoUsuario === 'Empresa' || usuarioLogueado.tipoUsuario === 'SuperAdmin') {
              this.errorMessage = "Este perfil solo puede ingresar en la Web";
            } else if (usuarioLogueado.tipoUsuario === 'Cliente') {
              this.router.navigate(['/encuesta']);
            } else {
              this.router.navigate(['/login']);
            }
          }
        })
        .catch(error => {
          alert('Error en el inicio de sesión: ' + error.message);
        });
    }
  }

  recuperar() {
    this.router.navigate(['/recuperar']);
  }

  crearUsuario() {
    this.router.navigate(['/crear']);
  }

  goToQrLogin() {
    this.router.navigate(['/qr-login']);
  }
}
