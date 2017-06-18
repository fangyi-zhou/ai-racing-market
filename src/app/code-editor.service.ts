import { Injectable } from '@angular/core';

declare const ace: any;

@Injectable()
export class CodeEditorService {

    editor: [any];
    loaded: boolean = false;

    init() : void {
        // Allowing 10 code editors
        this.editor = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        this.loaded = true;
    }

    loadCodeEditor(editor="editor", num=0) : void {
        if (!this.loaded) {
            this.init();
        }
        this.editor[num] = ace.edit(editor);
        this.editor[num].setTheme("ace/theme/monokai");
        this.editor[num].getSession().setMode("ace/mode/python");
    }

    getCode(num=0) : string {
        return this.editor[num].getValue();
    }

    postCode(script: String, num=0): void {
        this.editor[num].setValue(script);
    }
}
