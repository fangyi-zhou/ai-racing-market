import { Injectable } from '@angular/core';

declare const ace: any;

@Injectable()
export class CodeEditorService {

    editor: any;

    loadCodeEditor(editor="editor") : void {
        this.editor = ace.edit(editor);
        this.editor.setTheme("ace/theme/monokai");
        this.editor.getSession().setMode("ace/mode/python");
    }

    getCode() : string {
        return this.editor.getValue();
    }

    postCode(script: String): void {
        this.editor.setValue(script);
    }
}
