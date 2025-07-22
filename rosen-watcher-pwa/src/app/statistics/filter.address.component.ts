import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { Address } from '../../service/ts/models/address';

@Component({
  selector: 'app-filter-address',
  templateUrl: './filter.address.html',
  standalone: true,
  imports: [MatInputModule, FormsModule, MatCheckboxModule],
})
export class FilterAddressComponent {
  constructor(private eRef: ElementRef) {}

  @Input() addresses: Address[] | null = null;
  @Output() addressesChanged = new EventEmitter<Address[] | null>();
  @Output() addressesCanceled = new EventEmitter();

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (
      event.target instanceof HTMLElement &&
      !this.eRef.nativeElement.contains(event.target) &&
      !event.target.classList.contains('rsn_filter')
    ) {
      this.onCancel();
    }
  }

  onOk() {
    this.addressesChanged.emit(this.addresses);
  }

  onCancel() {
    this.addressesChanged.emit(this.addresses);
  }
}
