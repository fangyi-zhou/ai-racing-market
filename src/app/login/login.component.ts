import {Component, Input, OnInit} from "@angular/core";
import {AuthService} from "../auth.service";

interface Credential {
    username: string;
    password: string;
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [AuthService]
})
export class LoginComponent implements OnInit {

    credential: Credential = {
        username: "",
        password: ""
    };

    constructor(private auth: AuthService) {
    }

    ngOnInit(): void {

    }

    onLogin() {
        if (this.credential.username === "" || this.credential.password === "") {
            this.failureCallback("Username and password must not be empty")
            return;
        }
        this.auth.login(this.credential, this.successCallback, this.failureCallback);
    }

    onRegister() {
        if (this.credential.username === "" || this.credential.password === "") {
            this.failureCallback("Username and password must not be empty")
            return;
        }
        this.auth.register(this.credential, this.successCallback, this.failureCallback);
    }

    onLogout() {
        this.auth.logout();
    }

    successCallback(token) {
        alert("success!");
    }

    failureCallback(errorText) {
        alert(`failed! Reason: ${errorText}`);
    }
}
