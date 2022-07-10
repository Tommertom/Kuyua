import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewproductionPage } from './viewproduction.page';

describe('ViewproductionPage', () => {
  let component: ViewproductionPage;
  let fixture: ComponentFixture<ViewproductionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewproductionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewproductionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
