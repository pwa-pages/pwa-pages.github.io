import { Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataService } from './data.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  data: string;
  
  constructor(private dataService: DataService) { 
  
    this.data = "aaaa";
  }
  
  ngOnInit(): void {
    //this.data = this.dataService.getData();
  }

  title = 'rosen-watcher-pwa';
}
