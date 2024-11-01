import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';

interface UserData {
  username: string;
  password: string;
  userId: string;
  token: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarioLogueado: any = null; 
  private alertaMostrada: number = 0; 
  private maxAlertas: number = 2;

  constructor(
    private afAuth: AngularFireAuth, 
    private firestore: AngularFirestore, 
    private firebaseService : FirebaseService,
    private http: HttpClient, 
    private router: Router
  ) {
    // Recuperar usuario guardado en localStorage al iniciar el servicio
    const savedUser = localStorage.getItem('usuarioLogueado');
    if (savedUser) {
      this.usuarioLogueado = JSON.parse(savedUser);
    }
  }

  // Método de login usando nombre de usuario y contraseña
  loginPorNombre(nombre: string, password: string): Promise<firebase.auth.UserCredential | null> {
    return new Promise((resolve, reject) => {
      this.firestore.collection<any>('usuarios', ref => ref.where('nombre', '==', nombre))
        .valueChanges({ idField: 'id' })
        .subscribe({
          next: (usuarios) => {
            if (usuarios.length > 0) {
              const usuario = usuarios[0]; 
              const email = usuario.email;
              
              if (email) {
                this.afAuth.signInWithEmailAndPassword(email, password)
                  .then(credenciales => {
                    this.usuarioLogueado = usuario;
                    localStorage.setItem('usuarioLogueado', JSON.stringify(usuario)); // Guardar en localStorage
                    resolve(credenciales);
                  })
                  .catch(error => {
                    if (error.code === 'auth/quota-exceeded') {
                      if (this.alertaMostrada < this.maxAlertas) {
                        console.warn('Autenticación no disponible: acceso sin autenticación.');
                        this.alertaMostrada++;  
                      }
                      this.usuarioLogueado = usuario;
                      localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
                      resolve(null);
                    } else {
                      reject('Error de autenticación: ' + error.message);
                    }
                  });
              } else {
                reject('No se encontró el email para el usuario');
              }
            } else {
              reject('Usuario no encontrado');
            }
          },
          error: (err) => {
            reject('Error obteniendo usuarios: ' + err.message);
          }
        });
    });
  }

  // Cambiar la contraseña del usuario autenticado
  cambiarContrasena(nuevaContrasena: string): Promise<void> {
    return this.afAuth.currentUser
      .then(user => {
        if (user) {
          return user.updatePassword(nuevaContrasena);
        } else {
          throw new Error('No hay usuario autenticado');
        }
      })
      .catch(error => {
        throw new Error('Error al actualizar la contraseña: ' + error.message);
      });
  }

  // Enviar correo para restablecimiento de contraseña
  enviarCorreoRestablecimiento(email: string): Promise<void> {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  // Reautenticar usuario con email y contraseña
  reauthenticateUser(email: string, password: string): Promise<firebase.auth.UserCredential> {
    const credential = firebase.auth.EmailAuthProvider.credential(email, password);
    return this.afAuth.currentUser
      .then(user => {
        if (user) {
          return user.reauthenticateWithCredential(credential);
        } else {
          throw new Error('No hay usuario autenticado');
        }
      });
  }

  // Obtener usuario logueado desde el servicio o localStorage
  getUsuarioLogueado(): any {
    if (!this.usuarioLogueado) {
      const savedUser = localStorage.getItem('usuarioLogueado');
      if (savedUser) {
        this.usuarioLogueado = JSON.parse(savedUser);
      }
    }
    return this.usuarioLogueado;
  }

  // Cerrar sesión
  logout(): Promise<void> {
    this.usuarioLogueado = null;
    this.alertaMostrada = 0;  
    localStorage.removeItem('usuarioLogueado');
    return this.afAuth.signOut();
  }

  // Obtener el usuario autenticado como observable
  getLoggedInUser(): Observable<firebase.User | null> {
    return this.afAuth.authState;
  }

  // Registrar un nuevo usuario
  registrarUsuario(email: string, password: string): Promise<any> {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  // Verificar si el usuario está autenticado
  isLoggedIn(): boolean {
    const user = this.afAuth.currentUser;
    return user !== null;
  }

  // Login utilizando un QR que contiene un token
  async loginWithQr(qrContent: string): Promise<void> {
    try {
      // Parsear el contenido del QR
      const data = JSON.parse(qrContent);
      const token = data.token;

      if (!token) {
        throw new Error('El token no está presente en el QR.');
      }

      // Llama al método getUserByToken del servicio FirebaseService
      const userData = await this.firebaseService.getUserByToken(token);

      if (!userData) {
        throw new Error('Token no encontrado en la base de datos.');
      }

      const { username, password } = userData;

      if (!username || !password) {
        throw new Error('Datos de usuario incompletos en la base de datos.');
      }

      // Llama al método loginPorNombre con los datos obtenidos
      const credenciales = await this.loginPorNombre(username, password);

      if (credenciales) {
        this.usuarioLogueado = this.getUsuarioLogueado();
        if (this.usuarioLogueado) {
          console.log("Usuario autenticado:", this.usuarioLogueado);
        }
      } else {
        throw new Error('Credenciales incorrectas.');
      }
    } catch (error) {
      console.error('Error en loginWithQr:', error);
      throw error;
    }
  }

  // Asignar manualmente el usuario logueado en el servicio
  setUsuarioLogueado(usuario: any): void {
    this.usuarioLogueado = usuario;
  }
}
