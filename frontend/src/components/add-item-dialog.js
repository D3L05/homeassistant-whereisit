import { LitElement, html, css } from 'lit';
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-button';

export class AddItemDialog extends LitElement {
    static styles = css`
      :host { display: block; }
      mwc-textfield {
        width: 100%;
        margin-bottom: 16px;
      }
    `;

    static properties = {
        boxId: { type: Number }
    };

    render() {
        return html`
        <mwc-dialog heading="Add Item">
          <div>
            <mwc-textfield label="Name" dialogInitialFocus></mwc-textfield>
            <mwc-textfield label="Description" icon="description"></mwc-textfield>
            <mwc-textfield label="Quantity" type="number" icon="numbers" value="1"></mwc-textfield>
          </div>
          <mwc-button slot="primaryAction" @click=${this._save}>Save</mwc-button>
          <mwc-button slot="secondaryAction" dialogAction="cancel">Cancel</mwc-button>
        </mwc-dialog>
      `;
    }

    show() {
        this.shadowRoot.querySelector('mwc-dialog').show();
    }

    async _save() {
        const inputs = this.shadowRoot.querySelectorAll('mwc-textfield');
        const name = inputs[0].value;
        const description = inputs[1].value;
        const quantity = parseInt(inputs[2].value) || 1;

        if (!name) {
            inputs[0].setCustomValidity("Name is required");
            inputs[0].reportValidity();
            return;
        }

        try {
            const response = await fetch(window.AppRouter ? window.AppRouter.urlForPath(`/api/boxes/${this.boxId}/items`) : `api/boxes/${this.boxId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, quantity })
            });

            if (response.ok) {
                this.dispatchEvent(new CustomEvent('item-added', { bubbles: true, composed: true }));
                this.shadowRoot.querySelector('mwc-dialog').close();
                inputs.forEach(i => i.value = '');
                inputs[2].value = "1";
            } else {
                alert('Failed to save item');
            }
        } catch (e) {
            console.error("Error saving item", e);
            alert('Error saving item');
        }
    }
}
customElements.define('add-item-dialog', AddItemDialog);
