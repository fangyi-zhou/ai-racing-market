import { Injectable } from '@angular/core';
import { Room } from './room.component';
import { Http, Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class RoomService {
    private raceUrl = '/api/sims';

    constructor (private http: Http) {}

    // get("/races")
    getSims(): Promise<Room[]> {
      return this.http.get(this.raceUrl)
                 .toPromise()
                 .then(response => response.json() as Room[])
                 .catch(this.handleError);
    }

    // post("/races")
    createSim(newRace: Room): Promise<Room> {
      return this.http.post(this.raceUrl, newRace)
                 .toPromise()
                 .then(response => response.json() as Room)
                 .catch(this.handleError);
    }

    // put("/api/:id")
    updateRaces(putRace: Room): Promise<Room> {
      var putUrl = this.raceUrl + '/' + putRace.id;
      return this.http.put(putUrl, putRace)
                 .toPromise()
                 .then(response => response.json() as Room)
                 .catch(this.handleError);
    }

    private handleError (error: any) {
      let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
    }
}
