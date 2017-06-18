import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayAgainstAIComponent } from './playAgainstAI.component';

describe('PlayAgainstAIComponent', () => {
  let component: PlayAgainstAIComponent;
  let fixture: ComponentFixture<PlayAgainstAIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayAgainstAIComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayAgainstAIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
