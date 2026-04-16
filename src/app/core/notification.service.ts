import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ErrorDetails {
  httpStatus?: number;
  backendMessage?: string;
  backendCode?: string;
  timestamp?: string;
  endpoint?: string;
  clientError?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  details?: ErrorDetails;
  showDetails?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  success(message: string, duration = 5000): void {
    this.addNotification(message, 'success', duration);
  }

  error(message: string, duration = 0, details?: ErrorDetails): void {
    this.addNotification(message, 'error', duration, details);
  }

  warning(message: string, duration = 5000): void {
    this.addNotification(message, 'warning', duration);
  }

  info(message: string, duration = 4000): void {
    this.addNotification(message, 'info', duration);
  }

  private addNotification(
    message: string,
    type: Notification['type'],
    duration: number,
    details?: ErrorDetails
  ): void {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      message,
      type,
      duration,
      details,
      showDetails: !!details
    };

    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    // Log en consola para debugging
    if (type === 'error' && details) {
      console.error('[APP ERROR]', {
        message,
        httpStatus: details.httpStatus,
        backendMessage: details.backendMessage,
        endpoint: details.endpoint,
        timestamp: details.timestamp,
        clientError: details.clientError
      });
    }

    if (duration > 0) {
      setTimeout(() => this.removeNotification(id), duration);
    }
  }

  removeNotification(id: string): void {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.id !== id));
  }

  toggleDetails(id: string): void {
    const current = this.notifications$.value;
    const updated = current.map(n =>
      n.id === id ? { ...n, showDetails: !n.showDetails } : n
    );
    this.notifications$.next(updated);
  }

  clearAll(): void {
    this.notifications$.next([]);
  }
}
