import { Component, OnInit, NgZone, OnDestroy} from '@angular/core';

declare var communication: any;

@Component({
  selector: 'app-messagebox',
  templateUrl: './messagebox.component.html',
  styleUrls: ['./messagebox.component.css']
})

export class MessageboxComponent implements OnInit, OnDestroy {

    messages: Array<String>;
    chatBox: String;
    throttle = 300;
    scrollDistance = 2;

    constructor(private ngZone: NgZone) {
        this.messages = [];
        this.chatBox = 'Welcome friend';
    }
    ngOnDestroy() {
        window['my'].namespace.updateMsg = null;
    }
    ngOnInit(): void {
        window['my'] = window['my'] || {};
        window['my'].namespace = window['my'].namespace || {};
        window['my'].namespace.updateMsg = this.updateMsg.bind(this);
    }
    updateMsg(msg: string) {
        this.ngZone.run(() => this.messages.push(msg));
    }
    onScrollDown() {
        console.log('Scrolled');
    }
}
