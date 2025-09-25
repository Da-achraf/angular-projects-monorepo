// // websocket.service.ts
// import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
// import { WS_URL } from '@ba/core/http-client';
// import { Subject } from 'rxjs';

// export interface MachineStatus {
//   machine_name: string;
//   status: string;
// }

// export interface WebSocketMessage {
//   event: string;
//   data: { [key: string]: MachineStatus };
// }

// export interface AreaWebSocketState {
//   isConnected: boolean;
//   isConnecting: boolean;
//   error: string | null;
//   lastMessage: WebSocketMessage | null;
//   machineStatuses: { [machineId: string]: MachineStatus };
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class WebSocketService implements OnDestroy {
//   private destroy$ = new Subject<void>();
//   private connections = new Map<number, WebSocket>();
//   private reconnectTimeouts = new Map<number, any>();
//   private readonly RECONNECT_DELAY = 5000;
//   private readonly MAX_RECONNECT_ATTEMPTS = 5;
//   private reconnectAttempts = new Map<number, number>();
//   private readonly ws_url = `${inject(WS_URL)}/areas`;

//   // Signals for each area's WebSocket state
//   private areaStates = new Map<
//     number,
//     {
//       isConnected: ReturnType<typeof signal<boolean>>;
//       isConnecting: ReturnType<typeof signal<boolean>>;
//       error: ReturnType<typeof signal<string | null>>;
//       lastMessage: ReturnType<typeof signal<WebSocketMessage | null>>;
//       machineStatuses: ReturnType<
//         typeof signal<{ [machineName: string]: MachineStatus }>
//       >;
//     }
//   >();

//   /**
//    * Connect to WebSocket for a specific area
//    */
//   connectToArea(areaId: number): void {
//     if (this.connections.has(areaId)) {
//       return; // prevent duplicate connections
//     }

//     this.initializeAreaSignals(areaId);
//     const uri = `${this.ws_url}/${areaId}`;
//     console.log(`[WebSocket] Connecting to area ${areaId} at ${uri}`);

//     const signals = this.areaStates.get(areaId)!;
//     signals.isConnecting.set(true);
//     signals.error.set(null);

//     try {
//       const websocket = new WebSocket(uri);

//       websocket.onopen = () => {
//         console.log(`[WebSocket] Connected to area ${areaId}`);
//         signals.isConnected.set(true);
//         signals.isConnecting.set(false);
//         signals.error.set(null);
//         this.reconnectAttempts.set(areaId, 0);
//       };

//       websocket.onmessage = event => {
//         try {
//           const message: WebSocketMessage = JSON.parse(event.data);
//           console.log(`[WebSocket] Area ${areaId} received:`, message);

//           signals.lastMessage.set(message);

//           if (message.event === 'machine-status' && message.data) {
//             const updatedStatuses = { ...signals.machineStatuses() };
//             Object.entries(message.data).forEach(([machineName, status]) => {
//               updatedStatuses[machineName] = {
//                 machine_name: status.machine_name,
//                 status: status.status,
//               };
//             });
//             signals.machineStatuses.set(updatedStatuses);
//           }
//         } catch (err) {
//           console.error(`[WebSocket] Area ${areaId} JSON parse error:`, err);
//         }
//       };

//       websocket.onerror = () => {
//         console.error(`[WebSocket] Area ${areaId} error`);
//         signals.error.set('WebSocket connection error');
//         signals.isConnecting.set(false);
//       };

//       websocket.onclose = event => {
//         console.log(
//           `[WebSocket] Area ${areaId} closed:`,
//           event.code,
//           event.reason
//         );
//         signals.isConnected.set(false);
//         signals.isConnecting.set(false);
//         this.connections.delete(areaId);

//         if (event.code !== 1000) {
//           this.attemptReconnect(areaId);
//         }
//       };

//       this.connections.set(areaId, websocket);
//     } catch (err) {
//       console.error(`[WebSocket] Area ${areaId} connection failed:`, err);
//       signals.error.set('Failed to establish WebSocket connection');
//       signals.isConnecting.set(false);
//     }
//   }

//   private initializeAreaSignals(areaId: number): void {
//     if (!this.areaStates.has(areaId)) {
//       this.areaStates.set(areaId, {
//         isConnected: signal(false),
//         isConnecting: signal(false),
//         error: signal<string | null>(null),
//         lastMessage: signal<WebSocketMessage | null>(null),
//         machineStatuses: signal<{ [machineId: string]: MachineStatus }>({}),
//       });
//     }
//   }

//   private attemptReconnect(areaId: number): void {
//     const attempts = this.reconnectAttempts.get(areaId) || 0;

//     if (attempts < this.MAX_RECONNECT_ATTEMPTS) {
//       console.log(
//         `[WebSocket] Reconnecting to area ${areaId} in ${this.RECONNECT_DELAY}ms (attempt ${attempts + 1})`
//       );
//       const timeout = setTimeout(() => {
//         this.reconnectAttempts.set(areaId, attempts + 1);
//         this.connectToArea(areaId);
//         this.reconnectTimeouts.delete(areaId);
//       }, this.RECONNECT_DELAY);
//       this.reconnectTimeouts.set(areaId, timeout);
//     } else {
//       console.error(
//         `[WebSocket] Max reconnection attempts reached for area ${areaId}`
//       );
//       this.areaStates
//         .get(areaId)!
//         .error.set('Max reconnection attempts reached');
//     }
//   }

//   getAreaState(areaId: number) {
//     this.initializeAreaSignals(areaId);
//     const signals = this.areaStates.get(areaId)!;

//     return computed<AreaWebSocketState>(() => ({
//       isConnected: signals.isConnected(),
//       isConnecting: signals.isConnecting(),
//       error: signals.error(),
//       lastMessage: signals.lastMessage(),
//       machineStatuses: signals.machineStatuses(),
//     }));
//   }

//   getAreaMachineStatuses(areaId: number) {
//     this.initializeAreaSignals(areaId);
//     return this.areaStates.get(areaId)!.machineStatuses;
//   }

//   sendToArea(areaId: number, message: any): boolean {
//     const connection = this.connections.get(areaId);
//     if (connection && connection.readyState === WebSocket.OPEN) {
//       connection.send(JSON.stringify(message));
//       return true;
//     }
//     return false;
//   }

//   disconnectFromArea(areaId: number): void {
//     const connection = this.connections.get(areaId);
//     if (connection) {
//       connection.close(1000, 'Manual disconnect');
//       this.connections.delete(areaId);
//     }

//     const timeout = this.reconnectTimeouts.get(areaId);
//     if (timeout) {
//       clearTimeout(timeout);
//       this.reconnectTimeouts.delete(areaId);
//     }

//     this.reconnectAttempts.delete(areaId);
//   }

//   disconnectAll(): void {
//     this.connections.forEach((_, areaId) => this.disconnectFromArea(areaId));
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//     this.disconnectAll();
//   }
// }

// websocket.service.ts
import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { WS_URL } from '@ba/core/http-client';
import { Subject } from 'rxjs';

export interface MachineStatus {
  machine_name: string;
  status: string;
}

export interface WebSocketMessage {
  event: string;
  data: { [key: string]: MachineStatus };
}

export interface AreaWebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
  machineStatuses: { [machineId: string]: MachineStatus };
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private connections = new Map<number, WebSocket>();
  private reconnectTimeouts = new Map<number, any>();
  private readonly RECONNECT_DELAY = 5000;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private reconnectAttempts = new Map<number, number>();
  private readonly ws_url = `${inject(WS_URL)}/areas`;

  // Signals for each area's WebSocket state
  private areaStates = new Map<
    number,
    {
      isConnected: ReturnType<typeof signal<boolean>>;
      isConnecting: ReturnType<typeof signal<boolean>>;
      error: ReturnType<typeof signal<string | null>>;
      lastMessage: ReturnType<typeof signal<WebSocketMessage | null>>;
      machineStatuses: ReturnType<
        typeof signal<{ [machineName: string]: MachineStatus }>
      >;
    }
  >();

  /**
   * Connect to WebSocket for a specific area
   */
  connectToArea(areaId: number): void {
    if (this.connections.has(areaId)) {
      return; // prevent duplicate connections
    }

    this.initializeAreaSignals(areaId);
    const uri = `${this.ws_url}/${areaId}`;
    console.log(`[WebSocket] Connecting to area ${areaId} at ${uri}`);

    const signals = this.areaStates.get(areaId)!;
    signals.isConnecting.set(true);
    signals.error.set(null);

    try {
      const websocket = new WebSocket(uri);

      websocket.onopen = () => {
        console.log(`[WebSocket] Connected to area ${areaId}`);
        signals.isConnected.set(true);
        signals.isConnecting.set(false);
        signals.error.set(null);
        this.reconnectAttempts.set(areaId, 0);
      };

      websocket.onmessage = event => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log(`[WebSocket] Area ${areaId} received:`, message);

          signals.lastMessage.set(message);

          if (message.event === 'machine-status' && message.data) {
            const updatedStatuses = { ...signals.machineStatuses() };
            Object.entries(message.data).forEach(([machineName, status]) => {
              updatedStatuses[machineName] = {
                machine_name: status.machine_name,
                status: status.status,
              };
            });
            signals.machineStatuses.set(updatedStatuses);
          }
        } catch (err) {
          console.error(`[WebSocket] Area ${areaId} JSON parse error:`, err);
        }
      };

      websocket.onerror = () => {
        console.error(`[WebSocket] Area ${areaId} error`);
        signals.error.set('WebSocket connection error');
        signals.isConnecting.set(false);
      };

      websocket.onclose = event => {
        console.log(
          `[WebSocket] Area ${areaId} closed:`,
          event.code,
          event.reason
        );
        signals.isConnected.set(false);
        signals.isConnecting.set(false);
        this.connections.delete(areaId);

        if (event.code !== 1000) {
          this.attemptReconnect(areaId);
        }
      };

      this.connections.set(areaId, websocket);
    } catch (err) {
      console.error(`[WebSocket] Area ${areaId} connection failed:`, err);
      signals.error.set('Failed to establish WebSocket connection');
      signals.isConnecting.set(false);
    }
  }

  private initializeAreaSignals(areaId: number): void {
    if (!this.areaStates.has(areaId)) {
      this.areaStates.set(areaId, {
        isConnected: signal(false),
        isConnecting: signal(false),
        error: signal<string | null>(null),
        lastMessage: signal<WebSocketMessage | null>(null),
        machineStatuses: signal<{ [machineId: string]: MachineStatus }>({}),
      });
    }
  }

  private attemptReconnect(areaId: number): void {
    const attempts = this.reconnectAttempts.get(areaId) || 0;

    if (attempts < this.MAX_RECONNECT_ATTEMPTS) {
      console.log(
        `[WebSocket] Reconnecting to area ${areaId} in ${this.RECONNECT_DELAY}ms (attempt ${attempts + 1})`
      );
      const timeout = setTimeout(() => {
        this.reconnectAttempts.set(areaId, attempts + 1);
        this.connectToArea(areaId);
        this.reconnectTimeouts.delete(areaId);
      }, this.RECONNECT_DELAY);
      this.reconnectTimeouts.set(areaId, timeout);
    } else {
      console.error(
        `[WebSocket] Max reconnection attempts reached for area ${areaId}`
      );
      this.areaStates
        .get(areaId)!
        .error.set('Max reconnection attempts reached');
    }
  }

  getAreaState(areaId: number) {
    this.initializeAreaSignals(areaId);
    const signals = this.areaStates.get(areaId)!;

    return computed<AreaWebSocketState>(() => ({
      isConnected: signals.isConnected(),
      isConnecting: signals.isConnecting(),
      error: signals.error(),
      lastMessage: signals.lastMessage(),
      machineStatuses: signals.machineStatuses(),
    }));
  }

  getAreaMachineStatuses(areaId: number) {
    this.initializeAreaSignals(areaId);
    return this.areaStates.get(areaId)!.machineStatuses;
  }

  /**
   * Get a computed signal for a specific machine's status within an area
   * @param areaId - The area ID containing the machine
   * @param machineName - The machine name (will be converted to lowercase for matching)
   * @returns A computed signal that emits the machine status or null if not found
   */
  getMachineStatus(areaId: number, machineName: string) {
    this.initializeAreaSignals(areaId);
    const signals = this.areaStates.get(areaId)!;
    const machineKey = machineName.toLowerCase();

    return computed<MachineStatus | null>(() => {
      const statuses = signals.machineStatuses();
      return statuses[machineKey] || null;
    });
  }

  sendToArea(areaId: number, message: any): boolean {
    const connection = this.connections.get(areaId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  disconnectFromArea(areaId: number): void {
    const connection = this.connections.get(areaId);
    if (connection) {
      connection.close(1000, 'Manual disconnect');
      this.connections.delete(areaId);
    }

    const timeout = this.reconnectTimeouts.get(areaId);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(areaId);
    }

    this.reconnectAttempts.delete(areaId);
  }

  disconnectAll(): void {
    this.connections.forEach((_, areaId) => this.disconnectFromArea(areaId));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnectAll();
  }
}
