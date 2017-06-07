
import { Component, OnInit } from '@angular/core';

declare var mapBuilder: any;

@Component({
  selector: 'mapBuilder',
  templateUrl: './mapBuilder.component.html',
  styleUrls: ['./mapBuilder.component.css']
})

export class MapBuilderComponent implements OnInit {
  ngOnInit(): void {
    mapBuilder.initDraw();
  }
}
