import { Injectable } from "@angular/core";
import { Painting } from "../models/painting";

@Injectable({
  providedIn: "root",
})
export class PaintingService {
  private paintings: Painting[] = [
    {
      id: "64x50_frame1",
      title: "Andy Warhol is not dead",
      artist: "Alexander van den Bosch",
      year: 1988,
      dimensions: "50x64",
      status: "framed",
      type: "oilpainting",
    },
    {
      id: "75x54_frame2",
      title: "Oranje figuur",
      artist: "Alexander van den Bosch",
      year: 1985,
      dimensions: "75x54",
      status: "framed",
      type: "drawing",
    },
    {
      id: "120x100_rol1",
      title: "No Title",
      artist: "Alexander van den Bosch",
      dimensions: "100x120",
      status: "rolled",
      type: "oilpainting",
    },
    {
      id: "138x100_rol2",
      title: "No Title",
      artist: "Alexander van den Bosch",
      year: 1979,
      dimensions: "100x138",
      status: "rolled",
      type: "oilpainting",
    },
    {
      id: "64x50_frame3",
      title: "Inferno 4",
      artist: "Alexander van den Bosch",
      year: 1987,
      dimensions: "64x50",
      status: "framed",
      type: "drawing",
    },
    {
      id: "54x74_frame4",
      title: "No Title",
      artist: "Alexander van den Bosch",
      dimensions: "54x74",
      status: "framed",
      type: "oilpainting",
      note: "Damaged glass",
    },
  ];

  getPaintings(): Painting[] {
    return this.paintings;
  }
}
