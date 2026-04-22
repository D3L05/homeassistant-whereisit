import { LitElement, html, css } from 'lit';
import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-textfield';

export class EditBoxDialog extends LitElement {
    static styles = css`
    mwc-textfield {
      width: 100%;
      margin-top: 16px;
    }
    .field-group {
      margin-top: 16px;
    }
    .field-group label {
      display: block;
      margin-bottom: 6px;
      color: rgba(0, 0, 0, 0.6);
      font-family: Roboto, sans-serif;
      font-size: 0.75rem;
      font-weight: 400;
    }
    .field-group select {
      width: 100%;
      padding: 14px 16px;
      box-sizing: border-box;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: Roboto, sans-serif;
      font-size: 1rem;
      background: white;
      appearance: auto;
    }
    .field-group select:focus {
      outline: none;
      border-color: var(--mdc-theme-primary, #6200ee);
      border-width: 2px;
    }
    .delete-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }
  `;

    static properties = {
        box: { type: Object },
        _units: { type: Array, state: true }
    };

    constructor() {
        super();
        this.box = null;
        this._units = [];
    }

    async show(box) {
        this.box = box;
        await this._fetchUnits();
        await this.updateComplete;
        this.shadowRoot.querySelector('mwc-dialog').show();
    }

    async _fetchUnits() {
        try {
            const url = window.AppRouter ? window.AppRouter.urlForPath('/api/units') : 'api/units';
            const response = await fetch(url);
            if (response.ok) {
                this._units = await response.json();
            }
        } catch (e) {
            console.error("Failed to load units", e);
        }
    }

    render() {
        if (!this.box) return html``;

        return html`
      <mwc-dialog heading="Edit Storage Box">
        <div>
          <mwc-textfield id="name" label="Name" .value=${this.box.name} dialogInitialFocus></mwc-textfield>
          <mwc-textfield id="description" label="Description" .value=${this.box.description || ''} icon="description"></mwc-textfield>
          <mwc-textfield id="slug" label="Slug (Optional ID)" .value=${this.box.slug || ''} icon="fingerprint" helper="Auto-generated if empty"></mwc-textfield>

          <div class="field-group">
            <label>Storage Unit</label>
            <select id="unit-select">
              ${this._units.map(u => html`
                <option value="${u.id}" ?selected=${u.id === this.box.unit_id}>${u.name}</option>
              `)}
            </select>
          </div>
        </div>
        
        <div class="delete-section">
            <mwc-button @click=${this._delete} style="--mdc-theme-primary: #f44336;">Delete Box</mwc-button>
        </div>

        <mwc-button slot="primaryAction" @click=${this._save}>Save</mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="close">Cancel</mwc-button>
      </mwc-dialog>
    `;
    }

    async _save() {
        const name = this.shadowRoot.getElementById('name').value;
        const description = this.shadowRoot.getElementById('description').value;
        const slug = this.shadowRoot.getElementById('slug').value;
        const unit_id = parseInt(this.shadowRoot.getElementById('unit-select').value);

        try {
            const url = window.AppRouter ? window.AppRouter.urlForPath(`/api/boxes/${this.box.id}`) : `api/boxes/${this.box.id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, slug, unit_id })
            });

            if (response.ok) {
                this.dispatchEvent(new CustomEvent('box-updated'));
                this.shadowRoot.querySelector('mwc-dialog').close();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async _delete() {
        if (!confirm(`Are you sure you want to delete "${this.box.name}"? This will delete all items inside!`)) return;

        try {
            const response = await fetch(`api/boxes/${this.box.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.dispatchEvent(new CustomEvent('box-deleted'));
                this.shadowRoot.querySelector('mwc-dialog').close();
            }
        } catch (e) {
            console.error(e);
        }
    }
}

customElements.define('edit-box-dialog', EditBoxDialog);
