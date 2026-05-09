import {
  Component,
  Input,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceWorkerService } from '../service/service.worker.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class HeaderComponent implements OnInit {


  constructor(private serviceWorkerService: ServiceWorkerService
  ) {


  }
  @Input() text = '';
  notifyVisible(): boolean {
    return this.serviceWorkerService.isVersionUpdating();
  }

    notifyText(): string {
    if(this.serviceWorkerService.isVersionUpdating()) {
      return 'Installing new version, pls reload app or reload page when done...';
    }
    return '';
  }

  async ngOnInit(): Promise<void> {




  }
}
