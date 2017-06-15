
import {Component, Input, OnInit} from '@angular/core';
import {CodeEditorService} from "../code-editor.service";
import {ScriptService} from "../scripts/script.service";
import {Script} from "../scripts/script";

@Component({
  selector: 'app-codeSubmission',
  templateUrl: './codeSubmission.component.html',
  styleUrls: ['./codeSubmission.component.css'],
  providers: [CodeEditorService, ScriptService]
})

export class CodeSubmissionComponent implements OnInit{

  constructor(private codeEditorService: CodeEditorService, private scriptService: ScriptService) { }

  ngOnInit(): void{
    this.codeEditorService.loadCodeEditor();
  }

  submitScript() {
      let script: Script = {
          code : this.codeEditorService.getCode(),
          username : 'foo'
      };
      this.scriptService.createScript(script).then((newScript: Script) => {
          // TODO : tell user upload complete properly
          alert("Success!");
          console.log("%o", newScript);
      });
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
