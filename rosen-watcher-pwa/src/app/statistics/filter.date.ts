import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'filter-date',
  templateUrl: './filter.date.html',
  standalone: true,
  imports: [MatDatepickerModule, MatInputModule, MatNativeDateModule, FormsModule],
})
export class FilterDate implements OnInit {
  @Input() fromDate: Date | null = null;
  @Input() toDate: Date | null = null;
  constructor() {}
  ngOnInit(): void {}

  @Output() dateRangeChanged = new EventEmitter<{ from: Date | null; to: Date | null }>();
  @Output() dateRangeCanceled = new EventEmitter<{}>();

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
