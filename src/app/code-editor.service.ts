import { Injectable } from '@angular/core';

declare const ace: any;

@Injectable()
export class CodeEditorService {

    loadCodeEditor() {
        console.log("executed");
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/python");
    }
}
