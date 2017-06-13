import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";

import {AppComponent} from "./app.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {RoomComponent} from "./rooms/room.component";
import {LoginComponent} from "./login/login.component";
import {CodeSubmissionComponent} from "./codeSubmission/codeSubmission.component";
import {MapBuilderComponent} from "./mapBuilder/mapBuilder.component";
import {LeaderBoardComponent} from "./leaderboard/leaderboard.component";

import {AppRoutingModule} from "./app-rounting.module";
import {HttpModule} from "@angular/http";



@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpModule
    ],
    declarations: [
        AppComponent,
        DashboardComponent,
        RoomComponent,
        LoginComponent,
        CodeSubmissionComponent,
        MapBuilderComponent,
        LeaderBoardComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
