import {Component, inject, OnInit} from '@angular/core';
import {ToastService} from '../../../../core/services/toast-service.service';
import {UserService} from '../../services/user.service';
import {User} from '../../../../shared/models/users/user';
import {CreateUserDto} from '../../../../shared/models/users/create-user-dto';
import {SupplierFormComponent} from '../../../suppliers/components/supplier-form/supplier-form.component';
import {SupplierTableComponent} from '../../../suppliers/components/supplier-table/supplier-table.component';
import {UserFormComponent} from '../../components/user-form/user-form.component';
import {UsersTableComponent} from '../../components/users-table/users-table.component';

@Component({
  selector: 'app-users',
  imports: [
    SupplierFormComponent,
    SupplierTableComponent,
    UserFormComponent,
    UsersTableComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit{
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  users: User[] = [];

  drawerOpen = false;

  ngOnInit() {
    this.fetchUsers();
  }

  openDrawer() {
    // Show a modal or navigate to a form page
    this.drawerOpen = true;
  }

  closeDrawer() {
    this.drawerOpen = false;
  }

  handleFormSubmit(user: CreateUserDto) {
    this.userService.postUser(user).subscribe(() => {
      // After successfully adding a user, close the drawer
      this.closeDrawer();
      // Refresh the user list after adding a new user
      this.fetchUsers();
    });
  }

  handleDelete(user: User) {
    if (!confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"?`)) return;
    this.userService.deleteUser(user.email).subscribe(deleted => {
      this.fetchUsers(); // refresh the list
      this.toastService.show(`"${deleted.firstName} ${user.lastName}" was deleted successfully.`, 'success');
    });
  }

  private fetchUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

}
