
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';


@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [],
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css'] 
})
export class SplashComponent {
  constructor(
    public router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Para manejar las diferencias entre cliente y servidor
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Solo ejecutar la redirección en el navegador
      setTimeout(() => {
        console.log('Redirigiendo a login...');

        this.router.navigate(['login']);  // Cambiar navigateByUrl por navigate
      }, 4000);
    } 
  }
}

