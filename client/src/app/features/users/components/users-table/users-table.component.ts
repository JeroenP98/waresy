import {Component, EventEmitter, Input, Output} from '@angular/core';
import {User} from '../../../../shared/models/users/user';
import {download, generateCsv, mkConfig} from 'export-to-csv';
import {DatePipe, NgClass, NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-users-table',
  imports: [
    DatePipe,
    NgClass,
    FormsModule,
    NgForOf
  ],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.css'
})
export class UsersTableComponent {
  @Input() users: Array<User> = [];
  @Output() add = new EventEmitter<void>();
  @Output() delete = new EventEmitter<User>();

  filteredUsers: Array<User> = [];
  searchTerm: string = '';
  selectedUser: User | null = null;

  selectUser(user: User) {
    if (this.selectedUser?._id === user._id) {
      this.selectedUser = null; // unselect
    } else {
      this.selectedUser = user;
    }
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(u =>
      Object.values(u).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(term)
      )
    );
  }

  ngOnChanges(): void {
    this.filteredUsers = [...this.users];
  }

  onAddUser() {
    this.add.emit();
  }

  exportToCSV(): void {
    if (!this.filteredUsers.length) return;
    const csvConfig = mkConfig({
      useKeysAsHeaders: true,
      fieldSeparator: ",",
      filename: `users_${new Date().toISOString().split('T')[0]}`,
      decimalSeparator: ",",
      quoteStrings: true,
      quoteCharacter: '"'
    });

    const csv = generateCsv(csvConfig)(this.filteredUsers.map(user => ({
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : ''
    })));

    download(csvConfig)(csv);
  }

  onDeleteUser(user: User) {
    if (this.selectedUser) {
      this.delete.emit(user);
      this.selectedUser = null; // unselect after deletion
    }
  }


}
