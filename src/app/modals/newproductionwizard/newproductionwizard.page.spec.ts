import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewproductionwizardPage } from './newproductionwizard.page';

describe('NewproductionwizardPage', () => {
  let component: NewproductionwizardPage;
  let fixture: ComponentFixture<NewproductionwizardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewproductionwizardPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewproductionwizardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
