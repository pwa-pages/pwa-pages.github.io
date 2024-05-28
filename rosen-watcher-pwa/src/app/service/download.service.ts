import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EventService, EventType } from './event.service';
import { catchError, map, mergeMap } from 'rxjs/operators';

import { lastValueFrom, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {


  constructor(private http: HttpClient, private eventService: EventService) { }
  
  downloadPermitInfo(watcherUrl: string) : Promise<any> {
    
    const url = watcherUrl + '/api/info';

    console.log('Downloading from: ' + url);
    return  firstValueFrom (this.http.get(url).pipe(
      map((results: any) => {
        
        return results;
      }),
      this.handleError()
    ));
  }

  downloadTransactions(address: string, offset: number = 0, limit: number = 500): Observable<any> {
    
    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;

    console.log('Downloading from: ' + url);

    this.eventService.sendEventWithData(EventType.StartDownload, url);
    return this.http.get(url).pipe(
      map((results: any) => {
        
        this.eventService.sendEventWithData(EventType.EndDownload, url);
        return results;
      }),
      this.handleError()
    );
  }

  private handleError() {
    return catchError((error: HttpErrorResponse) => {
      let errorMessage = '';
      if (error.error instanceof ErrorEvent) {

        errorMessage = `An error occurred: ${error.error.message}`;
      } else {

        errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
      }

      console.error(errorMessage);
      
      return throwError(() => new Error(errorMessage));
    });
  }
}

