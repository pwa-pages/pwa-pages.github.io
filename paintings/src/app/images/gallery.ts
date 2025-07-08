import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { NgFor, NgIf } from "@angular/common"; // <-- Import NgFor
import { PaintingService } from "../service/paintings.service";
import { Painting } from "../models/painting";
import { Gallery, GalleryModule, GalleryItem, ImageItem } from "ng-gallery";
import { Lightbox, LightboxModule } from "ng-gallery/lightbox";

@Component({
  selector: "app-paintings",
  templateUrl: "./gallery.html",
  standalone: true,
  providers: [PaintingService],
  imports: [GalleryModule, LightboxModule, NgFor, NgIf], // <-- Add NgFor to imports
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
    this.paintings = this.paintingService.getPaintings().sort((a, b) => {
      if (a.year == null && b.year == null) return 0;
      if (a.year == null) return 1;
      if (b.year == null) return -1;
      return a.year - b.year;
    });

    this.items = this.paintings.map(
      (painting) =>
        new ImageItem({
          src: `assets/gen/images/${painting.id}_r.jpg`, // full size image path
          thumb: `assets/gen/images/${painting.id}.jpg`, // thumbnail path
          alt: `${painting.artist} - ${painting.year} - ${painting.dimensions}`,
        }),
    );

    this.gallery.ref("paintings").load(this.items);

    const randomIndex = Math.floor(Math.random() * this.paintings.length);
    const randomPainting = this.paintings[randomIndex];
    if (this.bg && randomPainting) {
      this.bg.nativeElement.style.backgroundImage = `url('assets/gen/images/${randomPainting.id}_bg.jpg')`;
    }
    this.onWindowScroll();
  }

  @ViewChild("bg", { static: true }) bg!: ElementRef<HTMLDivElement>;

  @HostListener("window:scroll", [])
  onWindowScroll() {
    const offset = window.scrollY;

    this.bg.nativeElement.style.top = `${offset * 0.3 - 29500}px`;
  }

  openLightbox(index: number) {
    this.lightbox.open(index, "paintings");
  }

  trackByPainting(index: number, painting: Painting): string {
    console.log(index);
    return painting.id;
  }
}
