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

  ngOnInit() {
      if (this.auth.loggedIn())
      {
          this.router.navigate(["./app-dashboard"]);
      }
      document.getElementById('hiddenDiv').style.visibility = 'hidden';
  }

    scrollLanding() {
        document.getElementById('hiddenDiv').style.visibility = 'visible'
        console.log('Scrolling down')
        // $("#hiddenDiv").animate({ scrollTop: 0 }, "fast");
    }
}
