import { LitElement, html, css } from 'lit';
import '@material/mwc-button';
import '@material/mwc-icon';
import '@material/mwc-dialog';
import '@material/mwc-snackbar';
import '@material/mwc-circular-progress';

export class SettingsView extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 16px;
        }
        .settings-section {
            background: white;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        h2 {
            margin-top: 0;
            margin-bottom: 16px;
            color: var(--mdc-theme-primary);
        }
        p {
            color: #555;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        .action-buttons {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }
        mwc-button.danger {
            --mdc-theme-primary: #d32f2f;
            --mdc-theme-on-primary: white;
        }
    `;

    static properties = {
        isRestoring: { type: Boolean }
    };

    constructor() {
        super();
        this.isRestoring = false;
    }

    render() {
        return html`
            <div class="settings-section">
                <h2>Backup and Restore</h2>
                <p>
                    Download a full backup of your WhereIsIt data, including the database and all uploaded photos.
                    You can use this backup file to restore your data on this or another installation.
                </p>
                
                <div class="action-buttons">
                    <mwc-button raised icon="download" label="Download Backup" @click=${this._downloadBackup}></mwc-button>
                    <mwc-button raised class="danger" icon="restore" label="Restore Backup" @click=${this._promptRestore}></mwc-button>
                </div>
                
                <input type="file" id="restoreInput" accept=".zip" style="display: none" @change=${this._handleRestoreUpload}>
            </div>

            <!-- Restore Confirmation Dialog -->
            <mwc-dialog id="restoreConfirmDialog" heading="Confirm Restore">
                <p style="color: #d32f2f; font-weight: bold;">WARNING: This will permanently overwrite your current database and all photos.</p>
                <p>Are you absolutely sure you want to restore from a backup?</p>
                <mwc-button slot="primaryAction" dialogAction="cancel" label="Cancel"></mwc-button>
                <mwc-button slot="secondaryAction" class="danger" label="Yes, Restore" @click=${this._triggerFileInput}></mwc-button>
            </mwc-dialog>
            
            <!-- Restoring Progress Dialog -->
            <mwc-dialog id="restoringDialog" heading="Restoring..." scrimClickAction="">
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px;">
                    <mwc-circular-progress indeterminate></mwc-circular-progress>
                    <p style="margin-top: 16px; text-align: center;">Uploading and applying backup...<br>The addon will automatically restart. Please wait.</p>
                </div>
            </mwc-dialog>

            <!-- Snackbar -->
            <mwc-snackbar id="snackbar"></mwc-snackbar>
        `;
    }

    _downloadBackup() {
        const url = window.AppRouter ? window.AppRouter.urlForPath('/api/backup') : '/api/backup';
        window.location.href = url;
    }

    _promptRestore() {
        this.shadowRoot.getElementById('restoreConfirmDialog').show();
    }

    _triggerFileInput() {
        this.shadowRoot.getElementById('restoreConfirmDialog').close();
        this.shadowRoot.getElementById('restoreInput').click();
    }

    async _handleRestoreUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.zip')) {
            this._showError("Please select a valid .zip backup file.");
            e.target.value = '';
            return;
        }

        this.shadowRoot.getElementById('restoringDialog').show();

        const formData = new FormData();
        formData.append('file', file);

        try {
            const url = window.AppRouter ? window.AppRouter.urlForPath('/api/restore') : '/api/restore';
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // If it succeeds, the backend will exit(1) and s6-overlay will restart it.
                // We should poll or just wait a few seconds and refresh.
                setTimeout(() => {
                    window.location.href = window.AppRouter ? window.AppRouter.urlForPath('/') : '/';
                }, 5000);
            } else {
                const err = await response.json();
                this._showError(err.detail || "Restore failed.");
                this.shadowRoot.getElementById('restoringDialog').close();
            }
        } catch (error) {
            console.error(error);
            // Ignore fetch error if the server instantly closed the connection due to restart
            setTimeout(() => {
                window.location.href = window.AppRouter ? window.AppRouter.urlForPath('/') : '/';
            }, 5000);
        }
        
        e.target.value = '';
    }

    _showError(message) {
        const snackbar = this.shadowRoot.getElementById('snackbar');
        snackbar.labelText = message;
        snackbar.show();
    }
}
customElements.define('settings-view', SettingsView);
