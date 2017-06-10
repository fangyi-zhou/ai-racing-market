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
    private SALT: string = 'c3d0a626a2d854fd3ec8be3b26bde137b49e28dbe50b92ac89c1442e321159845310b49b2156595a116270e2af2b9412';

    login(credential, successCallback, failureCallback) {
        const hashedPass = asmCrypto.SHA256.hex(credential.password + this.SALT);
        const credentialWithHashedPass = {
            username: credential.username,
            password: hashedPass
        };
        this.http.post(this.authUrl, credentialWithHashedPass)
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
