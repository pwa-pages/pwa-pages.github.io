// src/app/data.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getData(): string {
    return 'Hello from DataService';
  }

  downloadTransactions(address: string, offset: number = 0, limit: number = 500): Observable<any> {
    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;
    return this.http.get(url,  { responseType: 'text' });
  }
}
