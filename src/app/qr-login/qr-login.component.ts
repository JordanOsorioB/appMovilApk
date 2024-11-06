import { Component, HostListener } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qr-login',
  templateUrl: './qr-login.component.html',
  styleUrls: ['./qr-login.component.scss']
})
export class QrLoginComponent {
  isScanning: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async startScan() {
    this.isScanning = true; // Marcar que el escaneo ha comenzado
    await BarcodeScanner.checkPermission({ force: true });
    BarcodeScanner.hideBackground();

    const result = await BarcodeScanner.startScan();

    if (result.hasContent) {
      this.handleQrCode(result.content);
    } else {
      alert("No se encontró ningún QR.");
      this.isScanning = false; // Volver a false si no se encontró un código
    }
  }

  async handleQrCode(qrContent: string) {
    try {
      await this.authService.loginWithQr(qrContent);
      const usuarioLogueado = this.authService.getUsuarioLogueado();
      if (usuarioLogueado) {
        this.router.navigate(['/encuesta']);
      } else {
        alert('No se pudo autenticar al usuario.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert('Autenticación fallida: ' + error.message);
      } else {
        alert('Autenticación fallida: Error desconocido');
      }
    } finally {
      this.isScanning = false; // Finalizar el escaneo
    }
  }

  cancelScan() {
    BarcodeScanner.stopScan();
    this.isScanning = false; // Volver a false al cancelar el escaneo
  }

  goToLogin() {
    this.cancelScan();
    this.router.navigate(['/login']);
  }

  @HostListener('document:keydown.escape', ['$event']) 
  handleEscapeKey(event: KeyboardEvent) {
    if (this.isScanning) {
      this.cancelScan();
    }
  }
}
