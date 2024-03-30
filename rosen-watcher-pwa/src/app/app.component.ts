import { Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './data.service';
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
  
  constructor(private dataService: DataService) { 
  
    this.data = "aaaa";
  }
  
  ngOnInit(): void {
    this.dataService.downloadTransactions('9h9H4FJ7jWLZ4ZvJQ9BccWKewoXdAn4mfkqwmoh9HwqjP6oB63C')
      .pipe(
        map(response => JSON.stringify(JSON.parse(response), null, 2)) // Pretty print JSON
      )
      .subscribe(result => {
        this.data = result;
      });
  }

  title = 'rosen-watcher-pwa';
}
