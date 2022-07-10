import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewplotwizardPage } from './newplotwizard.page';

describe('NewplotwizardPage', () => {
  let component: NewplotwizardPage;
  let fixture: ComponentFixture<NewplotwizardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewplotwizardPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewplotwizardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
