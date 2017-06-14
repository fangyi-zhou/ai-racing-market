
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent} from './dashboard/dashboard.component';
import { RoomComponent} from './rooms/room.component';
import { LoginComponent } from './login/login.component';
import { CodeSubmissionComponent } from './codeSubmission/codeSubmission.component';
import { MapBuilderComponent } from './mapBuilder/mapBuilder.component';
import { LeaderBoardComponent } from './leaderboard/leaderboard.component';
import { LandingComponent } from './landing/landing.component';
import { StatisticsComponent} from './statistics/statistics.component';
import { TutorialComponent} from './tutorial/tutorial.component';

const routes: Routes = [
    { path: '', redirectTo: '/landing', pathMatch: 'full' },
    { path: 'dashboard',  component: DashboardComponent },
    { path: 'rooms',     component: RoomComponent },
    { path: 'login', component: LoginComponent },
    { path: 'codeSubmission', component: CodeSubmissionComponent },
    { path: 'mapBuilder', component: MapBuilderComponent },
    { path: 'leaderboard', component: LeaderBoardComponent},
    { path: 'landing', component: LandingComponent},
    { path: 'app-statistics', component: StatisticsComponent},
    { path: 'app-tutorial', component: TutorialComponent}
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
