import { LitElement, html, css } from 'lit';
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-button';

export class AddBoxDialog extends LitElement {
    static styles = css`
      :host { display: block; }
      mwc-textfield {
        width: 100%;
        margin-bottom: 16px;
      }
    `;

    static properties = {
        unitId: { type: Number }
    };

    render() {
        return html`
        <mwc-dialog heading="Add Box">
          <div>
            <mwc-textfield label="Name" dialogInitialFocus></mwc-textfield>
            <mwc-textfield label="Description" icon="description"></mwc-textfield>
            <mwc-textfield label="Slug (Optional ID)" icon="fingerprint" helper="Auto-generated if empty"></mwc-textfield>
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
        const slug = inputs[2].value;

        if (!name) {
            inputs[0].setCustomValidity("Name is required");
            inputs[0].reportValidity();
            return;
        }

        try {
            const payload = { name, description, unit_id: Number(this.unitId) };
            if (slug) payload.slug = slug;

            const response = await fetch(window.AppRouter ? window.AppRouter.urlForPath('/api/boxes') : 'api/boxes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                this.dispatchEvent(new CustomEvent('box-added', { bubbles: true, composed: true }));
                this.shadowRoot.querySelector('mwc-dialog').close();
                inputs.forEach(i => i.value = '');
            } else {
                alert('Failed to save box');
            }
        } catch (e) {
            console.error("Error saving box", e);
            alert('Error saving box');
        }
    }
}
customElements.define('add-box-dialog', AddBoxDialog);
