import {Component, inject, OnInit} from '@angular/core';
import {AssetsTableComponent} from '../../component/assets-table/assets-table.component';
import {AssetsFormComponent} from '../../component/assets-form/assets-form.component';
import {SupplierService} from '../../../suppliers/services/supplier.service';
import {ToastService} from '../../../../core/services/toast-service.service';
import {Supplier} from '../../../../shared/models/suppliers/supplier';
import {AssetTypeService} from '../../../asset-types/services/asset-type.service';
import {AssetService} from '../../services/asset.service';
import {AssetType} from '../../../../shared/models/asset-types/asset-type';
import {Asset} from '../../../../shared/models/assets/asset';

@Component({
  selector: 'app-assets',
  imports: [
    AssetsTableComponent,
    AssetsFormComponent
  ],
  templateUrl: './assets.component.html',
  styleUrl: './assets.component.css'
})
export class AssetsComponent implements OnInit {

  private supplierService = inject(SupplierService);
  private assetTypesService = inject(AssetTypeService);
  private assetService = inject(AssetService);
  private toastService = inject(ToastService);
  suppliers: Supplier[] = [];
  assets: Asset[] = [];
  assetTypes: AssetType[] = [];


  drawerOpen = false;

  ngOnInit(): void {
    this.fetchAll()
  }

  openDrawer() {
    // Show a modal or navigate to a form page
    this.drawerOpen = true;
  }

  closeDrawer() {
    this.drawerOpen = false;
  }

  fetchAll() {
    this.fetchAssets();
    this.fetchSuppliers();
    this.fetchAssetTypes();
  }

  private fetchAssets() {
    this.assetService.getAssets().subscribe(assets => {
      this.assets = assets;
    })
  }

  private fetchSuppliers() {
    this.supplierService.getSuppliers().subscribe(suppliers => {
      this.suppliers = suppliers;
    })
  }

  private fetchAssetTypes() {
    this.assetTypesService.getAssetTypes().subscribe(assetTypes => {
      this.assetTypes = assetTypes;
    })
  }

  handleFormSubmit(asset: Asset) {
    this.assetService.postAsset(asset).subscribe({
      next: (created) => {
        this.toastService.show(`Asset "${created.name}" created successfully`, 'success');
        this.fetchAssets();
        this.closeDrawer();
      },
      error: (err) => {
        const backendMessage =
          err?.error?.message || err?.message || 'Unknown error.';
        const message = `Failed to create asset: ${backendMessage}`;
        this.toastService.show(message, 'error');
      }
    });
  }

  handleDelete(asset: Asset) {
    if (!confirm(`Are you sure you want to delete "${asset.name}"?`)) return;
    this.assetService.deleteAsset(asset._id).subscribe(deleted => {
      this.fetchAssets(); // refresh the list
      this.toastService.show(`"${deleted.name}" was deleted successfully.`, 'success');
    });
  }

  handleStatusUpdate(update: { assetId: string; status: string }) {
    this.assetService.updateAssetStatus(update.assetId, update.status).subscribe({
      next: ({ message, asset }) => {
        this.toastService.show(`Status updated: ${message}`, 'success');

        // Update the local asset in-place
        const index = this.assets.findIndex(a => a._id === asset._id);
        if (index !== -1) {
          this.assets[index] = asset;
          this.assets = [...this.assets]; // trigger change detection
        }
      },
      error: (err) => {
        const msg = err?.message || 'Failed to update asset status.';
        this.toastService.show(`Error: ${msg}`, 'error');
      }
    });
  }


}
