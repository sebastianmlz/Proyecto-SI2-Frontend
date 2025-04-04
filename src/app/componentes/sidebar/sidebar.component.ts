
import { Component, EventEmitter, Input, Output, viewChild, ViewChild } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { Drawer } from 'primeng/drawer';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [DrawerModule, ButtonModule, AvatarModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;
  @Input() visible: boolean = false;
  @Output() onclose = new EventEmitter<void>();
  
  closeCallback(e: any): void {
    this.drawerRef.close(e);
  }

}
