import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-crearusuario',
  templateUrl: './crearusuario.component.html',
  styleUrls: ['./crearusuario.component.css']
})
export class CrearusuarioComponent {
  crearForm: FormGroup;
  submitted = false;
  message: string | null = null;
  empresaValida = false;
  codigoInvalido = false;
  empresaSeleccionada: any = null;
  sucursales: any[] = []; 

  constructor(
    private formBuilder: FormBuilder,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.crearForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      codigo: ['', [Validators.required, Validators.minLength(8)]],
      tipoUsuario: ['', Validators.required],
      sucursal: ['']
    });
  }

  // Acceso rápido a los controles del formulario
  get f() {
    return this.crearForm.controls;
  }

  // Método para verificar el tipo de usuario seleccionado
  onTipoUsuarioChange(event: Event) {
    this.empresaValida = false;
    this.codigoInvalido = false;
    this.empresaSeleccionada = null;
    this.sucursales = []; 

    const tipoUsuario = (event.target as HTMLSelectElement).value;
    if (tipoUsuario === 'Empresa' || tipoUsuario === 'Cliente') {
      this.f['codigo'].setValidators([Validators.required, Validators.minLength(8)]);
    } else {
      this.f['codigo'].clearValidators();
    }
    this.f['codigo'].updateValueAndValidity();
  }

  // Método para validar el código de la empresa y cargar sucursales
  validarCodigoEmpresa() {
    const codigo = this.f['codigo'].value;
    this.firebaseService.validarCodigoEmpresa(codigo).subscribe((empresas) => {
      if (empresas.length > 0) {
        this.empresaValida = true;
        this.codigoInvalido = false;
        this.empresaSeleccionada = empresas[0];

        // Obtener las sucursales asociadas a la empresa seleccionada
        this.firebaseService.getSucursalesByEmpresa(this.empresaSeleccionada.idEmpresa).subscribe(sucursales => {
          this.sucursales = sucursales;
        });
      } else {
        this.empresaValida = false;
        this.codigoInvalido = true;
        this.empresaSeleccionada = null;
        this.sucursales = [];
      }
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.crearForm.invalid) {
      return;
    }

    const nombre = this.f['nombre'].value;
    const email = this.f['email'].value;
    const password = this.f['password'].value;
    const tipoUsuario = this.f['tipoUsuario'].value;
    const sucursal = this.f['sucursal'].value;

    const nuevoUsuario = {
      nombre: nombre,
      email: email,
      password: password,
      codigoEmpresa: this.empresaSeleccionada ? this.empresaSeleccionada.codigoEmpresa : null,
      idEmpresa: this.empresaSeleccionada ? this.empresaSeleccionada.idEmpresa : null,
      tipoUsuario: tipoUsuario,
      sucursal: tipoUsuario === 'Cliente' ? sucursal : 'no aplica',  // Asignar sucursal si es cliente
      vigencia: 1
    };

    // Registrar el usuario en Firebase Authentication
    this.authService.registrarUsuario(email, password)
      .then((credenciales) => {
        // Guardar el usuario en Firestore después de registrar en Auth
        this.firebaseService.addUsuario(nuevoUsuario)
          .then(() => {
            this.message = `Usuario creado exitosamente: ${nombre}`;
            this.limpiarCampos();
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          }).catch(error => {
            console.error('Error al crear usuario en Firestore: ', error);
          });
      })
      .catch(error => {
        console.error('Error al registrar usuario en Auth: ', error);
      });
  }

  // Método para limpiar los campos del formulario después de agregar un usuario
  limpiarCampos() {
    this.crearForm.reset();
    this.submitted = false;
    this.empresaValida = false;
    this.codigoInvalido = false;
    this.empresaSeleccionada = null;
    this.sucursales = [];
    this.message = null;
  }
}
