import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  PLATFORM_ID,
  Type,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DialogComponent } from '../../../shared/component/dialog/dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialogStack: {
    componentRef: ComponentRef<DialogComponent>;
    hostElement: HTMLElement;
  }[] = [];

  private readonly envInjector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Generates a secure random ID for modal elements
   * Uses crypto.getRandomValues() when available, falls back to a more secure alternative
   */
  public generateSecureModalId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers using timestamp and performance for better entropy
    const timestamp = Date.now().toString(36);
    const perfValue = (performance?.now() || 0).toString(36).replace('.', '');
    return 'modal-' + timestamp + perfValue.slice(0, 8);
  }

  openModal<T, Result = unknown>(
    component: Type<T>,

    config: {
      props?: {
        [key: string]: unknown;
      };
      context?: Record<string, unknown>;
      cssClass?: string;
      modalId?: string;
    } = {}
  ): Observable<Result> {
    const close$ = new Subject<Result>();

    if (!isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        close$.next(undefined as Result);
        close$.complete();
      });
      return close$.asObservable();
    }

    // Create container for the dynamic dialog
    const dialogContainer = document.createElement('popup-component');
    if (config.cssClass) {
      dialogContainer.classList.add(config.cssClass);
    }
    document.body.appendChild(dialogContainer);

    const componentRef = createComponent(DialogComponent, {
      environmentInjector: this.envInjector,
      hostElement: dialogContainer,
    });

    componentRef.setInput('inputContext', config.props ?? null);

    this.appRef.attachView(componentRef.hostView);

    const dialogInstance = componentRef.instance;
    dialogInstance.template = component;
    dialogInstance.context = config.context;
    dialogInstance.cssClass = config.cssClass ?? '';
    dialogInstance.modalId = config.modalId || this.generateSecureModalId();

    dialogInstance.closeEvent.subscribe((result: unknown) => {
      this.closeTopDialog();
      close$.next(result as Result);
      close$.complete();
    });

    this.dialogStack.push({ componentRef, hostElement: dialogContainer });

    return close$.asObservable();
  }

  closeTopDialog(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const topDialog = this.dialogStack.pop();
    if (topDialog) {
      // Properly dispose of the modal instance to clean up backdrop
      if (
        topDialog.componentRef.instance &&
        typeof topDialog.componentRef.instance.disposeModal === 'function'
      ) {
        // Add a small delay to ensure Bootstrap has finished any ongoing operations
        setTimeout(() => {
          topDialog.componentRef.instance.disposeModal();
        }, 50);
      }

      // Wait for animation to complete before cleaning up
      setTimeout(() => {
        // Clean up the component and element
        if (topDialog.componentRef) {
          topDialog.componentRef.destroy();
        }

        // Remove the host element if it's still in the DOM
        if (
          topDialog.hostElement &&
          topDialog.hostElement.parentNode === document.body
        ) {
          document.body.removeChild(topDialog.hostElement);
        }
      }, 400); // Increased delay to ensure all Bootstrap operations complete
    }
  }

  closeAllDialogs(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    while (this.dialogStack.length > 0) {
      this.closeTopDialog();
    }
  }

  public closeTopDialogWithData(data?: unknown) {
    if (this.dialogStack.length === 0) {
      return;
    }

    const topElement = this.dialogStack[this.dialogStack.length - 1];
    topElement.componentRef.instance.closeEvent.next(data);
  }

  hasOpenDialogs(): boolean {
    return this.dialogStack.length > 0;
  }
}
