import { Injectable, signal, inject } from '@angular/core';
import { Contacts } from '../../../core/contacts';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  public readonly contactsList = signal<Contacts[]>([]);

  private http = inject(HttpClient);

  private apiUrl = 'https://contacts-api-h4nr.onrender.com';

  public isLoading = signal(true);

  constructor() {}

  autoLoadContacts() {
    this.isLoading.set(true);
    this.getContacts().subscribe({
      next: () => this.isLoading.set(false),
      error: () => this.isLoading.set(false),
    });
  }

  getContacts(): Observable<Contacts[]> {
    return this.http.get<Contacts[]>(`${this.apiUrl}/contacts`).pipe(
      map((contacts) => {
        this.contactsList.set(contacts);
        return contacts;
      })
    );
  }

  addContact(contact: Contacts): Observable<Contacts> {
    return this.http.post<Contacts>(`${this.apiUrl}/contacts`, contact).pipe(
      map((contacts) => {
        console.log('contacts :', contacts);
        this.contactsList.update((prev) => [contacts, ...prev]);
        console.log('this.contactsList :', this.contactsList());

        return contacts;
      })
    );
  }

  updateContact(contact: Contacts): Observable<Contacts> {
    return this.http
      .put<Contacts>(`${this.apiUrl}/contacts/${contact._id}`, contact)
      .pipe(
        map((contacts) => {
          this.contactsList.update((prev) =>
            prev.map((c) => (c._id === contact._id ? contacts : c))
          );
          return contacts;
        })
      );
  }
}
