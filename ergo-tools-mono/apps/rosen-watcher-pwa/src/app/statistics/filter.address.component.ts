import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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
export class FilterAddressComponent implements OnInit {
  constructor(private eRef: ElementRef) {}
  ngOnInit(): void {
    console.log(this.addresses);
  }

  private _addresses: Address[] | null = null;

  @Input()
  set addresses(value: Address[] | null) {
    // Deep clone to avoid reference updates
    this._addresses = value ? JSON.parse(JSON.stringify(value)) : null;
  }
  get addresses(): Address[] | null {
    return this._addresses;
  }
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
    this.addressesCanceled.emit(this.addresses);
  }
}
