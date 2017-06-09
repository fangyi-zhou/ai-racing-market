import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {tokenNotExpired} from "angular2-jwt";

@Injectable()
export class AuthService {

    constructor(private http: Http) {
    }

    private authUrl: string = "/api/auth";

    login(credential, successCallback, failureCallback) {
        this.http.post(this.authUrl, credential)
            .map(res => res.json())
            .subscribe(
                data => {
                    const token: string = data.id_token;
                    localStorage.setItem('id_token', token);
                    if (successCallback)
                        successCallback(token);
                },
                error => {
                    if (failureCallback)
                        failureCallback(error)
                }
            );
    }

    loggedIn() {
        return tokenNotExpired();
    }
}
