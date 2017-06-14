import {Component, OnInit} from '@angular/core';
import {RoomService} from './room.service';

export class Room {
    id: number;
    name: string;
}

declare var communication: any;

@Component({
    selector: 'rooms',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.css'],
    providers: [RoomService]
})
export class RoomComponent implements OnInit{
    title = 'AI racing rooms';
    rooms: Room[];
    selectedRoom: Room;
    constructor(private roomService: RoomService) {}

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
        const room: Room = {
            id: this.rooms.length,
            name: 'foo'
        };
        this.rooms.push(room);
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
}


/*
 Copyright 2017 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */
