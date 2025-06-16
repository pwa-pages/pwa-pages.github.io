import { Injectable } from "@angular/core";
import { Painting } from "../models/painting";

@Injectable({
  providedIn: "root",
})
export class PaintingService {
  private paintings: Painting[] = [
    {
      id: "50x64_frame1",
      title: "Andy Warhol is not dead",
      artist: "Alexander van den Bosch",
      year: 1988,
      dimensions: "50x64",
      status: "framed",
    },
    {
      id: "75x54_frame2",
      title: "Oranje figuur",
      artist: "Alexander van den Bosch",
      year: 1985,
      dimensions: "75x54",
      status: "framed",
    },
    {
      id: "100x120_rol1",
      title: "No Title",
      artist: "Alexander van den Bosch",
      year: 0,
      dimensions: "100x120",
      status: "rolled",
    },
    {
      id: "100x138_rol2",
      title: "No Title",
      artist: "Alexander van den Bosch",
      year: 1979,
      dimensions: "100x138",
      status: "rolled",
    },
  ];

  getPaintings(): Painting[] {
    return this.paintings;
  }
}
