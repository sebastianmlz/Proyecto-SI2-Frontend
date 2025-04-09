import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { User, UserService } from '../../../Services/user.service';

@Component({
  selector: 'app-table-users',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    FileUploadModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule
  ],
  templateUrl: './table-users.component.html',
  styleUrl: './table-users.component.css'
})
export class TableUsersComponent {
  usuarios: User[] = [];

  constructor(private usuarioService: UserService) { }

  ngOnInit() {
    this.cargarUsers();
  }

  cargarUsers(): void {
    this.usuarioService.obtenerUsers().subscribe({
      next: (res) => {
        this.usuarios = res.items; // ✅ Se accede a items
      },
      error: (err) => console.error('Error al cargar los usuarios', err),
    });
  }

  agregarUsuario(newUsuario: User): void {
    this.usuarioService.agregarUsers(newUsuario).subscribe({
      next: () => this.cargarUsers(),
      error: (err) => console.error('Error al agregar el usuario', err),
    });
  }

  eliminarUsuario(id: number): void {
    this.usuarioService.eliminarUsuario(id).subscribe({
      next: () => this.cargarUsers(),
      error: (err) => console.error('Error al eliminar el usuario', err),
    });
  }

  editarUsuario(usuario: User): void {
    this.usuarioService.actualizarUser(usuario).subscribe({
      next: () => this.cargarUsers(),
      error: (err) => console.error('Error al editar el usuario', err),
    });
  }
}
