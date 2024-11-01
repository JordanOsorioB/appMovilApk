import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-encuesta',
  templateUrl: './encuesta.component.html',
  styleUrls: ['./encuesta.component.css']
})
export class EncuestaComponent implements OnInit {
  pregunta1: { pregunta: string, respuesta: string } = { pregunta: '', respuesta: '' };
  pregunta2: { pregunta: string, respuesta: string } = { pregunta: '', respuesta: '' };
  pregunta3: { pregunta: string, respuesta: string } = { pregunta: '', respuesta: '' };
  pregunta4: { pregunta: string, respuesta: string } = { pregunta: '', respuesta: '' };
  pregunta5: { pregunta: string, respuesta: string } = { pregunta: '', respuesta: '' };
  message: string = '';
  showAdditionalQuestions: boolean = false;
  selectedEmojiValue: number | null = null;
  usuarioLogueado: any = null;
  preguntas: any[] = []; // Preguntas asignadas a la encuesta

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuarioLogueado = this.authService.getUsuarioLogueado();
    console.log('Usuario obtenido en encuesta:', this.usuarioLogueado);

    if (this.usuarioLogueado) {
      this.firebaseService.getPreguntas().subscribe(preguntas => {
        this.firebaseService.getAsignaciones().subscribe(asignaciones => {
          this.preguntas = preguntas.filter(pregunta =>
            asignaciones.some(asignacion =>
              asignacion.nombreSucursal === this.usuarioLogueado.sucursal &&
              asignacion.pregunta === pregunta.pregunta
            )
          );
        });
      });
    } else {
      console.error('No hay usuario logueado.');
    }
  }


  // Seleccionar emoji de satisfacción
  selectEmoji(emoji: number) {
    this.selectedEmojiValue = emoji;
  }

  // Seleccionar opción de respuesta para una pregunta específica
  selectOption(index: number, option: string) {
    switch (index) {
      case 0:
        this.pregunta1 = { pregunta: this.preguntas[0]?.pregunta || '', respuesta: option };
        break;
      case 1:
        this.pregunta2 = { pregunta: this.preguntas[1]?.pregunta || '', respuesta: option };
        break;
      case 2:
        this.pregunta3 = { pregunta: this.preguntas[2]?.pregunta || '', respuesta: option };
        break;
      case 3:
        this.pregunta4 = { pregunta: this.preguntas[3]?.pregunta || '', respuesta: option };
        break;
      case 4:
        this.pregunta5 = { pregunta: this.preguntas[4]?.pregunta || '', respuesta: option };
        break;
    }
  }

  // Obtener la fecha en formato dd-MM-yyyy
  getFormattedDate(): string {
    const today = new Date();
    const day = ('0' + today.getDate()).slice(-2);
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Actualizar mensaje adicional
  updateMessage(event: any) {
    this.message = event.target.value;
  }

  // Mostrar preguntas adicionales
  continuarEncuesta() {
    this.showAdditionalQuestions = true;
  }

  // Guardar encuesta en la base de datos
  finalizarEncuesta() {
    if (this.usuarioLogueado) {
      const respuestasEncuesta = {
        calificacion: this.selectedEmojiValue,
        pregunta1: this.pregunta1,
        pregunta2: this.pregunta2,
        pregunta3: this.pregunta3,
        pregunta4: this.pregunta4,
        pregunta5: this.pregunta5,
        comentarioAdicional: this.message || '',
        usuario: this.usuarioLogueado.nombre,
        empresa: this.usuarioLogueado.idEmpresa,
        fechaRealizacion: this.getFormattedDate()
      };

      // Guardar la encuesta completa en Firebase
      this.firebaseService.guardarEncuesta(respuestasEncuesta).then(() => {
        console.log('Encuesta guardada correctamente');
        this.router.navigate(['/agradecimiento']);
      }).catch(err => {
        console.error('Error al guardar la encuesta:', err);
      });
    } else {
      console.error('No hay usuario logueado. No se puede guardar la encuesta.');
    }
  }

  logout() {
  this.authService.logout().then(() => {
    this.router.navigate(['/login']);
  }).catch(error => {
    console.error('Error al cerrar sesión:', error);
  });
}

}
