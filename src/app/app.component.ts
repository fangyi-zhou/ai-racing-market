import { Component } from '@angular/core';
import { AuthService } from './auth.service';
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
    providers: [AuthService]
})
export class AppComponent {
    title = 'AI Racing Market';
    constructor(private auth: AuthService) {}
}
