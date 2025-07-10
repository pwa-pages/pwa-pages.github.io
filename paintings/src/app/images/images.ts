import { Component, OnInit, OnDestroy } from "@angular/core";
import { PaintingService } from "../service/paintings.service";
import { ActivatedRoute } from "@angular/router";
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

  constructor(
    private paintingService: PaintingService,
    private route: ActivatedRoute,
    private swipeService: SwipeService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.image = this.getCurrentPainting().id;
    });

    this.swipeService.registerSwipeDetect();

    window.addEventListener("keydown", this.handleKeyDown);
  }

  ngOnDestroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      this.swipeLeft();
    } else if (event.key === "ArrowRight") {
      this.swipeRight();
    }
  };

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
