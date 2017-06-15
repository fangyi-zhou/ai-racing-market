import {Component, OnInit} from '@angular/core';
import { LeaderBoardService } from './leaderboard.service';

@Component({
    selector: 'app-leaderboard',
    templateUrl: './leaderboard.component.html',
    styleUrls: ['./leaderboard.component.css'],
    providers: [LeaderBoardService],
})

export class LeaderBoardComponent implements OnInit {

    entries: Entry[];
    selectedEntry: Entry;

    constructor(private leaderBoardService: LeaderBoardService) { }

    ngOnInit() {
        this.leaderBoardService
            .getUsers()
            .then((entry: Entry[]) => {
                this.entries = entry.map((entry) => {
                    entry.value = Math.random() * 10;
                    return entry;
                }).sort(function (a, b) {
                    return b.value - a.value;
                });
            });
    }
    selectContact(entry: Entry) {
        this.selectedEntry = entry;
    }
}


export class Entry {
    id?: string;
    name: string;
    value: number;
}
