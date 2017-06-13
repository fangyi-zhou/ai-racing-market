import { Injectable } from '@angular/core';
import { Entry } from './leaderboard.component';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class LeaderBoardService {
    private Url = '/api/leaderboard';

    constructor (private http: Http) {}

    // get("/leaderboard")
    getUsers(): Promise<Entry[]> {
        return this.http.get(this.Url)
            .toPromise()
            .then(response => response.json() as Entry[])
            .catch(this.handleError);
    }
    private handleError (error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
    }
}
