import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../core/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe(
      notifs => this.notifications = notifs
    );
  }

  close(id: string): void {
    this.notificationService.removeNotification(id);
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'success':
        return 'alert alert-success';
      case 'error':
        return 'alert alert-danger';
      case 'warning':
        return 'alert alert-warning';
      case 'info':
        return 'alert alert-info';
      default:
        return 'alert';
    }
  }

  toggleDetails(id: string): void {
    this.notificationService.toggleDetails(id);
  }

  getStatusBadgeClass(status?: number): string {
    if (!status) return '';
    if (status >= 200 && status < 300) return 'badge bg-success';
    if (status >= 400 && status < 500) return 'badge bg-warning text-dark';
    if (status >= 500) return 'badge bg-danger';
    return 'badge bg-secondary';
  }
}
