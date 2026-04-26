import { LitElement, html, css } from 'lit';
import '@material/mwc-dialog';
import '@material/mwc-button';
import { Html5Qrcode } from 'html5-qrcode';

export class QrScannerDialog extends LitElement {
    // Continue using Light DOM for easier access
    createRenderRoot() {
        return this;
    }

    static properties = {
        _scanning: { type: Boolean },
        _errorMessage: { type: String },
        _errorDetails: { type: String }
    };

    constructor() {
        super();
        this._scanning = false;
        this._errorMessage = '';
        this._errorDetails = '';
        this._html5QrCode = null;
        this._originalGetElementById = null;
        this._originalQuerySelector = null;
    }

    async show() {
        this._errorMessage = '';
        this._errorDetails = '';
        const dialog = this.querySelector('mwc-dialog');
        if (dialog) {
            dialog.show();
            // Ensure element is rendered and reachable
            await new Promise(r => setTimeout(r, 300));
            this._startScanner();
        }
    }

    render() {
        return html`
      <style>
        qr-scanner-dialog #reader {
          width: 100%;
          min-height: 250px;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 10px;
        }
        qr-scanner-dialog .scanner-tip {
          text-align: center;
          margin: 16px 0;
          color: #666;
          font-size: 0.9em;
        }
        /* Style the internal video element that the library injects */
        #reader video {
            width: 100% !important;
            height: auto !important;
            border-radius: 8px;
        }
        qr-scanner-dialog .scanner-error {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 16px;
          margin-top: 10px;
          text-align: center;
        }
        qr-scanner-dialog .scanner-error .error-icon {
          font-size: 2em;
          margin-bottom: 8px;
        }
        qr-scanner-dialog .scanner-error .error-title {
          font-weight: 600;
          color: #dc2626;
          margin: 0 0 8px 0;
          font-size: 1em;
        }
        qr-scanner-dialog .scanner-error .error-message {
          color: #7f1d1d;
          margin: 0 0 8px 0;
          font-size: 0.9em;
          line-height: 1.4;
        }
        qr-scanner-dialog .scanner-error .error-details {
          color: #999;
          margin: 8px 0 0 0;
          font-size: 0.75em;
          font-family: monospace;
          word-break: break-word;
        }
      </style>
      <mwc-dialog heading="Scan QR Code" @closed=${this._onDialogClosed}>
        ${this._errorMessage ? html`
          <div class="scanner-error">
            <div class="error-icon">⚠️</div>
            <p class="error-title">Camera Unavailable</p>
            <p class="error-message">${this._errorMessage}</p>
            ${this._errorDetails ? html`<p class="error-details">Error: ${this._errorDetails}</p>` : ''}
          </div>
        ` : html`
          <div id="reader"></div>
          <p class="scanner-tip">Point your camera at a Box QR code</p>
        `}
        <mwc-button slot="secondaryAction" dialogAction="close">Cancel</mwc-button>
      </mwc-dialog>
    `;
    }

    _classifyError(err) {
        const msg = (err?.message || err?.toString?.() || '').toLowerCase();
        const name = (err?.name || '').toLowerCase();

        // Check insecure context (HTTP without localhost)
        if (!window.isSecureContext) {
            return {
                message: 'Camera access requires a secure (HTTPS) connection. Your Home Assistant instance is running on HTTP.\n\nTo fix this, you can:\n• Enable SSL in Home Assistant\n• Use Nabu Casa (HA Cloud) for automatic HTTPS\n• Set up a reverse proxy with SSL (nginx, Caddy)',
                details: `Protocol: ${window.location.protocol} | Host: ${window.location.hostname}`
            };
        }

        // Permission denied by user or browser policy
        if (name === 'notallowederror' || msg.includes('permission denied') || msg.includes('permission dismissed') || msg.includes('not allowed')) {
            return {
                message: 'Camera permission was denied. Please allow camera access in your browser settings:\n\n• Click the lock/info icon in the address bar\n• Set Camera to "Allow"\n• Reload the page and try again',
                details: err.message
            };
        }

        // No camera found on device
        if (name === 'notfounderror' || msg.includes('requested device not found') || msg.includes('no camera') || msg.includes('could not find')) {
            return {
                message: 'No camera was found on this device. QR scanning requires a device with a camera (phone, tablet, or laptop with webcam).',
                details: err.message
            };
        }

        // Camera already in use by another app/tab
        if (name === 'notreadableerror' || msg.includes('could not start') || msg.includes('already in use') || msg.includes('not readable')) {
            return {
                message: 'The camera is being used by another application or browser tab. Please close other apps using the camera and try again.',
                details: err.message
            };
        }

        // getUserMedia not supported at all
        if (msg.includes('getusermedia') || msg.includes('not supported') || msg.includes('mediadevices')) {
            return {
                message: 'Your browser does not support camera access. Please try using a modern browser like Chrome, Firefox, or Safari.',
                details: err.message
            };
        }

        // Overconstrained (e.g., requested facing mode not available)
        if (name === 'overconstrainederror' || msg.includes('overconstrained')) {
            return {
                message: 'The requested camera configuration is not available on this device. This can happen if the device does not have a rear-facing camera.',
                details: err.message
            };
        }

        // Fallback: unknown error
        return {
            message: 'An unexpected error occurred while trying to access the camera. Please check your browser and device settings.',
            details: err.message || String(err)
        };
    }

    async _startScanner() {
        if (this._scanning) return;

        try {
            const readerElement = this.querySelector('#reader');
            if (!readerElement) {
                console.error("Reader element not found in component");
                return;
            }

            // ULTIMATE SHADOW DOM FIX: Monkey-patch the document lookups.
            // The library uses document.getElementById('reader') internally.
            this._originalGetElementById = document.getElementById;
            this._originalQuerySelector = document.querySelector;

            const self = this;
            document.getElementById = function (id) {
                if (id === 'reader') return readerElement;
                return self._originalGetElementById.apply(document, arguments);
            };
            document.querySelector = function (selector) {
                if (selector === '#reader' || selector === 'reader') return readerElement;
                return self._originalQuerySelector.apply(document, arguments);
            };

            this._html5QrCode = new Html5Qrcode("reader", { verbose: false });

            await this._html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    this._handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // ignore scan errors
                }
            );

            this._scanning = true;
            console.log("[Prod Debug] Scanner started successfully with proxy.");
        } catch (err) {
            console.error("Scanner start error:", err);
            this._restoreDocument();
            const { message, details } = this._classifyError(err);
            this._errorMessage = message;
            this._errorDetails = details;
        }
    }

    _restoreDocument() {
        if (this._originalGetElementById) {
            document.getElementById = this._originalGetElementById;
            this._originalGetElementById = null;
        }
        if (this._originalQuerySelector) {
            document.querySelector = this._originalQuerySelector;
            this._originalQuerySelector = null;
        }
    }

    async _onDialogClosed() {
        this._errorMessage = '';
        this._errorDetails = '';
        await this._stopScanner();
    }

    async _stopScanner() {
        this._restoreDocument();

        if (!this._scanning || !this._html5QrCode) return;

        try {
            await this._html5QrCode.stop();
            this._html5QrCode.clear();
        } catch (err) {
            console.error("Scanner stop error:", err);
        } finally {
            this._scanning = false;
            this._html5QrCode = null;
        }
    }

    _handleScanSuccess(decodedText) {
        console.log("[Prod Debug] Scanned:", decodedText);
        this._stopScanner();
        const dialog = this.querySelector('mwc-dialog');
        if (dialog) dialog.close();

        try {
            let path = "";
            if (decodedText.startsWith('http') || decodedText.startsWith('/')) {
                // It's a URL or absolute path
                let url;
                try {
                    url = new URL(decodedText, window.location.origin);
                } catch (e) {
                    // Handle malformed URLs by looking at string directly
                    url = { pathname: decodedText, hash: "" };
                }

                // Check pathname OR hash for /box/ or /unit/
                const fullString = url.pathname + (url.hash || "");
                const match = fullString.match(/\/(unit|box)\/([^\/]+)/);

                if (match) {
                    path = `/${match[1]}/${match[2]}`;
                }
            }

            // Fallback: if no path found yet, treat decodedText as a slug/id
            if (!path && decodedText) {
                path = `/box/${decodedText}`;
            }

            if (path) {
                console.log("[Prod Debug] QR Dispatched path:", path);
                this.dispatchEvent(new CustomEvent('qr-scanned', {
                    detail: { path },
                    bubbles: true,
                    composed: true
                }));
            }
        } catch (e) {
            console.error("Parse error", e);
        }
    }
}

customElements.define('qr-scanner-dialog', QrScannerDialog);
