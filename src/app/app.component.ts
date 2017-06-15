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
    greetingMessage() {
        const hour = new Date().getHours();
        if (hour <= 4) return "It's late";
        if (hour <= 12) return "Good morning";
        if (hour <= 18) return "Good afternoon";
        if (hour <= 22) return "Good evening";
        return "It's late";
    }
}
