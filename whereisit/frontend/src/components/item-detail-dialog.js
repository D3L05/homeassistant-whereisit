import { LitElement, html, css } from 'lit';
import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-icon';
import '@material/mwc-icon-button';

export class ItemDetailDialog extends LitElement {
    static styles = css`
    .detail-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    .photo-container {
        width: 100%;
        max-height: 400px;
        border-radius: 8px;
        overflow: hidden;
        background: #f0f0f0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    .no-photo {
        padding: 48px;
        color: #9e9e9e;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
    }
    .label {
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.6));
        font-size: 0.875rem;
    }
    .value {
        font-size: 1rem;
        font-weight: 500;
        text-align: right;
    }
    .description-box {
        background: #f9f9f9;
        padding: 12px;
        border-radius: 4px;
        font-style: italic;
        color: #555;
    }
  `;

    static properties = {
        item: { type: Object }
    };

    constructor() {
        super();
        this.item = null;
    }

    async show(item) {
        this.item = item;
        await this.updateComplete;
        this.shadowRoot.querySelector('mwc-dialog').show();
    }

    render() {
        if (!this.item) return html``;

        return html`
      <mwc-dialog heading="${this.item.name}">
        <div class="detail-container">
            <div class="photo-container">
                ${this.item.photo_path
                ? html`<img src="${window.AppRouter ? window.AppRouter.urlForPath(this.item.photo_path) : this.item.photo_path}" />`
                : html`<div class="no-photo">
                            <mwc-icon style="--mdc-icon-size: 64px;">image_not_supported</mwc-icon>
                            <span>No photo available</span>
                       </div>`}
            </div>

            <div class="info-row">
                <span class="label">Location</span>
                <span class="value">${this.item.box ? this.item.box.name : 'Unknown Box'}</span>
            </div>
            
            <div class="info-row">
                <span class="label">Category</span>
                <span class="value" style="color: var(--mdc-theme-primary);">${this.item.category || 'Uncategorized'}</span>
            </div>

            <div class="info-row">
                <span class="label">Quantity</span>
                <span class="value">x${this.item.quantity}</span>
            </div>

            ${this.item.description ? html`
                <div class="description-box">
                    ${this.item.description}
                </div>
            ` : ''}
        </div>
        
        <mwc-button slot="primaryAction" @click=${this._editItem}>Edit</mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="close">Close</mwc-button>
      </mwc-dialog>
    `;
    }

    _editItem() {
        this.shadowRoot.querySelector('mwc-dialog').close();
        this.dispatchEvent(new CustomEvent('edit-item-requested', {
            detail: { item: this.item },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('item-detail-dialog', ItemDetailDialog);
