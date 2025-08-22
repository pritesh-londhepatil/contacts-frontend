import { Component, computed, effect, inject, signal } from '@angular/core';
import { ApiServiceService } from '../../shared/services/api/api-service.service';
import { DialogService } from '../../shared/services/dialog/dialog.service';
import { AddEditContactComponent } from '../../shared/component/add-edit-contact/add-edit-contact.component';
import { Contacts } from '../../core/contacts';
import { DeleteContactComponent } from '../delete-contact/delete-contact.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss',
})
export class ContactListComponent {
  private readonly apiService = inject(ApiServiceService);

  private readonly dialogService = inject(DialogService);

  public readonly isLoading = this.apiService.isLoading;

  public readonly searchTerm = signal('');

  public readonly contacts = computed(() => {
    const allContacts = this.apiService.contactsList();
    const searchTerm = this.searchTerm().trim().toLowerCase();

    if (!searchTerm) {
      return allContacts;
    }

    return allContacts.filter((contact) => {
      const nameMatch = contact.name.toLowerCase().includes(searchTerm);
      const emailMatch = contact.email.toLowerCase().includes(searchTerm);
      const phoneMatch = contact.phoneNumber.toLowerCase().includes(searchTerm);
      return nameMatch || emailMatch || phoneMatch;
    });
  });

  constructor() {
    this.apiService.autoLoadContacts();
  }

  public onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    console.log('search term ', this.searchTerm());
  }

  public addContact() {
    this.dialogService.openModal(AddEditContactComponent, {
      modalId: 'addEditContactModal',
    });
  }

  public editContact(contact: Contacts) {
    console.log('contact list component ', contact);
    this.dialogService.openModal(AddEditContactComponent, {
      modalId: 'addEditContactModal',
      props: {
        contact: contact,
      },
    });
  }

  public deleteContact(contact: Contacts) {
    this.dialogService.openModal(DeleteContactComponent, {
      modalId: 'deleteContactModal',
      props: {
        contact: contact,
      },
    });
  }
}
