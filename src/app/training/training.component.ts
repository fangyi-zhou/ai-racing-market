import {Component, OnInit, NgZone, OnDestroy} from '@angular/core';
import {ScriptService} from '../scripts/script.service';
import { Script } from '../scripts/script';
import { AuthService } from '../auth.service';

declare var communication: any;

// class Options {
//     chart: any;
//     title: any;
//     series: Data[];
// }
// class Data {
//     data: number[]
// }

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.css'],
    providers: [ScriptService, AuthService]
})
export class TrainingComponent implements OnInit, OnDestroy {
    scripts: Script[];
    selectedScript: Script;
    options: any;
    constructor(private trainingService: ScriptService, private auth: AuthService, private ngZone: NgZone) {
        this.options = {
            chart: { type: 'spline' },
            title : { text : 'Performance' },
            series: [{
                name: 'Epoch',
                data: []
            }]
        };
    }
    ngOnInit(): void {
        if (this.auth.loggedIn()) {
            this.trainingService
                .getUserScript(this.auth.userName())
                .then((script: Script[]) => {
                    this.scripts = script.map((script) => {
                        // TODO some mapping for raw script json
                        return script;
                    });
                    console.log(this.scripts);
                });
        }
        communication.initGraphics();
        window['my'] = window['my'] || {};
        window['my'].namespace = window['my'].namespace || {};
        window['my'].namespace.updateStats = this.updateStats.bind(this);
    }
    updateStats(point: string): void {
        this.ngZone.run(() => this.updateStatshelper(point));
    }
    updateStatshelper(point: string): void {
        const dummy = this.options.series[0].data;
        dummy.push(parseFloat(point));
        this.options = {
            chart: { type: 'spline' },
            title : { text : 'Performance' },
            series: [{
                name: 'Epoch',
                data: dummy
            }]
        };
    }
    onSelect(script: Script): void {
        this.selectedScript = script;
    }
    ngOnDestroy(): void {
        window['my'].namespace.publicFunc = null;
    }
    trainAi(script: Script): void {
        // TODO: clear graphics
        communication.disconnectOnSwap();
        communication.init(1337);
        communication.train(script._id);
    }
    zoomIn(): void {
        communication.zoomIn();
    }
    zoomOut(): void {
        communication.zoomOut();
    }
    switchCar(): void {
        communication.switchCar();
    }
}

