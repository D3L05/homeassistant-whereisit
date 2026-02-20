import { LitElement, html, css } from 'lit';
import '@material/mwc-dialog';
import '@material/mwc-button';
import '@material/mwc-textfield';

export class EditUnitDialog extends LitElement {
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
        unit: { type: Object }
    };

    constructor() {
        super();
        this.unit = null;
    }

    async show(unit) {
        this.unit = unit;
        await this.updateComplete;
        this.shadowRoot.querySelector('mwc-dialog').show();
    }

    render() {
        if (!this.unit) return html``;

        return html`
      <mwc-dialog heading="Edit Storage Unit">
        <div>
          <mwc-textfield id="name" label="Name" .value=${this.unit.name} dialogInitialFocus></mwc-textfield>
          <mwc-textfield id="description" label="Description" .value=${this.unit.description || ''} icon="description"></mwc-textfield>
        </div>
        
        <div class="delete-section">
            <mwc-button @click=${this._delete} style="--mdc-theme-primary: #f44336;">Delete Unit</mwc-button>
        </div>

        <mwc-button slot="primaryAction" @click=${this._save}>Save</mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="close">Cancel</mwc-button>
      </mwc-dialog>
    `;
    }

    async _save() {
        const name = this.shadowRoot.getElementById('name').value;
        const description = this.shadowRoot.getElementById('description').value;

        try {
            const response = await fetch(`api/units/${this.unit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });

            if (response.ok) {
                this.dispatchEvent(new CustomEvent('unit-updated'));
                this.shadowRoot.querySelector('mwc-dialog').close();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async _delete() {
        if (!confirm(`Are you sure you want to delete "${this.unit.name}"? This will delete all boxes inside!`)) return;

        try {
            const response = await fetch(`api/units/${this.unit.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.dispatchEvent(new CustomEvent('unit-deleted'));
                this.shadowRoot.querySelector('mwc-dialog').close();
            }
        } catch (e) {
            console.error(e);
        }
    }
}

customElements.define('edit-unit-dialog', EditUnitDialog);
