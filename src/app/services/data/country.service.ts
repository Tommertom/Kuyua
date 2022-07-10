import { Injectable } from '@angular/core';

import { Country } from '../../interfaces/Country';
import { HttpClient } from '@angular/common/http';
import { first, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  myData: Country[] = [];

  constructor(private http: HttpClient) {
    this.getCountrys$().pipe(
      take(1)
      // first()
    ).subscribe(_ => { });
  }

  getCountrys$() {
    return this.http.get<{
      items: Country[]
    }>('assets/json/countries.json')
      .pipe(map(data => {
        this.myData = data.items;
        return data.items;
      }));
  }

  getCountryDataByCountryCode(countryCode: string) {
    const returnArray = this.myData.filter(country => country.countryID === countryCode);
    return returnArray[0];
  }

  getCountryDataByPhoneCode(phoneCode: string) {
    const returnArray = this.myData.filter(country => country.phoneCode === phoneCode);
    return returnArray[0];
  }

  getCountries() {
    return this.myData;
  }

  getAllCountryIDs() {
    return this.getCountries().map(country => country.countryID);
  }

  getCountryPhoneCodes(): string[] {
    return this.myData.map(country => country.phoneCode);
  }
}
