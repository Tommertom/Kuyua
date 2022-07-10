import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MarketplacePage } from './marketplace.page';

describe('MarketplacePage', () => {
  let component: MarketplacePage;
  let fixture: ComponentFixture<MarketplacePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplacePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
