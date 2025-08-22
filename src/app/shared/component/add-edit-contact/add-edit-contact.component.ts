import { Component, effect, inject, input, signal } from '@angular/core';
import { DialogService } from '../../services/dialog/dialog.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiServiceService } from '../../services/api/api-service.service';
import { Contacts } from '../../../core/contacts';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { finalize } from 'rxjs/operators';

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

  public isLoading = signal(false);

  public contact = input<Contacts>();

  public updateContactForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required]),
  });

  constructor() {
    effect(() => {
      if (this.contact()) {
        this.updateContactForm.patchValue({
          name: this.contact()?.name,
          email: this.contact()?.email,
          phone: this.contact()?.phoneNumber,
        });
      }
    });
  }

  public onSubmit(): Observable<boolean> {
    if (this.isLoading()) {
      return of(false);
    }

    this.isLoading.set(true);

    const contactData: Contacts = {
      name: this.updateContactForm.value.name ?? '',
      email: this.updateContactForm.value.email ?? '',
      phoneNumber: this.updateContactForm.value.phone ?? '',
    };

    if (!this.contact()) {
      return this.apiServiceService.addContact(contactData).pipe(
        catchError((error) => {
          console.log('error', error);
          return of(false);
        }),
        map(() => true),
        tap(() => this.close()),
        finalize(() => this.isLoading.set(false))
      );
    } else {
      const editContact = {
        _id: this.contact()?._id,
        ...contactData,
      };
      return this.apiServiceService.updateContact(editContact).pipe(
        catchError((error) => {
          console.log('error', error);
          return of(false);
        }),
        map(() => true),
        tap(() => this.close()),
        finalize(() => this.isLoading.set(false))
      );
    }
  }

  public close() {
    this.dialogService.closeTopDialog();
  }
}
