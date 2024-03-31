import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './data.service';
import { StorageService } from './storage.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent implements OnInit {

  data: any;

  constructor(private dataService: DataService, private storageService: StorageService) {

    this.data = "aaaa";
  }

  ngOnInit(): void {

    var storageService = this.storageService;
    

    this.dataService.downloadTransactions('9h9H4FJ7jWLZ4ZvJQ9BccWKewoXdAn4mfkqwmoh9HwqjP6oB63C')
      .subscribe(result => {
        console.log(self);
        result.items.forEach((item : any) => {
          item.inputs.forEach((input : any) => {
            console.log(storageService);
            storageService.addData(input);
          });
          
      });

        this.data = result;
      });
  }

  title = 'rosen-watcher-pwa';
}
