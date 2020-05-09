import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZcatComponent } from './zcat.component';

describe('ZcatComponent', () => {
  let component: ZcatComponent;
  let fixture: ComponentFixture<ZcatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZcatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZcatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
