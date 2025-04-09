import { Component } from '@angular/core';
import { TableUsersComponent } from "../../../componentes/table/table-users/table-users.component";

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [TableUsersComponent],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css'
})
export class GestionUsuariosComponent {

}
