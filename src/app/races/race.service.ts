import { Injectable } from '@angular/core';
import { Race } from './races';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class RaceService {
    private raceUrl = '/races';

    constructor (private http: Http) {}

    // get("/races")
    getRaces(): Promise<Race[]> {
      return this.http.get(this.raceUrl)
                 .toPromise()
                 .then(response => response.json() as Race[])
                 .catch(this.handleError);
    }

    // post("/races")
    createRaces(newRace: Race): Promise<Race> {
      return this.http.post(this.raceUrl, newRace)
                 .toPromise()
                 .then(response => response.json() as Race)
                 .catch(this.handleError);
    }

    // TODO get("/api/:id")

    // put("/api/:id")
    updateRaces(putRace: Race): Promise<Race> {
      var putUrl = this.raceUrl + '/' + putRace._id;
      return this.http.put(putUrl, putRace)
                 .toPromise()
                 .then(response => response.json() as Race)
                 .catch(this.handleError);
    }

    private handleError (error: any) {
      let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
    }
}
