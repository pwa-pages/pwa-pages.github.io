// src/app/data.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  downloadTransactions(address: string, offset: number = 0, limit: number = 500): Observable<any> {
    
    const url = `https://api.ergoplatform.com/api/v1/addresses/${address}/transactions?offset=${offset}&limit=${limit}`;

    console.log('Downloading from: ' + url);
    return this.http.get(url).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `An error occurred: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
        }
        // You can handle the error here or log it, then re-throw it
        console.error(errorMessage);
        this.snackBar.open('Some download(s) failed, failed addresses not added', 'Close', {
          duration: 5000, // Adjust as needed
          panelClass: ['custom-snackbar'] // Add custom CSS class
        });

        return throwError(() => new Error(errorMessage));
        
      })
    );
  }

}

