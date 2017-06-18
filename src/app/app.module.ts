import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {OrderModule} from "ngx-order-pipe";
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import {AppComponent} from "./app.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {RaceComponent} from "./rooms/race.component";
import {LoginComponent} from "./login/login.component";
import {CodeSubmissionComponent} from "./codeSubmission/codeSubmission.component";
import {MapBuilderComponent} from "./mapBuilder/mapBuilder.component";
import {LeaderBoardComponent} from "./leaderboard/leaderboard.component";
import {LandingComponent} from './landing/landing.component';

import {AppRoutingModule} from "./app-rounting.module";
import {HttpModule} from "@angular/http";
import { StatisticsComponent } from './statistics/statistics.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { TrainingComponent } from './training/training.component';
import { ChallengeComponent } from './challenges/challenges.component';
import { PlayAgainstAIComponent } from './playAgainstAI/playAgainstAI.component';
import { MessageboxComponent } from './rooms/messagebox/messagebox.component';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpModule,
        OrderModule,
        AngularMultiSelectModule,
        InfiniteScrollModule
    ],
    declarations: [
        AppComponent,
        DashboardComponent,
        RaceComponent,
        LoginComponent,
        CodeSubmissionComponent,
        MapBuilderComponent,
        LeaderBoardComponent,
        LandingComponent,
        StatisticsComponent,
        TutorialComponent,
        TrainingComponent,
        ChallengeComponent,
        MessageboxComponent,
        PlayAgainstAIComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
