import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './statistics/navigation.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterOutlet, NavigationComponent],
})
export class AppComponent {
  title = 'rosen-watcher-pwa';
}
