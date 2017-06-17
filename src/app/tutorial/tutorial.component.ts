import { Component, OnInit } from '@angular/core';
import {ScriptService} from '../scripts/script.service';
import { Script } from '../scripts/script';
import { AuthService } from '../auth.service';

declare var communication: any;

interface Tutorials {
    a: boolean;
    b: boolean;
    c: boolean;
}

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.css']
})
export class TutorialComponent implements OnInit {

    tutorial: Tutorials = {
        a: false,
        b: false,
        c: false
    };

  constructor() { }

  ngOnInit() {
      communication.init(1339);
  }

    tutorial1() {
        return this.tutorial.a;
    }
    tryTutorial1() {
        this.tutorial.a = true;
        var tut1ScriptID = "";
    }
}
