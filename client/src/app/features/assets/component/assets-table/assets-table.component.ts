import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Asset} from '../../../../shared/models/assets/asset';
import {FormsModule} from '@angular/forms';
import {CommonModule, NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-assets-table',
  imports: [
    FormsModule,
    NgForOf,
    NgClass,
    CommonModule
  ],
  templateUrl: './assets-table.component.html',
  styleUrl: './assets-table.component.css'
})
export class AssetsTableComponent {
  @Input() assets: Array<any> = [];
  @Output() add = new EventEmitter<Asset>();
  @Output() delete = new EventEmitter<any>();
  @Output() updateStatus = new EventEmitter<{ assetId: string; status: string }>();

  filteredAssets: Array<Asset> = [];
  searchTerm: string = '';
  selectedAsset: Asset | null = null;
  statusOptions: string[] = ['Active', 'Inactive', 'Maintenance', 'Retired'];

  currentPage = 1;
  itemsPerPage = 20;

  get paginatedAssets(): Asset[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAssets.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAssets.length / this.itemsPerPage);
  }

  onStatusChange(asset: Asset, newStatus: string) {
    if (asset.status !== newStatus) {
      this.updateStatus.emit({ assetId: asset._id, status: newStatus });
    }
  }

  selectAsset(asset: Asset) {
    if (this.selectedAsset?._id === asset._id) {
      this.selectedAsset = null; // unselect
    } else {
      this.selectedAsset = asset;
    }
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredAssets = this.assets.filter(a =>
      Object.values(a).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(term)
      )
    );
  }

  ngOnChanges(): void {
    this.filteredAssets = [...this.assets];
    this.onSearchChange()
  }

  exportToJson(): void {
    if (!this.filteredAssets.length) return;
    const jsonData = JSON.stringify(this.filteredAssets, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  onAddAsset() {
    this.add.emit();
  }

  onDeleteAsset() {
    if (this.selectedAsset) {
      this.delete.emit(this.selectedAsset);
      this.selectedAsset = null; // unselect after deletion
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'badge-success';
      case 'Inactive':
        return 'badge-neutral';
      case 'Maintenance':
        return 'badge-warning';
      case 'Retired':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  }
}
