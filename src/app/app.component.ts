import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactListComponent } from './pages/contact-list/contact-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ContactListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'contacts-frontend';
}
