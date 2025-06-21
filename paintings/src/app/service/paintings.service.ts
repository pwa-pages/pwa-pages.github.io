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
      artist: "Alexander van den Bosch",
      dimensions: "100x120",
      status: "rolled",
      type: "oilpainting",
    },
    {
      id: "138x100_rol2",
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
      artist: "Alexander van den Bosch",
      dimensions: "54x74",
      status: "framed",
      type: "oilpainting",
      note: "Damaged glass",
    },
    {
      id: "47x58_frame5",
      artist: "Alexander van den Bosch",
      year: 1988,
      dimensions: "47x58",
      status: "framed",
      type: "drawing",
      note: "Damaged glass",
    },
    {
      id: "75x56_frame6",
      artist: "Alexander van den Bosch",
      year: 1977,
      dimensions: "75x56",
      status: "framed",
      type: "oilpainting",
    },
    {
      id: "70x85_frame7",
      artist: "Alexander van den Bosch",
      dimensions: "70x85",
      status: "framed",
      type: "oilpainting",
    },
    {
      id: "121x96_frame8",
      title: "Zeilbootje bij kalme zee",
      artist: "Alexander van den Bosch",
      year: 1978,
      dimensions: "121x96",
      status: "framed",
      type: "oilpainting",
    },
    {
      id: "121x100_frame9",
      title: "De speelgoedhoek",
      artist: "Alexander van den Bosch",
      year: 1984,
      dimensions: "121x100",
      status: "framed",
      type: "oilpainting",
    },
    {
      id: "100x120_frame10",
      title: "IJshockiers",
      artist: "Alexander van den Bosch",
      year: 1984,
      dimensions: "100x120",
      status: "framed",
      type: "oilpainting",
    },
    {
      id: "100x140_frame11",
      artist: "Alexander van den Bosch",
      year: 1980,
      dimensions: "100x140",
      status: "framed",
      type: "oilpainting",
    },
    {
      id: "100x140_frame12",
      artist: "Alexander van den Bosch",
      year: 1980,
      dimensions: "100x140",
      status: "framed",
      type: "oilpainting",
    },
  ];

  getPaintings(): Painting[] {
    return this.paintings;
  }
}
