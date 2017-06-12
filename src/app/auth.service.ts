import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {tokenNotExpired} from "angular2-jwt";

declare const asmCrypto: any;

@Injectable()
export class AuthService {

    constructor(private http: Http) {
    }

    private authUrl: string = "/api/auth";
    private registerUrl: string = "/api/register";
    static SALT: string = 'c3d0a626a2d854fd3ec8be3b26bde137b49e28dbe50b92ac89c1442e321159845310b49b2156595a116270e2af2b9412';

    static hashPassword(credential) {
        const hashedPass = asmCrypto.SHA256.hex(credential.password + AuthService.SALT);
        return {
            username: credential.username,
            password: hashedPass
        };
    }

    static handleSuccess(data, successCallback) {
        const token: string = data.id_token;
        localStorage.setItem('id_token', token);
        if (successCallback)
            successCallback(token);
    }

    static handleFailure(error, failureCallback) {
        const errorText = JSON.parse(error._body).error;
        if (failureCallback)
            failureCallback(errorText)
    }

    login(credential, successCallback, failureCallback) {
        const credentialWithHashedPass = AuthService.hashPassword(credential);
        this.http.post(this.authUrl, credentialWithHashedPass)
            .map(res => res.json())
            .subscribe(
                data => AuthService.handleSuccess(data, successCallback),
                error => AuthService.handleFailure(error, failureCallback)
            );
    }

    register(credential, successCallback, failureCallback) {
        const credentialWithHashedPass = AuthService.hashPassword(credential);
        this.http.post(this.registerUrl, credentialWithHashedPass)
            .map(res => res.json())
            .subscribe(
                data => AuthService.handleSuccess(data, successCallback),
                error => AuthService.handleFailure(error, failureCallback)
            );
    }

    loggedIn() {
        return tokenNotExpired('id_token');
    }

    logout() {
        localStorage.removeItem('id_token');
    }
}
