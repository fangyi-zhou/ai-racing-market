import {Component, Input, OnInit} from "@angular/core";
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";

interface Credential {
    username: string;
    password: string;
    level: number;
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [AuthService]
})
export class LoginComponent implements OnInit {

    errMsg: string;

    credential: Credential = {
        username: "",
        password: "",
        level: 1
    };

    constructor(private auth: AuthService, private router: Router) {
    }

    ngOnInit(): void {
        if (this.auth.loggedIn()) {
            this.router.navigate(['./app-dashboard']);
        }
    }

    onLogin() {
        if (this.credential.username === "" || this.credential.password === "") {
            this.failureCallback(this)("Username and password must not be empty");
            return;
        }
        this.auth.login(this.credential, this.successCallback(this), this.failureCallback(this));
    }

    onGuest() {
        //TODO: Implement guest login (just give them a login username)
        this.credential.username = "Guest";
        this.credential.password = "123";
        this.auth.login(this.credential, this.successCallback(this), this.failureCallback(this));
    }

    onRegister() {
        if (this.credential.username === "" || this.credential.password === "") {
            this.failureCallback(this)("Username and password must not be empty")
            return;
        }
        this.auth.register(this.credential, this.successCallback(this), this.failureCallback(this));
    }

    successCallback(self) {
        return (token) => {
            alert("success!");
            self.router.navigate(['./app-dashboard']);
        }
    }

    failureCallback(self) {
        return (errMsg) => {
            self.errMsg = errMsg;
        }
    }

    hasError() {
        return this.errMsg !== undefined;
    }
}
