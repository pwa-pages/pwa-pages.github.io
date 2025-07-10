import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { PaintingService } from "../service/paintings.service";
import { Painting } from "../models/painting";

@Component({
  selector: "app-paintings",
  templateUrl: "./gallery.html",
  standalone: true,
  providers: [PaintingService],
  imports: [NgFor, NgIf],
})
export class GalleryComponent implements OnInit {
  title = "paintings";
  paintings: Painting[] = [];

  constructor(private paintingService: PaintingService) {}

  ngOnInit(): void {
    this.paintings = this.paintingService.getPaintings();

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

  trackByPainting(index: number, painting: Painting): number {
    console.log(index);
    return painting.id;
  }
}
