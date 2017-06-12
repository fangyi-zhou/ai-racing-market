import {Component, OnInit} from '@angular/core';

export class Room {
    id: number;
    name: string;
}

const ROOMS: Room[] = [
    {id: 0, name: 'Room-0'},
    {id: 1, name: 'Room-1'},
    {id: 2, name: 'Room-2'},
    {id: 3, name: 'Room-3'},
    {id: 4, name: 'Room-4'},
    {id: 5, name: 'Room-5'},
    {id: 6, name: 'Room-6'},
    {id: 7, name: 'Room-7'},
    {id: 8, name: 'Room-8'},
    {id: 9, name: 'Room-9'}
];

declare var communication: any;

@Component({
    selector: 'rooms',
    templateUrl: './room.component.html',
    styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit{
    title = 'AI racing rooms';
    rooms = ROOMS;
    selectedRoom: Room;

    ngOnInit(): void {
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
