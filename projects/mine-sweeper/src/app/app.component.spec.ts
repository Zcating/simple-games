import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { GameState } from './mine-sweeper.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should has these values', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const keys = Object.keys(app.containerStyle);
    expect(keys[0]).toEqual('grid-template-columns');
    expect(keys[1]).toEqual('grid-template-rows');
    expect(app.blockClassMap[0]).toEqual('mine-block-is-unknown');
    expect(app.blockClassMap[1]).toEqual('mine-block-is-found');
    expect(app.blockClassMap[3]).toEqual('mine-block-is-mine');
  });

  it('should clicked mine', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const blockElements = (fixture.nativeElement as Element).getElementsByClassName('mine-block') as HTMLCollectionOf<HTMLDivElement>;
    fixture.autoDetectChanges();

    let isMineClicked = false;
    app.blocks$.subscribe((value) => {
      if (isMineClicked) {
        return;
      }
      expect(value.length).toEqual(app.side ** 2);
      expect(value.length).toEqual(blockElements.length);
      for(let i = 0; i < value.length; i++) {
        if (value[i].isMine) {          
          blockElements.item(i).click();
          isMineClicked = true;
          fixture.detectChanges();
        }
      }
    });

    app.state$.subscribe((value) => {
      expect(isMineClicked).toEqual(value === GameState.LOST);
    });
        
  });


});
