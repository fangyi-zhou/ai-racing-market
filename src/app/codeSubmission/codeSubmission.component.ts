
import { Component, OnInit } from '@angular/core';
import {CodeEditorService} from "../code-editor.service";

@Component({
  selector:'codeSubmission',
  templateUrl:'./codeSubmission.component.html',
  styleUrls:['./codeSubmission.component.css'],
  providers:[CodeEditorService]
})

export class CodeSubmissionComponent implements OnInit{

  constructor(private codeEditorService: CodeEditorService) { }

  ngOnInit():void{
    this.codeEditorService.loadCodeEditor();
  }

    onSubmit() {
        this.codeEditorService.foo();
    }
}
