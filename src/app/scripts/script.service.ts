import { Injectable } from '@angular/core';
import { Script } from './script';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ScriptService {
    private scriptUrl = '/api/script';

    constructor(private http: Http) { };

    // get("/api/script")
    getAllScript(): Promise<Script[]> {
        return this.http.get(this.scriptUrl)
            .toPromise()
            .then(response => response.json() as Script[])
            .catch(this.handleError);
    }
    // get("/api/user/:username")
    getUserScript(username: string): Promise<Script[]> {
        const Url = '/api/user' + '/' + username;
        return this.http.get(Url)
            .toPromise()
            .then(response => response.json() as Script[])
            .catch(this.handleError);
    }
    // post("/api/script")
    createScript(newScript: Script): Promise<Script> {
        return this.http.post(this.scriptUrl, newScript)
            .toPromise()
            .then(response => response.json() as Script)
            .catch(this.handleError);
    }

    private handleError (error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
    }
}
