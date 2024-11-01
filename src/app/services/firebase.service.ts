import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: AngularFirestore,private afAuth: AngularFireAuth) {}

  getPreguntas(): Observable<any[]> {
    return this.firestore.collection('preguntas').valueChanges();
  }
  getAsignaciones(): Observable<any[]> {
    return this.firestore.collection('asignaciones').valueChanges();
  }
  guardarEncuesta(respuestasEncuesta: any): Promise<any> {
    return this.firestore.collection('encuestas').add(respuestasEncuesta);
  }
  addUsuario(usuario: any): Promise<any> {
    return this.firestore.collection('usuarios').add(usuario);
  }
  validarCodigoEmpresa(codigo: string): Observable<any> {
    return this.firestore.collection('empresas', ref => ref.where('codigoEmpresa', '==', codigo)).valueChanges();
  }
  getSucursalesByEmpresa(idEmpresa: number): Observable<any[]> {
    return this.firestore.collection('sucursales', ref => ref.where('empresa', '==', idEmpresa)).valueChanges();
  }
  async getUserByToken(token: string): Promise<{ username: string, password: string } | null> {
    try {
      const querySnapshot = await this.firestore.collection('token', ref => ref.where('token', '==', token)).get().toPromise();

      if (querySnapshot && !querySnapshot.empty) {
        const documentData = querySnapshot.docs[0].data() as { username: string, password: string };
        return documentData;
      } else {
        throw new Error('Token no encontrado en la base de datos.');
      }
    } catch (error) {
      console.error('Error al obtener usuario por token:', error);
      throw new Error('Error en la consulta de Firestore.');
    }
  }
}
