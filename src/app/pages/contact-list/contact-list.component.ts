import { Component, computed, effect, inject } from '@angular/core';
import { ApiServiceService } from '../../shared/services/api/api-service.service';
import { DialogService } from '../../shared/services/dialog/dialog.service';
import { AddEditContactComponent } from '../../shared/component/add-edit-contact/add-edit-contact.component';
import { Contacts } from '../../core/contacts';

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

  public readonly contacts = computed(() => this.apiService.contactsList());

  public readonly isLoading = this.apiService.isLoading;

  constructor() {
    this.apiService.autoLoadContacts();
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
}
