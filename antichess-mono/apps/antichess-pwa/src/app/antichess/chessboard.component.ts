import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core'

import { Chessground } from 'chessground'
import type { Api } from 'chessground/api'

@Component({
  selector: 'app-chessboard',
  standalone: true,
  templateUrl: './chessboard.html'
})
export class ChessBoardComponent implements AfterViewInit, OnChanges {

  @ViewChild('board', { static: true }) board!: ElementRef

  @Input() fen: string = ''
  @Input() moveAnnotation: string = ''
  @Input() editable = false

  private cg!: Api

  ngAfterViewInit() {
    this.cg = Chessground(this.board.nativeElement, {
      fen: this.fen,
      orientation: 'white',
      coordinates: true,
      movable: {
        free: this.editable,
        color: this.editable ? 'both' : undefined
      }
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.cg && changes['fen']) {
      this.cg.set({ fen: this.fen })
    }
  }
}