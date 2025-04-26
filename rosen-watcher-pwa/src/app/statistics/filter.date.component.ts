import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-date',
  templateUrl: './filter.date.html',
  standalone: true,
  imports: [MatDatepickerModule, MatInputModule, MatNativeDateModule, FormsModule],
})
export class FilterDateComponent {
  constructor(private eRef: ElementRef) {}

  @Input() fromDate: Date | null = null;
  @Input() toDate: Date | null = null;
  @Output() dateRangeChanged = new EventEmitter<{ from: Date | null; to: Date | null }>();
  @Output() dateRangeCanceled = new EventEmitter();

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (
      event.target instanceof HTMLElement &&
      !this.eRef.nativeElement.contains(event.target) &&
      !event.target.closest('.datepicker-panel') && // <- NEW line to allow clicks inside datepicker
      !event.target.classList.contains('rsn_filter')
    ) {
      this.onCancel();
    }
  }

  onOk() {
    this.dateRangeChanged.emit({
      from: this.fromDate,
      to: this.toDate,
    });
  }

  onCancel() {
    this.dateRangeCanceled.emit({
      from: this.fromDate,
      to: this.toDate,
    });
  }
}
