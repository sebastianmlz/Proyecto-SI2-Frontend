import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';


@Component({
  selector: 'app-delivery',
  imports: [],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.css'
})
export class DeliveryComponent {
  usuario: any
  
  constructor(public authService: AuthService,
    private noti: NotificacionService,) { }

  ngOnInit() {
    this.usuario = this.authService.getUser();
    this.noti.success(`Bienvenido ${this.usuario.first_name} ${this.usuario.last_name}`, 'Sesion iniciada con exito');
  }
}
