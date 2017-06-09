import {Component, OnInit} from "@angular/core";
import {AuthService} from "../auth.service";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [AuthService]
})

export class LoginComponent implements OnInit {

    constructor(private auth: AuthService) {
    }

    ngOnInit(): void {

    }

    onLogin(credential) {
        this.auth.login(credential);
    }
}
