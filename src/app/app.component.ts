import { Component } from '@angular/core';
import { AuthService } from './auth.service';
@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
    providers: [AuthService]
})
export class AppComponent {
    title = 'AI Racing Market';
    constructor(private auth: AuthService) {}
}


/*
 Copyright 2017 Google Inc. All Rights Reserved.
 Use of this source code is governed by an MIT-style license that
 can be found in the LICENSE file at http://angular.io/license
 */
