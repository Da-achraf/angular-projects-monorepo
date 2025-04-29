import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * A service for interacting with the browser's localStorage in a safe way.
 *
 * This service provides methods to save, retrieve, and remove items from localStorage,
 * handling JSON serialization and deserialization automatically.
 *
 * It uses Angular's `DOCUMENT` injection token to access the window object safely.
 * 
 * Provided in the root injector, making it available application-wide as a singleton.
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  /**
   * Reference to the global document object using Angular's dependency injection.
   */
  private document = inject(DOCUMENT);

  /**
   * Safely accesses localStorage via the injected document object.
   */
  private localStorage = this.document.defaultView?.localStorage;

  /**
   * Retrieves an item from localStorage by key.
   *
   * @param key - The key of the item to retrieve.
   * @returns The parsed JSON value if the item exists, `null` if not found,
   *          or `false` if localStorage is not available.
   */
  getItem(key: string): any | null | false {
    if (this.localStorage) {
      const item = this.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return false;
  }

  /**
   * Saves an item to localStorage after stringifying it.
   *
   * @param key - The key under which to store the value.
   * @param value - The value to store (will be stringified).
   * @returns `true` if the item was saved successfully, otherwise `false`.
   */
  saveItem(key: string, value: any): boolean {
    if (this.localStorage) {
      this.localStorage.setItem(key, JSON.stringify(value));
      return true;
    }
    return false;
  }

  /**
   * Removes an item from localStorage by key.
   *
   * @param key - The key of the item to remove.
   * @returns `true` if the item was removed successfully, otherwise `false`.
   */
  removeItem(key: string): boolean {
    if (this.localStorage) {
      this.localStorage.removeItem(key);
      return true;
    }
    return false;
  }
}
