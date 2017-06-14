import { Injectable } from '@angular/core';
import { Stats } from './statistics.component';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class LeaderBoardService {
    private Url = '/api/statistics';

    constructor (private http: Http) {}

    // get("/api/statistics")
    getStats(): Promise<Stats[]> {
        return this.http.get(this.Url)
            .toPromise()
            .then(response => response.json() as Stats[])
            .catch(this.handleError);
    }
    private handleError (error: any) {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console instead
    }
}
