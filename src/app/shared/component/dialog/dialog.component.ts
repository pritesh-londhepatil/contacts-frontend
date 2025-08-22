import { isPlatformBrowser, NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EnvironmentInjector,
  EventEmitter,
  inject,
  input,
  Input,
  Output,
  PLATFORM_ID,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'app-dialog',
  standalone: true,
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  imports: [NgClass],
})
export class DialogComponent implements AfterViewInit {
  @Input() template!: Type<unknown>;
  @Input() context: unknown;
  @Input() cssClass: string = '';
  @Input() modalId: string = 'appModal';

  public inputContext = input<{ [key: string]: unknown } | null>(null);

  @Output() closeEvent = new EventEmitter<unknown>();

  @ViewChild('container', { read: ViewContainerRef })
  container!: ViewContainerRef;

  private readonly envInjector = inject(EnvironmentInjector);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  private modalInstance: { hide(): void; show(): void } | null = null;
  private isDisposing = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return; // ✅ SSR guard

    const componentReference = this.container.createComponent(this.template, {
      environmentInjector: this.envInjector,
    });

    if (this.context) {
      Object.entries(this.context).forEach(
        ([key, val]) =>
          ((componentReference.instance as { [key: string]: unknown })[key] =
            val)
      );
    }

    const inputContext = this.inputContext();
    if (inputContext) {
      for (const [propKey, value] of Object.entries(inputContext)) {
        componentReference.setInput(propKey, value);
      }
    }

    this.cdr?.detectChanges();
    componentReference.changeDetectorRef?.detectChanges();

    const modalElement = document.getElementById(this.modalId);
    if (modalElement) {
      // ✅ Lazy load Bootstrap modal only in browser
      import('bootstrap').then(({ Modal }) => {
        this.modalInstance = new Modal(modalElement, {
          backdrop: 'static', // Prevent closing on backdrop click
          keyboard: true,
        });
        this.modalInstance.show();

        // Listen for hidden event to clean up properly
        modalElement.addEventListener('hidden.bs.modal', () => {
          if (!this.isDisposing) {
            this.close();
          }
        });

        // Listen for hide event to prevent multiple disposals
        modalElement.addEventListener('hide.bs.modal', () => {
          this.isDisposing = true;
        });
      });
    }
  }

  close(result?: unknown): void {
    if (this.isDisposing) return; // Prevent multiple close calls

    this.closeEvent.emit(result);
    if (this.modalInstance) {
      try {
        this.modalInstance.hide();
      } catch (error) {
        console.warn('Error hiding modal:', error);
        // If hiding fails, just emit the close event
        this.closeEvent.emit(result);
      }
    }
  }

  // Method to properly dispose of the modal instance
  disposeModal(): void {
    if (this.modalInstance && !this.isDisposing) {
      this.isDisposing = true;

      try {
        // Check if the modal element still exists
        const modalElement = document.getElementById(this.modalId);
        if (!modalElement) {
          // Modal element is already gone, just clean up the instance
          this.modalInstance = null;
          this.isDisposing = false;
          return;
        }

        // Just hide the modal and let Bootstrap handle its own cleanup
        // This prevents the error from manual disposal
        this.modalInstance.hide();

        // Clean up our reference after a delay
        setTimeout(() => {
          this.modalInstance = null;
          this.isDisposing = false;
        }, 300);
      } catch (error) {
        console.warn('Error hiding modal:', error);
        // Fallback: just set to null
        this.modalInstance = null;
        this.isDisposing = false;
      }
    }
  }
}
