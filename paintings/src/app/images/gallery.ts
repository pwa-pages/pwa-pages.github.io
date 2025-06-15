import { Component, OnInit } from "@angular/core";
import { NgFor } from "@angular/common"; // <-- Import NgFor
import { PaintingService } from "../service/paintings.service";
import { Painting } from "../models/painting";
import { Gallery, GalleryModule, GalleryItem, ImageItem } from "ng-gallery";
import { Lightbox, LightboxModule } from "ng-gallery/lightbox";

@Component({
  selector: "app-paintings",
  templateUrl: "./gallery.html",
  standalone: true,
  providers: [PaintingService],
  imports: [GalleryModule, LightboxModule, NgFor], // <-- Add NgFor to imports
})
export class GalleryComponent implements OnInit {
  title = "paintings";
  paintings: Painting[] = [];
  items: GalleryItem[] = [];

  constructor(
    private paintingService: PaintingService,
    public gallery: Gallery,
    private lightbox: Lightbox,
  ) {}

  ngOnInit(): void {
    this.paintings = this.paintingService.getPaintings();

    this.items = this.paintings.map(
      (painting) =>
        new ImageItem({
          src: `assets/images/${painting.id}.jpg`, // full size image path
          thumb: `assets/thumbnails/images/${painting.id}.jpg`, // thumbnail path
        }),
    );

    // Load images into the gallery reference 'paintings'
    this.gallery.ref("paintings").load(this.items);
  }

  openLightbox(index: number) {
    // Open the lightbox for the gallery 'paintings' at the given index
    this.lightbox.open(index, "paintings");
  }

  trackByPainting(index: number, painting: Painting): string {
    console.log(index);
    return painting.id;
  }
}
