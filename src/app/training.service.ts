import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Script} from './Script';

@Injectable()
export class TrainingService {
    private raceUrl = '/api/training';

    constructor (private http: Http) {}

    // get("/races")
    getScripts(): Promise<Script[]> {
      return this.http.get(this.raceUrl)
                 .toPromise()
                 .then(response => response.json() as Script[])
                 .catch(this.handleError);
    }

    // post("/races")
    createSim(newRace: Script): Promise<Script> {
      return this.http.post(this.raceUrl, newRace)
                 .toPromise()
                 .then(response => response.json() as Script)
                 .catch(this.handleError);
    }

    // put("/api/:id")
    updateRaces(putRace: Script): Promise<Script> {
      var putUrl = this.raceUrl + '/' + putRace.id;
      return this.http.put(putUrl, putRace)
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
