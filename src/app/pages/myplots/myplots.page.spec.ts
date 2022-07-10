import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyplotsPage } from './myplots.page';

describe('MyplotsPage', () => {
  let component: MyplotsPage;
  let fixture: ComponentFixture<MyplotsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyplotsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyplotsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
