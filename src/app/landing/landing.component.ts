import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth.service";
import {Router} from "@angular/router";


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) { }

    scrolledDown : boolean = false;

  ngOnInit() {
      if (this.auth.loggedIn())
      {
          this.router.navigate(["./app-dashboard"]);
      }
  }

    hasScrolled() {
        return this.scrolledDown;
    }

    scrollLanding() {
        this.scrolledDown = !this.scrolledDown;
        // $("#hiddenDiv").animate({ scrollTop: 0 }, "fast");
    }
}
