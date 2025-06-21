import {Component, inject, OnInit} from '@angular/core';
import {ToastService} from '../../../../core/services/toast-service.service';
import {AssetType} from '../../../../shared/models/asset-types/asset-type';
import {AssetTypeService} from '../../services/asset-type.service';
import {CreateAssetTypeDto} from '../../../../shared/models/asset-types/create-asset-type-dto';
import {AssetTypeTableComponent} from '../../components/asset-type-table/asset-type-table.component';
import {AssetTypeFormComponent} from '../../components/asset-type-form/asset-type-form.component';

@Component({
  selector: 'app-asset-type',
  imports: [
    AssetTypeTableComponent,
    AssetTypeFormComponent
  ],
  templateUrl: './asset-type.component.html',
  styleUrl: './asset-type.component.css'
})
export class AssetTypeComponent implements OnInit {
  private assetTypeService = inject(AssetTypeService);
  private toastService = inject(ToastService);
  assetTypes: AssetType[] = [];
  drawerOpen = false;

  ngOnInit() {
    this.fetchAssetTypes();
  }

  openDrawer() {
    // Show a modal or navigate to a form page
    this.drawerOpen = true;
  }

  closeDrawer() {
    this.drawerOpen = false;
  }

  handleFormSubmit(assetType: CreateAssetTypeDto) {
    this.assetTypeService.postAssetType(assetType).subscribe(() => {
      // After successfully adding an asset type, close the drawer
      this.closeDrawer();
      // Refresh the asset type list after adding a new asset type
      this.fetchAssetTypes();
    })
  }

  handleDelete(assetType: AssetType) {
    if (!confirm(`Are you sure you want to delete "${assetType.name}"?`)) return;
    this.assetTypeService.deleteAssetType(assetType._id).subscribe(deleted => {
      this.fetchAssetTypes(); // refresh the list
      this.toastService.show(`"${assetType.name}" was deleted successfully.`, 'success');
    })
  }

  private fetchAssetTypes() {
    this.assetTypeService.getAssetTypes().subscribe(assetTypes => {
      this.assetTypes = assetTypes;
    })
  }
}
