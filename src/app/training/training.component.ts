import {Component, OnInit} from '@angular/core';
import {ScriptService} from '../Script.service';
import { Script } from '../Script';

declare var communication: any;

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.css'],
    providers: [ScriptService]
})
export class TrainingComponent implements OnInit {
    scripts: Script[];
    selectedScript: Script;
    constructor(private trainingService: ScriptService) {}

    ngOnInit(): void {
        this.trainingService
            .getScripts()
            .then((script: Script[]) => {
                this.scripts = script.map((script) => {
                    // TODO some mapping for raw script json
                    return script;
                });
            });
        communication.initGraphics();
    }
    onSelect(script: Script): void {
        this.selectedScript = script;
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

