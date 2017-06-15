
import {Component, Input, OnInit} from '@angular/core';
import {CodeEditorService} from "../code-editor.service";
import {ScriptService} from "../scripts/script.service";
import {Script} from "../scripts/script";
import {AuthService} from '../auth.service'
import {isUndefined} from "util";

@Component({
  selector: 'app-codeSubmission',
  templateUrl: './codeSubmission.component.html',
  styleUrls: ['./codeSubmission.component.css'],
  providers: [CodeEditorService, ScriptService, AuthService]
})

export class CodeSubmissionComponent implements OnInit{
    script = new Script();
  defaultCode = "import sys";
  constructor(private codeEditorService: CodeEditorService, private scriptService: ScriptService, private auth: AuthService) { }

  ngOnInit(): void{
      this.script.username = "";
    this.codeEditorService.loadCodeEditor();
    this.codeEditorService.postCode(this.defaultCode);
  }

  submitScript() {
      console.log(this.script.scriptName);
      if (isUndefined(this.script.scriptName)) {
          alert("need name field");
      }else{
          this.script.code = this.codeEditorService.getCode();
          this.script.username = this.auth.userName();
          this.scriptService.createScript(this.script).then((newScript: Script) => {
              // TODO : tell user upload complete properly
              alert("Success!");
              console.log("%o", newScript);
          });
      }
  };
    changeListener($event): void {
        this.readThis($event.target);
    }

    readThis(inputValue: any): void {
        const file : File = inputValue.files[0];
        const myReader: FileReader = new FileReader();

        myReader.onloadend = (e) => {
            // you can perform an action with readed data here
            console.log(myReader.result);
            this.codeEditorService.postCode(myReader.result);
        };

        myReader.readAsText(file);
    }
}
