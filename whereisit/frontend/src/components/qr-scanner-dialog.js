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
        _scanning: { type: Boolean }
    };

    constructor() {
        super();
        this._scanning = false;
        this._html5QrCode = null;
        this._originalGetElementById = null;
        this._originalQuerySelector = null;
    }

    async show() {
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
      </style>
      <mwc-dialog heading="Scan QR Code" @closed=${this._stopScanner}>
        <div id="reader"></div>
        <p class="scanner-tip">Point your camera at a Box QR code</p>
        <mwc-button slot="secondaryAction" dialogAction="close">Cancel</mwc-button>
      </mwc-dialog>
    `;
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
            const dialog = this.querySelector('mwc-dialog');
            if (dialog) dialog.close();
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
