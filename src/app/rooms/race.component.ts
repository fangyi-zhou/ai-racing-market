import {Component, OnInit, NgZone, OnDestroy} from '@angular/core';
import {RaceService} from './race.service';
import {ScriptService} from '../scripts/script.service';
import {AuthService} from '../auth.service';
import {Script} from '../scripts/script';

export class Room {
    AI?: string;
    id: number;
    mode: number;
    name: string;
}

declare var communication: any;

@Component({
    selector: 'app-race',
    templateUrl: './race.component.html',
    styleUrls: ['./race.component.css'],
    providers: [RaceService, ScriptService, AuthService]
})
export class RaceComponent implements OnInit, OnDestroy {
    title = 'AI racing rooms';
    rooms: Room[];
    selectedRoom: Room;
    dropDownSettings = {
        singleSelection: true,
        text: ' select your AI',
    };
    selectedItems = [];
    userScripts = [];
    constructor(private raceService: RaceService, private scriptService: ScriptService,
                private auth: AuthService, private ngZone: NgZone) {}

    ngOnInit(): void {
        this.raceService
            .getSims()
            .then((sim: Room[]) => {
                this.rooms = sim.map((sim) => {
                    // TODO some mapping for raw sim json
                    return sim;
                });
            });
        if (this.auth.loggedIn()) {
            this.scriptService
                .getUserScript(this.auth.userName())
                .then((scripts: Script[]) => {
                    this.userScripts = scripts.map((script) => {
                        return {
                            id: script._id,
                            itemName: script.scriptName
                        }
                    });
                });
        }
        communication.initGraphics();
        window['my'] = window['my'] || {};
        window['my'].namespace = window['my'].namespace || {};
        window['my'].namespace.publicFunc = this.publicFunc.bind(this);
    }
    ngOnDestroy() {
        window['my'].namespace.publicFunc = null;
    }
    publicFunc() {
        this.ngZone.run(() => this.privateFunc());
    }

    privateFunc() {
        this.raceService
            .getSims()
            .then((sim: Room[]) => {
                this.rooms = sim.map((sim) => {
                    // TODO some mapping for raw sim json
                    return sim;
                });
            });
    }
    onSelect(room: Room): void {
        if (this.selectedRoom === room) {
        }else {
            communication.disconnectOnSwap();
            this.selectedRoom = room;
            communication.init(room.id);
        }
    }
    runNewSim() {
        setTimeout(() => {
            const room: Room = {
                id: this.rooms.length,
                mode: 0,
                name: 'bar',
                AI: this.selectedItems.length !== 0 ? this.selectedItems[0].id : ''
            };
            this.raceService.createSim(room).then((newSim: Room) => {
                this.rooms.push(room);
                this.onSelect(room);
                this.switchCar();
            });
        }, 3000);

    }
    zoomIn(): void {
        communication.zoomIn();
    }
    zoomOut(): void {
        communication.zoomOut();
    }
    switchCar(): void {
        communication.switchCar();
    }

    onItemSelect(item: any): void {
        this.selectedItems = [item];
    }
}

