import { Component } from '@angular/core';

export class Room {
  id: number;
  name: string;
}

const ROOMS: Room[] = [
  { id: 0, name: 'Room-0' },
  { id: 1, name: 'Room-1' },
  { id: 2, name: 'Room-2' },
  { id: 3, name: 'Room-3' },
  { id: 4, name: 'Room-4' },
  { id: 5, name: 'Room-5' },
  { id: 6, name: 'Room-6' },
  { id: 7, name: 'Room-7' },
  { id: 8, name: 'Room-8' },
  { id: 9, name: 'Room-9' }
];

@Component({
  selector: 'rooms',
  templateUrl: './room.component.html',
  styleUrls: [ './room.component.css' ]
})
export class RoomComponent {
  title = 'AI racing rooms';
  rooms = ROOMS;
  selectedRoom: Room;

  onSelect(room: Room): void {
    this.selectedRoom = room;
  }
}


/*
 Copyright 2017 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */
