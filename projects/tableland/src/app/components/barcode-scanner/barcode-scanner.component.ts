import { JsonPipe, NgIf } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  IScannerControls,
} from '@zxing/browser';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.scss'],
  imports: [FormsModule, JsonPipe, NgIf],
})
export class BarcodeScannerComponent implements OnDestroy {
  // Scanning state
  isScanning: boolean = false;
  activeInputId: string | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  // Scan results
  rawScanResult: string | null = null;
  parsedJson: any = null;
  scanType: 'barcode' | 'qrcode' | null = null;

  // Form data - Updated structure for 3 rows with component and raw material
  formData = {
    component1: '',
    rm1: '',
    component2: '',
    rm2: '',
    component3: '',
    rm3: '',
    jsonPayload: '',
  };

  private codeReader: BrowserMultiFormatReader;
  private controls: IScannerControls | null = null;

  constructor(private http: HttpClient) {
    this.codeReader = new BrowserMultiFormatReader();
  }

  async startScanning(inputId: string): Promise<void> {
    this.activeInputId = inputId;
    this.isScanning = true;
    this.errorMessage = null;
    this.rawScanResult = null;
    this.parsedJson = null;
    this.scanType = null;

    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();

      if (!devices || devices.length === 0) {
        throw new Error('No camera devices found');
      }

      this.controls = await this.codeReader.decodeFromVideoDevice(
        devices[0].deviceId,
        'video-preview',
        async (result: any | null, error: Error | null | undefined) => {
          if (result) {
            this.rawScanResult = result.getText();
            this.scanType =
              result.getBarcodeFormat() === BarcodeFormat.QR_CODE
                ? 'qrcode'
                : 'barcode';

            console.log('Scan detected:', {
              type: this.scanType,
              content: this.rawScanResult,
              activeInput: this.activeInputId
            });

            if (this.scanType === 'qrcode') {
              if (this.rawScanResult)
                await this.processQrCodeContent(this.rawScanResult);
            } else {
              // Handle barcode - this should populate the form field
              this.handleBarcodeData();
            }

            this.stopScanning();
          } else if (error && !this.isNoBarcodeError(error)) {
            console.warn('Scan error:', error);
          }
        }
      );
    } catch (err: unknown) {
      this.handleScanError(err);
    }
  }

  private async processQrCodeContent(content: string): Promise<void> {
    // First, try to parse directly as JSON
    if (this.tryParseAsJson(content)) {
      return; // Successfully parsed and handled
    }

    // If not JSON, check if it's a URL that might contain JSON
    if (this.isPotentialJsonUrl(content)) {
      this.isLoading = true;
      try {
        const response = await this.fetchWithMultipleFallbacks(content);
        this.parsedJson = response;
        this.handleJsonData();
      } catch (err) {
        console.warn('Failed to fetch JSON from URL:', err);
        this.errorMessage = this.getErrorMessage(err);
        // Show the URL to the user so they can access it manually
        this.handleUrlAsFallback(content);
      } finally {
        this.isLoading = false;
      }
    } else {
      // Treat as plain text/barcode
      this.handleBarcodeData();
    }
  }

  private tryParseAsJson(content: string): boolean {
    try {
      // Clean up the content - remove any leading/trailing whitespace
      const cleanContent = content.trim();

      // Check if it looks like JSON (starts with { or [)
      if (!cleanContent.startsWith('{') && !cleanContent.startsWith('[')) {
        return false;
      }

      // Try to parse as JSON
      this.parsedJson = JSON.parse(cleanContent);
      console.log('Successfully parsed embedded JSON:', this.parsedJson);

      // Handle the JSON data
      this.handleJsonData();
      return true;

    } catch (e) {
      console.log('Content is not valid JSON:', e);
      return false;
    }
  }

  private async fetchWithMultipleFallbacks(url: string): Promise<any> {
    const proxies = [
      // Try direct first
      null,
      // Multiple proxy services as fallbacks
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.allorigins.win/raw?url=',
    ];

    let lastError: Error | null = null;

    for (const proxy of proxies) {
      try {
        const requestUrl = proxy ? `${proxy}${encodeURIComponent(url)}` : url;
        console.log(`Trying to fetch from: ${proxy ? 'proxy' : 'direct'}`);

        const response = await this.http.get(requestUrl, {
          headers: proxy ? {} : { 'Accept': 'application/json' }
        }).toPromise();

        // Validate that we got JSON
        if (typeof response === 'object' && response !== null) {
          return response;
        } else if (typeof response === 'string') {
          return JSON.parse(response);
        }

        throw new Error('Invalid JSON response');
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed with ${proxy ? 'proxy' : 'direct'} method:`, error);

        // If it's not a CORS error, don't try other proxies
        if (!this.isCorsError(error)) {
          break;
        }
      }
    }

    throw lastError || new Error('All fetch attempts failed');
  }

  private handleUrlAsFallback(url: string): void {
    // Store the URL for manual access
    this.rawScanResult = url;
    this.scanType = 'qrcode';

    // If we have an active input, put the URL there
    if (this.activeInputId) {
      (this.formData as any)[this.activeInputId] = url;
    }

    // Also store in jsonPayload for reference
    this.formData.jsonPayload = `URL: ${url}\n\nNote: Could not fetch JSON due to CORS restrictions. Please access the URL manually.`;
  }

  private isCorsError(error: unknown): boolean {
    return (
      error instanceof HttpErrorResponse &&
      error.status === 0 &&
      error.statusText === 'Unknown Error'
    );
  }

  private getErrorMessage(error: unknown): string {
    if (this.isCorsError(error)) {
      return `CORS blocked access to the JSON data. The URL has been saved - you can open it manually to view the data.`;
    }
    if (error instanceof HttpErrorResponse) {
      return `HTTP Error ${error.status}: ${error.statusText || 'Unable to fetch JSON data'}`;
    }
    return error instanceof Error ? error.message : 'Unknown error occurred while fetching JSON';
  }

  isPotentialJsonUrl(text: string): boolean {
    try {
      const url = new URL(text);
      const isValidProtocol = url.protocol === 'http:' || url.protocol === 'https:';

      // Additional checks for JSON-like URLs
      const pathLower = url.pathname.toLowerCase();
      const hasJsonExtension = pathLower.endsWith('.json');
      const hasApiPath = pathLower.includes('/api/') || pathLower.includes('/data/');
      const hasJsonQuery = url.search.toLowerCase().includes('json') || url.search.toLowerCase().includes('format=json');

      // Return true if it's a valid URL and likely to contain JSON
      return isValidProtocol && (hasJsonExtension || hasApiPath || hasJsonQuery || text.length < 500);
    } catch {
      return false;
    }
  }

  private isNoBarcodeError(error: Error | null | undefined): boolean {
    return (
      error instanceof Error && error.message.includes('No barcode detected')
    );
  }

  private handleJsonData(): void {
    if (this.parsedJson) {
      // Try to map JSON fields to form fields if they exist
      if (this.parsedJson.component1) this.formData.component1 = this.parsedJson.component1;
      if (this.parsedJson.rm1) this.formData.rm1 = this.parsedJson.rm1;
      if (this.parsedJson.component2) this.formData.component2 = this.parsedJson.component2;
      if (this.parsedJson.rm2) this.formData.rm2 = this.parsedJson.rm2;
      if (this.parsedJson.component3) this.formData.component3 = this.parsedJson.component3;
      if (this.parsedJson.rm3) this.formData.rm3 = this.parsedJson.rm3;

      this.formData.jsonPayload = JSON.stringify(this.parsedJson, null, 2);
    }
  }

  private handleBarcodeData(): void {
    if (this.activeInputId && this.rawScanResult) {
      // Update the specific form field based on which input was being scanned
      switch (this.activeInputId) {
        case 'component1':
          this.formData.component1 = this.rawScanResult;
          break;
        case 'rm1':
          this.formData.rm1 = this.rawScanResult;
          break;
        case 'component2':
          this.formData.component2 = this.rawScanResult;
          break;
        case 'rm2':
          this.formData.rm2 = this.rawScanResult;
          break;
        case 'component3':
          this.formData.component3 = this.rawScanResult;
          break;
        case 'rm3':
          this.formData.rm3 = this.rawScanResult;
          break;
        case 'jsonPayload':
          this.formData.jsonPayload = this.rawScanResult;
          break;
        default:
          // Fallback to dynamic assignment
          (this.formData as any)[this.activeInputId] = this.rawScanResult;
      }

      console.log(`Barcode scanned for ${this.activeInputId}:`, this.rawScanResult);
      console.log('Updated formData:', this.formData);
    }
  }

  private handleScanError(err: unknown): void {
    this.isScanning = false;

    if (err instanceof Error) {
      if (err.name === 'NotAllowedError') {
        this.errorMessage =
          'Camera access denied. Please allow camera permissions.';
      } else if (err.name === 'NotFoundError') {
        this.errorMessage = 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        this.errorMessage = 'Camera not supported in this browser.';
      } else {
        this.errorMessage = err.message || 'Failed to initialize scanner';
      }
    } else {
      this.errorMessage = 'An unknown error occurred';
    }

    console.error('Scanner error:', err);
  }

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback for older browsers
      this.fallbackCopyTextToClipboard(text);
    }
  }

  private fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      console.log('URL copied to clipboard (fallback)');
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textArea);
  }

  stopScanning(): void {
    this.isScanning = false;
    this.controls?.stop();
    this.controls = null;

    // Force change detection to update the UI
    if (this.scanType === 'barcode' && this.rawScanResult) {
      // Trigger change detection by updating the form data again
      setTimeout(() => {
        if (this.activeInputId && this.rawScanResult) {
          this.handleBarcodeData();
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.stopScanning();
  }
}
