// websocket.service.ts
import {
  Injectable,
  DestroyRef,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BehaviorSubject, Subject, catchError, EMPTY, tap } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { API_URL, WS_URL } from '@ba/core/http-client';

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  is_important: boolean;
  action_url?: string;
  created_at: string;
  read_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationSocketService {
  private socket$: WebSocketSubject<any> | null = null;
  private socketUrl = `${inject(WS_URL)}/notifications`;
  private destroyRef = inject(DestroyRef);

  // User ID for the current connection
  private _userId: number | null = null;

  // RxJS subjects for notifications and errors
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private notifications$ = this.notificationsSubject.asObservable();

  private notificationsSig = toSignal(this.notifications$, {
    initialValue: [],
  });
  public notificationsCount = computed(() => this.notificationsSig().length);

  public unreadCount = computed(
    () => this.notificationsSig().filter(({ read }) => !read).length
  );
  public haveUnread = computed(() => this.unreadCount() > 0);

  // Notifications signal to show (initial notifs list truncated - just 6 items)
  public notifications = computed(() => this.notificationsSig().slice(0, 6));

  private errorSubject = new Subject<string>();
  public error$ = this.errorSubject.asObservable();

  // Connection status using signal
  public connectionStatus = signal<'connected' | 'disconnected' | 'connecting'>(
    'disconnected'
  );

  // Auto-reconnect settings
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 5000;
  private reconnectTimeoutId: any = null;

  constructor() {}

  public connect(userId: number): void {
    this._userId = userId;
    this.establishConnection();

    // Cleanup on destroy
    this.destroyRef.onDestroy(() => {
      this.disconnect();
      this.clearReconnectTimeout();
    });
  }

  private establishConnection(): void {
    if (!this._userId) {
      this.errorSubject.next('Cannot connect: User ID not set');
      return;
    }

    if (this.connectionStatus() === 'connecting') return;

    this.connectionStatus.set('connecting');
    this.clearReconnectTimeout();

    this.socket$ = webSocket({
      url: `${this.socketUrl}/${this._userId}`,
      openObserver: {
        next: () => {
          console.log('WebSocket connection established');
          this.connectionStatus.set('connected');
          this.reconnectAttempts = 0;
        },
      },
      closeObserver: {
        next: event => {
          console.log('WebSocket connection closed', event);
          this.handleDisconnection(event);
        },
      },
    });

    this.socket$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('WebSocket error:', error);
          this.handleDisconnection();
          return EMPTY;
        })
      )
      .subscribe({
        next: response => this.handleMessage(response),
        error: error => {
          console.error('WebSocket subscription error:', error);
          this.handleDisconnection();
        },
      });
  }

  private handleMessage(response: any): void {
    try {
      const data =
        typeof response === 'string' ? JSON.parse(response) : response;

      console.log('ws data: ', data);

      switch (data.type) {
        case 'initial_notifications':
          this.notificationsSubject.next(data.notifications);
          break;

        case 'notification':
          this.addNewNotification(data.notification);
          break;

        case 'error':
          console.error('Server error:', data.message);
          this.errorSubject.next(data.message);
          break;

        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (e) {
      console.error('Error processing message:', e);
      this.errorSubject.next('Invalid message format');
    }
  }

  private addNewNotification(notification: Notification): void {
    const current = this.notificationsSubject.getValue();

    // Update if notification exists, otherwise prepend
    const index = current.findIndex(n => n.id === notification.id);
    if (index >= 0) {
      const updated = [...current];
      updated[index] = notification;
      this.notificationsSubject.next(updated);
    } else {
      this.playNotificationSound();
      this.notificationsSubject.next([notification, ...current]);
    }
  }

  private playNotificationSound() {
    const audio = new Audio('notification.wav');
    audio.play().catch(err => console.error('Audio playback failed', err));
  }

  private handleDisconnection(event?: CloseEvent): void {
    this.connectionStatus.set('disconnected');

    if (!event || (event.code !== 1000 && event.code !== 1001)) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.errorSubject.next('Failed to reconnect. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
      30000 // Max 30 seconds delay
    );

    this.reconnectTimeoutId = setTimeout(() => {
      console.log(
        `Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );
      this.establishConnection();
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  public markAllAsRead(): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next({
        type: 'mark_all_read',
      });
    } else {
      console.warn('Cannot mark as read - no active connection');
    }
  }

  public markAsRead(notificationId: number): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next({
        type: 'mark_one_read',
        notification_id: notificationId,
      });
    } else {
      console.warn('Cannot mark as read - no active connection');
    }
  }

  public refreshNotifications(): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next({
        type: 'refresh',
      });
    } else {
      console.warn('Cannot refresh notifs, no active connection');
    }
  }

  public disconnect(): void {
    this.clearReconnectTimeout();

    if (this.socket$) {
      try {
        this.socket$.complete();
      } catch (e) {
        console.error('Error closing WebSocket:', e);
      }
      this.socket$ = null;
    }

    this.connectionStatus.set('disconnected');
  }

  public get currentNotifications(): Notification[] {
    return this.notificationsSubject.getValue();
  }
}
