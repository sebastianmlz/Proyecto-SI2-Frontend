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
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../../services/notificacion.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

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
    ToastModule,
    FormsModule,
    DialogModule,
    DropdownModule,
    // RouterLink
  ],
  templateUrl: './table-users.component.html',
  styleUrl: './table-users.component.css'
})
export class TableUsersComponent {
  //variable de usuarios
  usuarios: User[] = [];

  // variables de registro
  nuevoUsuarioModalVisible:boolean = false;
  usuario = {
    email: '',
    first_name: '',
    last_name: '',
    active: true,
    role: '',
    password: '',
  };

  //variables de editar
  usuarioEditando: User = {} as User;
  editarModalVisible: boolean = false;

  //variable de roles
  roles = [
    { label: 'Customer', value: 'customer' },
    { label: 'Admin', value: 'admin' },
    
  ];

  constructor(private usuarioService: UserService,
    private authService: AuthService,
    private noti: NotificacionService,
    private route:Router
  ) { }

  ngOnInit() {
    this.cargarUsers();
  }

  cargarUsers(): void {
    this.usuarioService.obtenerUsers().subscribe({
      next: (res) => {
        this.usuarios = res.items;  // << aquí está el array correcto
        console.log("usuarios: ", this.usuarios);
      },
      error: (err) => console.error('Error al cargar los usuarios', err),
    });
  }
  
  
  

  // agregarUsuario(newUsuario: User): void {
  //   this.usuarioService.agregarUsers(newUsuario).subscribe({
  //     next: () => this.cargarUsers(),
  //     error: (err) => console.error('Error al agregar el usuario', err),
  //   });
  // }

  eliminarUsuario(id: number): void {
    this.usuarioService.eliminarUsuario(id).subscribe({
      next: () =>{
        this.noti.success('Eliminación exitosa', 'El usuario fue eliminado correctamente.');
        this.cargarUsers();
      },
      error: (err) =>{
        if (err.status === 403) {
          this.noti.error('Error', 'No tienes permiso para eliminar este usuario.');
        } else if (err.status === 404) {
          this.noti.error('Error', 'Usuario no encontrado.');
        } else {
          this.noti.error('Error', 'No se pudo eliminar el usuario.');
        }
        console.error('Error al eliminar el usuario', err);
      } 
    });
  }

  editarUsuario(usuario: User): void {
    this.usuarioEditando = {
      ...usuario,
      password: '',
      role: usuario.role || 'customer',
      active: usuario.active ?? true
    };
    this.editarModalVisible = true;
    console.log("usuario a editar:",this.usuarioEditando);
  }

  actualizarUsuario(): void {
    if (
      !this.usuarioEditando.first_name?.trim() ||
      !this.usuarioEditando.last_name?.trim() ||
      !this.usuarioEditando.email?.trim() ||
      !this.usuarioEditando.role
    ) {
      this.noti.warn('Campos incompletos', 'Por favor, completa todos los campos requeridos.');
      return;
    }
  
    const usuarioAEnviar: any = {
      email: this.usuarioEditando.email,
      first_name: this.usuarioEditando.first_name,
      last_name: this.usuarioEditando.last_name,
      role: this.usuarioEditando.role,
      active: !!this.usuarioEditando.active  // 🔒 asegura que sea true/false, no undefined
    };
    
    if (this.usuarioEditando.password?.trim()) {
      usuarioAEnviar.password = this.usuarioEditando.password;
    }
    
  
    this.usuarioService.actualizarUser(this.usuarioEditando.id, usuarioAEnviar).subscribe({
      next: () => {
        this.cargarUsers();
        this.noti.success('Actualización exitosa', 'El usuario fue actualizado correctamente.');
        this.editarModalVisible = false;
      },
      error: (err) => {
        console.error('Error al actualizar el usuario', err);
        this.noti.error('Error', 'No se pudo actualizar el usuario.');
      }
    });
  }

  abrirModalNuevoUsuario() {
    this.usuario = {
      email: '',
      first_name: '',
      last_name: '',
      role: '',
      active: true,
      password: '',
    };
    this.nuevoUsuarioModalVisible = true;
  }


  registrarUsuario() {
    console.log("usuario a registrar: ",this.usuario);
    this.authService.agregarUsers(this.usuario).subscribe({
      next: () => {
        this.cargarUsers();
        this.noti.success('Registro exitoso', 'El usuario fue registrado correctamente.');
        this.nuevoUsuarioModalVisible = false;
      },
      error: (err) => {
        console.error('Error al registrar el usuario', err);
        this.noti.error('Error', 'No se pudo registrar el usuario.');
      }
    });
  }
  
  
  cerrarModal(): void {
    this.editarModalVisible = false;
  }
}
