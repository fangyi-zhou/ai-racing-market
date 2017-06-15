
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent} from './dashboard/dashboard.component';
import { RaceComponent} from './rooms/race.component';
import { LoginComponent } from './login/login.component';
import { CodeSubmissionComponent } from './codeSubmission/codeSubmission.component';
import { MapBuilderComponent } from './mapBuilder/mapBuilder.component';
import { LeaderBoardComponent } from './leaderboard/leaderboard.component';
import { LandingComponent } from './landing/landing.component';
import { StatisticsComponent} from './statistics/statistics.component';
import { TutorialComponent} from './tutorial/tutorial.component';
import { TrainingComponent} from './training/training.component';

const routes: Routes = [
    { path: '', redirectTo: '/app-landing', pathMatch: 'full' },
    { path: 'app-dashboard',  component: DashboardComponent },
    { path: 'app-race',     component: RaceComponent },
    { path: 'app-login', component: LoginComponent },
    { path: 'app-codeSubmission', component: CodeSubmissionComponent },
    { path: 'mapBuilder', component: MapBuilderComponent },
    { path: 'app-leaderboard', component: LeaderBoardComponent},
    { path: 'app-landing', component: LandingComponent},
    { path: 'app-statistics', component: StatisticsComponent},
    { path: 'app-tutorial', component: TutorialComponent},
    { path: 'app-training', component: TrainingComponent}
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
