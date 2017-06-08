
import {Component, Input, OnInit} from '@angular/core';
import {CodeEditorService} from "../code-editor.service";
import {ScriptService} from "../scripts/script.service";
import {Script} from "../scripts/script";

@Component({
  selector:'codeSubmission',
  templateUrl:'./codeSubmission.component.html',
  styleUrls:['./codeSubmission.component.css'],
  providers:[CodeEditorService, ScriptService]
})

export class CodeSubmissionComponent implements OnInit{

  constructor(private codeEditorService: CodeEditorService, private scriptService: ScriptService) { }

  ngOnInit():void{
    this.codeEditorService.loadCodeEditor();
  }

  submitScript() {
      let script: Script = {
          code : this.codeEditorService.getCode()
      };
      this.scriptService.createScript(script).then((newScript: Script) => {
          // TODO : tell user upload complete
          console.log("%o", newScript);
      });
  };
}
