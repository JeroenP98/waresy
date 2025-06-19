import {Component, inject, OnInit} from '@angular/core';
import {SupplierTableComponent} from '../../components/supplier-table/supplier-table.component';
import {Supplier} from '../../../../shared/models/supplier';
import {SupplierService} from '../../services/supplier.service';
import {SupplierFormComponent} from '../../components/supplier-form/supplier-form.component';
import {CreateSupplierDto} from '../../../../shared/models/create-supplier-dto';
import {ToastService} from '../../../../core/services/toast-service.service';

@Component({
  selector: 'app-suppliers',
  imports: [SupplierTableComponent, SupplierFormComponent],
  templateUrl: './suppliers.component.html',
  styleUrl: './suppliers.component.css'
})
export class SuppliersComponent implements OnInit {
  private supplierService = inject(SupplierService);
  private toastService = inject(ToastService);
  suppliers: Supplier[] = [];

  drawerOpen = false;

  ngOnInit() {
    this.fetchSuppliers();
  }

  openDrawer() {
    // Show a modal or navigate to a form page
    this.drawerOpen = true;
  }

  closeDrawer() {
    this.drawerOpen = false;
  }

  handleFormSubmit(supplier: CreateSupplierDto) {
    this.supplierService.postSupplier(supplier).subscribe(() => {
      // After successfully adding a supplier, close the drawer
      this.closeDrawer();
      // Refresh the supplier list after adding a new supplier
      this.fetchSuppliers()
    });
  }

  handleDelete(supplier: Supplier) {
    if (!confirm(`Are you sure you want to delete "${supplier.name}"?`)) return;
    this.supplierService.deleteSupplier(supplier._id).subscribe(deleted => {
      this.fetchSuppliers(); // refresh the list
      this.toastService.show(`"${deleted.name}" was deleted successfully.`, 'success');
    });
  }

  private fetchSuppliers() {
    this.supplierService.getSuppliers().subscribe(suppliers => {
      this.suppliers = suppliers;
    })
  }
}
