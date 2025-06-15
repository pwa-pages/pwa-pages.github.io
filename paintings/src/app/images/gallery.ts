import { Component, OnInit } from "@angular/core";
 // <-- Import NgFor
import { PaintingService } from "../service/paintings.service";
import { Painting } from "../models/painting";
import "chartjs-adapter-date-fns";

@Component({
  selector: "app-paintings",
  templateUrl: "./gallery.html",
  standalone: true,
  providers: [PaintingService],
  imports: [] 
})
export class GalleryComponent implements OnInit {
  title = "paintings";
  paintings: Painting[] = [];

  constructor(private paintingService: PaintingService) {}

  ngOnInit(): void {
    this.paintings = this.paintingService.getPaintings();
  }
}
