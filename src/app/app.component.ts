import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import {Router} from "@angular/router";
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
    providers: [AuthService]
})
export class AppComponent {
    title = 'AI Racing';
    constructor(private auth: AuthService, private router: Router) {}

    onLogout() {
        console.log("trying to logout");
        this.auth.logout();
        this.router.navigate(['./app-landing']);
    }

    greetingMessage() {
        const hour = new Date().getHours();
        if (hour <= 4) return "It's late";
        if (hour <= 12) return "Good morning";
        if (hour <= 18) return "Good afternoon";
        if (hour <= 22) return "Good evening";
        return "It's late";
    }
}
