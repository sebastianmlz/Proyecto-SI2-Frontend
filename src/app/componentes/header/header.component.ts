import { Component } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ ButtonModule,Toolbar, AvatarModule,RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  redireecionar():void{
    const footer=document.getElementById('footer')
    if(footer){
      footer.scrollIntoView({behavior:'smooth'})
    }
  }
}
