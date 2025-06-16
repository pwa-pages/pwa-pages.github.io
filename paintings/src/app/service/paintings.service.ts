import { Injectable } from "@angular/core";
import { Painting } from "../models/painting";

@Injectable({
  providedIn: "root",
})
export class PaintingService {
  private paintings: Painting[] = [
    {
      id: "50x64_andy_warhol_is_not_dead",
      title: "Andy Warhol is not dead",
      artist: "Alexander van den Bosch",
      year: 1988,
      dimensions: "50x64",
    },
    {
      id: "75x54_oranje_figuur",
      title: "Oranje figuur",
      artist: "Alexander van den Bosch",
      year: 1985,
      dimensions: "75x54",
    },
    {
      id: "50x64_andy_warhol_is_not_dead",
      title: "Andy Warhol is not dead",
      artist: "Alexander van den Bosch",
      year: 1988,
      dimensions: "50x64",
    },
    {
      id: "75x54_oranje_figuur",
      title: "Oranje figuur",
      artist: "Alexander van den Bosch",
      year: 1985,
      dimensions: "75x54",
    },
    {
      id: "50x64_andy_warhol_is_not_dead",
      title: "Andy Warhol is not dead",
      artist: "Alexander van den Bosch",
      year: 1988,
      dimensions: "50x64",
    },
    {
      id: "75x54_oranje_figuur",
      title: "Oranje figuur",
      artist: "Alexander van den Bosch",
      year: 1985,
      dimensions: "75x54",
    },
    {
      id: "50x64_andy_warhol_is_not_dead",
      title: "Andy Warhol is not dead",
      artist: "Alexander van den Bosch",
      year: 1988,
      dimensions: "50x64",
    },
    {
      id: "75x54_oranje_figuur",
      title: "Oranje figuur",
      artist: "Alexander van den Bosch",
      year: 1985,
      dimensions: "75x54",
    },
    {
      id: "50x64_andy_warhol_is_not_dead",
      title: "Andy Warhol is not dead",
      artist: "Alexander van den Bosch",
      year: 1988,
      dimensions: "50x64",
    },
    {
      id: "75x54_oranje_figuur",
      title: "Oranje figuur",
      artist: "Alexander van den Bosch",
      year: 1985,
      dimensions: "75x54",
    },
    {
      id: "50x64_andy_warhol_is_not_dead",
      title: "Andy Warhol is not dead",
      artist: "Alexander van den Bosch",
      year: 1988,
      dimensions: "50x64",
    },
    {
      id: "75x54_oranje_figuur",
      title: "Oranje figuur",
      artist: "Alexander van den Bosch",
      year: 1985,
      dimensions: "75x54",
    },
    {
      id: "50x64_andy_warhol_is_not_dead",
      title: "Andy Warhol is not dead",
      artist: "Alexander van den Bosch",
      year: 1988,
      dimensions: "50x64",
    },
    {
      id: "75x54_oranje_figuur",
      title: "Oranje figuur",
      artist: "Alexander van den Bosch",
      year: 1985,
      dimensions: "75x54",
    },
  ];

  getPaintings(): Painting[] {
    return this.paintings;
  }
}
