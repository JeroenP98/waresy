import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AssetType} from '../../../../shared/models/asset-type';
import {download, generateCsv, mkConfig} from 'export-to-csv';
import {NgClass, NgForOf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-asset-type-table',
  imports: [
    NgForOf,
    ReactiveFormsModule,
    FormsModule,
    NgClass
  ],
  templateUrl: './asset-type-table.component.html',
  styleUrl: './asset-type-table.component.css'
})
export class AssetTypeTableComponent {
  @Input() assetTypes: Array<AssetType> = []
  @Output() add = new EventEmitter<void>();
  @Output() delete = new EventEmitter<AssetType>();

  filteredAssetTypes: Array<AssetType> = [];
  searchTerm: string = '';

  selectedAssetType: AssetType | null = null;

  selectAssetType(assetType: AssetType) {
    if (this.selectedAssetType?._id === assetType._id) {
      this.selectedAssetType = null; // unselect
    } else {
      this.selectedAssetType = assetType;
    }
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredAssetTypes = this.assetTypes.filter(at =>
      Object.values(at).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(term)
      )
    );
  }

  ngOnChanges(): void {
    this.filteredAssetTypes = [...this.assetTypes];
  }

  onAddAssetType() {
    this.add.emit();
  }

  exportToCSV(): void {
    if (!this.filteredAssetTypes.length) return;
    const csvConfig = mkConfig({
      useKeysAsHeaders: true,
      fieldSeparator: ",",
      filename: `asset-types_${new Date().toISOString().split('T')[0]}`,
      decimalSeparator: ",",
      quoteStrings: true,
      quoteCharacter: '"'
    });

    const csv = generateCsv(csvConfig)(this.filteredAssetTypes.map(s => ({ ...s })));

    download(csvConfig)(csv);

  }

  onDeleteAssetType() {
    if (this.selectedAssetType) {
      this.delete.emit(this.selectedAssetType);
      this.selectedAssetType = null; // unselect after deletion
    }
  }


}
