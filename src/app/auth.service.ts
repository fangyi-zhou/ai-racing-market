import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {tokenNotExpired} from "angular2-jwt";

@Injectable()
export class AuthService {

    constructor(private http: Http) {
    }

    private authUrl: string = "/api/auth";

    login(credential) {
        this.http.post(this.authUrl, credential)
            .map(res => res.json())
            .subscribe(
                data => localStorage.setItem('id_token', data.id_token),
                error => console.log(error)
            );
    }

    loggedIn() {
        return tokenNotExpired();
    }
}
