import {Component, Input} from '@angular/core';
import {Asset} from '../../../../shared/models/assets/asset';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-maintenance-task-assets-table',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './maintenance-task-assets-table.component.html',
  styleUrl: './maintenance-task-assets-table.component.css'
})
export class MaintenanceTaskAssetsTableComponent {
  @Input() assets: {
    assetID: string,
    assetName: string
    assetType: {
      assetTypeID: string,
      name: string
    }
  }[] = [];
}
