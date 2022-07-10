import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewplotPage } from './viewplot.page';

describe('ViewplotPage', () => {
  let component: ViewplotPage;
  let fixture: ComponentFixture<ViewplotPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewplotPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewplotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
