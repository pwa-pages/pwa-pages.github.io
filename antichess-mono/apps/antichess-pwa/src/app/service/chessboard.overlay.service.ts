import { Injectable, Injector } from '@angular/core'
import { Overlay, OverlayRef } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { ChessBoardComponent } from '../antichess/chessboard.component';


@Injectable({ providedIn: 'root' })
export class ChessBoardOverlayService {
  private overlayRef?: OverlayRef

  constructor(
    private overlay: Overlay,
    private injector: Injector
  ) {}

  open(options: { config: string; moveAnnotation?: string; editable?: boolean }) {
    // If already open, close first
    this.close()

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'chess-overlay-backdrop',
      panelClass: 'chess-overlay-panel',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    })

    this.overlayRef.backdropClick().subscribe(() => this.close())

    const portal = new ComponentPortal(ChessBoardComponent, null, this.injector)
    const componentRef = this.overlayRef.attach(portal)

    
    componentRef.instance.config = options.config;
    componentRef.instance.moveAnnotation = options.moveAnnotation ?? '';

    return componentRef.instance
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose()
      this.overlayRef = undefined
    }
  }
}