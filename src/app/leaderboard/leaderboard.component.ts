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
                });
            });
    }
    selectContact(entry: Entry) {
        this.selectedEntry = entry;
    }
    private getIndexOfContact = (contactId: String) => {
        return this.entries.findIndex((contact) => {
            return contact.id === contactId;
        });
    }
}


export class Entry {
    id?: string;
    name: string;
    value: number;
}
