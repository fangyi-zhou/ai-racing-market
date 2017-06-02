import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';

import { AppComponent }  from './app.component';
import { DashboardComponent} from './dashboard/dashboard.component';
import { RoomComponent} from './rooms/room.component';

import { AppRoutingModule} from './app-rounting.module';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    RoomComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
