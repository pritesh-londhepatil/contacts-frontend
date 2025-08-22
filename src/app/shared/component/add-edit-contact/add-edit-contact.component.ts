import { Component, inject } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiServiceService } from '../../services/api/api-service.service';
import { Contacts } from '../../../core/contacts';

@Component({
  selector: 'app-add-edit-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-edit-contact.component.html',
  styleUrl: './add-edit-contact.component.scss',
})
export class AddEditContactComponent {
  private readonly dialogService = inject(DialogService);

  private readonly apiServiceService = inject(ApiServiceService);

  public updateContactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
  });

  public onSubmit() {
    const contact: Contacts = {
      name: this.updateContactForm.value.name ?? '',
      email: this.updateContactForm.value.email ?? '',
      phoneNumber: this.updateContactForm.value.phone ?? '',
    };

    this.apiServiceService.addContact(contact).subscribe({
      next: (response) => {
        console.log('response', response);
        this.close();
      },
      error: (error) => {
        console.log('error', error);
      },
    });
  }

  public close() {
    this.dialogService.closeTopDialog();
  }
}
