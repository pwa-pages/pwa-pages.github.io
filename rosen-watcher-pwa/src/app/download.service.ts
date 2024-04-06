import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  readonly initialNDownloads: number = 5;
  readonly fullDownloadsBatchSize: number = 20;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  downloadTransactions(address: string, existingInputs: any[], offset: number = 0, limit: number = 500): Observable<any> {

    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;

    console.log('Downloading from: ' + url);
    return this.http.get(url).pipe(
      map((results: any) => {
        var lastBoxIdInDownload = -1;
        results.items.forEach((result: any) => {
          result.inputs.forEach((input: any) => {
            lastBoxIdInDownload = input.boxId;
          });  
        });

        console.log('Found lastBoxIdInDownload: ' + lastBoxIdInDownload);

        return results;
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {

          errorMessage = `An error occurred: ${error.error.message}`;
        } else {

          errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
        }

        console.error(errorMessage);
        this.snackBar.open('Some download(s) failed, possibly some addresses were not added', 'Close', {
          duration: 5000,
          panelClass: ['custom-snackbar']
        });

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}

