import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Supplier} from '../../../../shared/models/supplier';
import {NgClass, NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { mkConfig, generateCsv, download } from "export-to-csv";

@Component({
  selector: 'app-supplier-table',
  imports: [
    NgForOf,
    FormsModule,
    NgClass
  ],
  templateUrl: './supplier-table.component.html',
  styleUrl: './supplier-table.component.css'
})
export class SupplierTableComponent {
  @Input() suppliers: Array<Supplier> = [];
  @Output() add = new EventEmitter<void>();
  @Output() delete = new EventEmitter<Supplier>();

  filteredSuppliers: Array<Supplier> = [];
  searchTerm: string = '';

  selectedSupplier: Supplier | null = null;

  selectSupplier(supplier: Supplier) {
    if (this.selectedSupplier?._id === supplier._id) {
      this.selectedSupplier = null; // unselect
    } else {
      this.selectedSupplier = supplier;
    }
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredSuppliers = this.suppliers.filter(s =>
      Object.values(s).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(term)
      )
    );
  }

  ngOnChanges(): void {
    this.filteredSuppliers = [...this.suppliers];
  }

  onAddSupplier() {
    this.add.emit();
  }

  exportToCSV(): void {
    if (!this.filteredSuppliers.length) return;
    const csvConfig = mkConfig({
      useKeysAsHeaders: true,
      fieldSeparator: ",",
      filename: `suppliers_${new Date().toISOString().split('T')[0]}`,
      decimalSeparator: ",",
      quoteStrings: true,
      quoteCharacter: '"'
    });

    const csv = generateCsv(csvConfig)(this.filteredSuppliers.map(s => ({ ...s })));

    download(csvConfig)(csv);

  }

  onDeleteSupplier() {
    if (this.selectedSupplier) {
      this.delete.emit(this.selectedSupplier);
      this.selectedSupplier = null;
    }
  }
}
