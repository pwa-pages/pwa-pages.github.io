import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  Renderer2,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PaintingService } from "../service/paintings.service";
import { SwipeService } from "../service/swipe.service";
import { NgFor, NgIf } from "@angular/common";
import { Painting } from "../models/painting";

@Component({
  selector: "app-image",
  templateUrl: "./image.html",
  standalone: true,
  providers: [PaintingService],
  imports: [NgFor, NgIf],
})
export class ImagesComponent implements OnInit, OnDestroy {
  image = 0;
  title = "paintings";

  @ViewChild("paintingImage", { static: true }) paintingImage!: ElementRef;

  private globalClickUnlistener!: () => void;

  constructor(
    private paintingService: PaintingService,
    private route: ActivatedRoute,
    private swipeService: SwipeService,
    private renderer: Renderer2,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.image = this.getCurrentPainting().id;
    });

    this.swipeService.registerSwipeDetect();

    window.addEventListener("keydown", this.handleKeyDown);

    // Handle clicks outside the image
    this.globalClickUnlistener = this.renderer.listen(
      "document",
      "click",
      (event: MouseEvent) => {
        this.handleDocumentClick(event);
      },
    );
  }

  ngOnDestroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    if (this.globalClickUnlistener) this.globalClickUnlistener();
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      this.swipeLeft();
    } else if (event.key === "ArrowRight") {
      this.swipeRight();
    }
  };

  handleDocumentClick(event: MouseEvent) {
    if (!this.paintingImage?.nativeElement?.contains(event.target)) {
      // Navigate back to gallery (adjust route if needed)
      this.router.navigate(["."]);
    }
  }

  getCurrentPainting(): Painting {
    const paintings = this.paintingService.getPaintings();
    const currentId = this.route.snapshot.paramMap.get("image");
    return paintings.find((p) => String(p.id) === currentId) ?? paintings[0];
  }

  getNextImageUrl(): string {
    return this.paintingService.getNextImageUrl(this.image);
  }

  getPrevImageUrl(): string {
    return this.paintingService.getPrevImageUrl(this.image);
  }

  public swipeRight() {
    this.swipeService.swipe("left", this.getNextImageUrl());
  }

  public swipeLeft() {
    this.swipeService.swipe("right", this.getPrevImageUrl());
  }
}
