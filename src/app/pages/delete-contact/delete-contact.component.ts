import { Component, inject, input, signal } from '@angular/core';
import { Contacts } from '../../core/contacts';
import { DialogService } from '../../shared/services/dialog/dialog.service';
import { ApiServiceService } from '../../shared/services/api/api-service.service';
import { catchError, map, of, tap } from 'rxjs';

@Component({
  selector: 'app-delete-contact',
  standalone: true,
  imports: [],
  templateUrl: './delete-contact.component.html',
  styleUrl: './delete-contact.component.scss',
})
export class DeleteContactComponent {
  private readonly dialogService = inject(DialogService);

  private readonly apiService = inject(ApiServiceService);

  public contact = input<Contacts>();

  public isLoading = signal(false);

  public deleteContact() {
    if (this.isLoading() || !this.contact()?._id) {
      return of(false);
    }

    this.isLoading.set(true);

    return this.apiService.deleteContact(this.contact()?._id ?? '').pipe(
      catchError((error) => {
        console.log('error', error);
        return of(false);
      }),
      map(() => true),
      tap(() => this.close())
    );
  }

  public close() {
    this.dialogService.closeTopDialog();
  }
}
