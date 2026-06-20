import { Component, ElementRef, ViewChild, AfterViewInit, Input, OnChanges, OnInit } from '@angular/core'
import { Chessground } from 'chessground'
import type { Api } from 'chessground/api'
import { EventService, EventType } from '../service/event.service';

@Component({
  selector: 'app-chessboard',
  standalone: true,
  templateUrl: './chessboard.html'
})

export class ChessBoardComponent implements AfterViewInit, OnChanges, OnInit {

  constructor(

    private eventService: EventService
  ) {



  }


  ngOnInit(): void {
    this.setMoveAnnotation()
  }
  @ViewChild('board', { static: true }) board!: ElementRef

  @Input() closable: boolean = true
  @Input() config: string = 'guide_king'
  private baseDrawable = {
    enabled: true,
    visible: true,

    brushes: {
      black: {
        key: 'b',
        color: '#000000',
        opacity: 1,
        lineWidth: 10
      },

      white: {
        key: 'w',
        color: '#ffffff',
        opacity: 1,
        lineWidth: 10
      }
    }
  }


  public close(): void {
    this.eventService.sendEvent(EventType.CloseChessBoard);
  }


  ngOnDestroy(): void {

  }

  public moveAnnotation: string = ''
  private cg!: Api
  private makeAutoShapes(locations: string[], brush: string) {
    return locations.map(loc => ({ orig: loc, brush }))
  }

  private combineAutoShapes(groups: Record<string, string[]>): any[] {
    return Object.keys(groups).reduce((acc, brush) => {
      return acc.concat(this.makeAutoShapes(groups[brush], brush))
    }, [] as any[])
  }

  private configMap: Record<string, any> = {
    guide_king: {
      fen: 'n5r1/p5p1/8/8/8/p1K4p/P6P/R7 b - - 1 1',
      orientation: 'white', coordinates: false,
      movable: { free: true, color: 'both' },
      animation: { duration: 200, enabled: true },
      disableContextMenu: true,
      drawable: {
        ...this.baseDrawable,
        enabled: true, visible: true,
        autoShapes: [

        ]
      },
      moveAnnotation: 'Without a king white is forced to have his long range rook opened up eventually which will lose hime the game. The king is not covering the whole board so is not forced to capture blacks pieces like long range pieces would do.'
    },

    guide_coverage: {
      fen: 'rn1k4/ppp5/8/8/8/3P4/PPP5/RNB1KR2 w - - 0 1',
      orientation: 'white', coordinates: false,
      movable: { free: true, color: 'both' },
      lastMove: ['e2', 'e4'],
      drawable: {
        ...this.baseDrawable,
        enabled: true, visible: true,
        autoShapes: [
          ...this.combineAutoShapes({
            black: ['c8', 'e8', 'd7', 'e7', 'a6', 'b6', 'c6', 'd6', 'a5', 'b5', 'c5'],
            white: [
              'd1', 'g1', 'h1', 'd2', 'e2', 'f2', 'a3', 'b3', 'c3', 'e3', 'f3', 'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'f5', 'g5', 'f6', 'h6', 'f7', 'f8'
            ]
          })
        ]
      },
      animation: { duration: 200, enabled: true },
      disableContextMenu: true,
      moveAnnotation: 'White covers a big part of the board, restricting choices of black, which beneficial for white.'
    },

    rules_stalemate: {
      fen: 'r4b2/p1pn3r/P3p3/8/8/8/8/8 w - - 0 20',
      orientation: 'white', coordinates: false, disableContextMenu: true,
      moveAnnotation: 'White to move. White cannot make a move so wins the game.',
      drawable: {
        ...this.baseDrawable,
        enabled: true, visible: true,
        autoShapes: [

        ]
      }
    },

    guide_rook: {
      fen: '8/8/8/3k4/8/8/8/7R w - - 0 1',
      orientation: 'white', coordinates: false, disableContextMenu: true,
      moveAnnotation: 'Rooks are good against pawns, and can give mate on its own against a king, one of the reasons people like to keep rooks. (<a href="https://lichess.org/study/fXx4u9R5/vj24sHOb" target="_blank" rel="noopener noreferrer">See on lichess</a>)',
      drawable: {
        ...this.baseDrawable,
        enabled: true, visible: true,
        autoShapes: [

        ]
      }
    }
    ,

    guide_intermediate: {
      fen: '4k1n1/ppp2pp1/4p3/8/6n1/N3P3/PPP1K3/R1B5 w - - 0 3',
      orientation: 'white', coordinates: false, disableContextMenu: true,
      moveAnnotation: 'Intermediate moves can be played when ones pieces are attacked and you can attack an undefended piece, in this case the intermediate is Nb4. (<a href="https://lichess.org/study/fXx4u9R5/nUPHwGg9" target="_blank" rel="noopener noreferrer">See on lichess</a>)',
      drawable: {
        ...this.baseDrawable,
        enabled: true, visible: true,
        autoShapes: [

        ]
      }
    }
    ,

    guide_queen: {
      fen: '4k3/1pp3pp/8/8/8/4P3/2KP4/3Q4 w - - 0 1',
      orientation: 'white', coordinates: false, disableContextMenu: true,
      moveAnnotation: 'Unless whites queen has some substantial space safely covered on the board it may be safe, but often it is not, for example here against normally weak pawns in endgame. (<a href="https://lichess.org/study/fXx4u9R5/mvfkwbvo" target="_blank" rel="noopener noreferrer">See on lichess</a>)',
      drawable: {
        ...this.baseDrawable,
        enabled: true, visible: true,
        autoShapes: [

        ]
      }
    },

    guide_bishop: {
      fen: 'rn1qkbnr/ppp1pppp/8/3p4/6b1/4P3/PPPP1PPP/RNBK1BNR b - - 1 3',
      orientation: 'white', coordinates: false, disableContextMenu: true,
      moveAnnotation: 'White has an easy time having its pieces taken by blacks bishop. (<a href="https://lichess.org/study/fXx4u9R5/BBchgJfg" target="_blank" rel="noopener noreferrer">See on lichess</a>)',
      drawable: {
        ...this.baseDrawable,
        enabled: true, visible: true,
        autoShapes: [

        ]
      }
    }


  }

  ngAfterViewInit() {
    const cfg = this.getConfig(this.config)
    this.cg = Chessground(this.board.nativeElement, cfg)
    this.setMoveAnnotation()
  }
  private setMoveAnnotation(): void {
    this.moveAnnotation = this.getConfig(this.config).moveAnnotation ?? ''
  }

  ngOnChanges() {
    const cfg = this.getConfig(this.config)
    if (this.cg) {
      this.cg.set(cfg)
    } else if (this.board && this.board.nativeElement) {
      this.cg = Chessground(this.board.nativeElement, cfg)
    }
    this.setMoveAnnotation()

  }

  private getConfig(key: string): any { return this.configMap[key] ?? {} }
}
