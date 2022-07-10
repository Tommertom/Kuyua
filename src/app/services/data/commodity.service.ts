import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';

import { Commodity } from '../../interfaces/commodity';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommodityService {

  constructor(private http: HttpClient) { }

  getCommoditys$() {
    return this.http.get<{
      items: Commodity[]
    }>('assets/json/commodities.json')
      .pipe(map(data => data.items));
  }

}
