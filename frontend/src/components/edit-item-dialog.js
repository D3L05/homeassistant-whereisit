import { LitElement, html, css } from 'lit';
import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-textfield';

export class EditItemDialog extends LitElement {
    static styles = css`
    mwc-textfield {
      width: 100%;
      margin-top: 16px;
    }
    .delete-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
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
      <mwc-dialog heading="Edit Item">
        <div>
          <mwc-textfield id="name" label="Name" .value=${this.item.name} dialogInitialFocus></mwc-textfield>
          <mwc-textfield id="description" label="Description" .value=${this.item.description || ''} icon="description"></mwc-textfield>
          <mwc-textfield id="quantity" label="Quantity" type="number" .value=${this.item.quantity} icon="numbers"></mwc-textfield>
        </div>
        
        <div class="delete-section">
            <mwc-button @click=${this._delete} style="--mdc-theme-primary: #f44336;">Delete Item</mwc-button>
        </div>

        <mwc-button slot="primaryAction" @click=${this._save}>Save</mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="close">Cancel</mwc-button>
      </mwc-dialog>
    `;
    }

    async _save() {
        const name = this.shadowRoot.getElementById('name').value;
        const description = this.shadowRoot.getElementById('description').value;
        const quantity = parseInt(this.shadowRoot.getElementById('quantity').value);

        try {
            const response = await fetch(`api/items/${this.item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, quantity })
            });

            if (response.ok) {
                this.dispatchEvent(new CustomEvent('item-updated'));
                this.shadowRoot.querySelector('mwc-dialog').close();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async _delete() {
        if (!confirm(`Are you sure you want to delete "${this.item.name}"?`)) return;

        try {
            const response = await fetch(`api/items/${this.item.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.dispatchEvent(new CustomEvent('item-deleted'));
                this.shadowRoot.querySelector('mwc-dialog').close();
            }
        } catch (e) {
            console.error(e);
        }
    }
}

customElements.define('edit-item-dialog', EditItemDialog);
