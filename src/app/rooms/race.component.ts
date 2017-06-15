import {Component, OnInit} from '@angular/core';
import {RaceService} from './race.service';
import {ScriptService} from '../scripts/script.service';
import {AuthService} from '../auth.service';
import {Script} from '../scripts/script';

export class Room {
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
export class RaceComponent implements OnInit{
    title = 'AI racing rooms';
    rooms: Room[];
    selectedRoom: Room;
    dropDownSettings = {
        singleSelection: true,
        text: ' select your AI',
    };
    selectedItems = [];
    userScripts: any[];
    constructor(private roomService: RaceService, private scriptService: ScriptService, private auth: AuthService) {}

    ngOnInit(): void {
        this.roomService
            .getSims()
            .then((sim: Room[]) => {
                this.rooms = sim.map((sim) => {
                    // TODO some mapping for raw sim json
                    return sim;
                });
            });
        communication.initGraphics();
    }

    onSelect(room: Room): void {
        if (this.selectedRoom === room) {
        }else {
            communication.disconnectOnSwap();
            this.selectedRoom = room;
            communication.init(room.id);
        }
    }
    createNewSim() {
        if (this.auth.loggedIn()) {
            this.scriptService
                .getUserScript(this.auth.userName())
                .then((scripts: Script[]) => {
                this.userScripts = scripts.map((script) => {
                    console.log(script);
                    return {
                        id: script._id,
                        itemName: script.username
                    }
                });
            });
        }
        const room: Room = {
            id: this.rooms.length,
            mode: 2,
            name: 'foo'
        };
        if (this.rooms.length < 9) {
            this.roomService.createSim(room).then((newSim: Room) => {
                this.rooms.push(room);
            });
        }
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
        console.log(item)
    }
}

