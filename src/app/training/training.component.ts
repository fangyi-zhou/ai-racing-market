import {Component, OnInit} from '@angular/core';
import {TrainingService} from '../training.service';
import { Script } from '../Script';

declare var communication: any;

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrls: ['./training.component.css'],
    providers: [TrainingService]
})
export class TrainingComponent implements OnInit {
    title = 'AI racing rooms';
    scripts: Script[];
    selectedScript: Script;
    constructor(private trainingService: TrainingService) {}

    ngOnInit(): void {
        this.trainingService
            .getScripts()
            .then((script: Script[]) => {
                this.scripts = script.map((script) => {
                    // TODO some mapping for raw sim json
                    return script;
                });
            });
        communication.initGraphics();
    }
    onSelect(script: Script): void {
        if (this.selectedScript === script) {
        }else {
            communication.disconnectOnSwap();
            this.selectedScript = script;
            communication.init(script);
        }
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

