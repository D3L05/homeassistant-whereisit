import { LitElement, html, css } from 'lit';
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-button';

export class AddUnitDialog extends LitElement {
  static styles = css`
    :host { display: block; }
    mwc-textfield {
      width: 100%;
      margin-bottom: 16px;
    }
  `;

  render() {
    return html`
      <mwc-dialog heading="Add Storage Unit">
        <div>
          <mwc-textfield label="Name" dialogInitialFocus></mwc-textfield>
          <mwc-textfield label="Description" icon="description"></mwc-textfield>
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
    const nameField = this.shadowRoot.querySelectorAll('mwc-textfield')[0];
    const descField = this.shadowRoot.querySelectorAll('mwc-textfield')[1];

    const name = nameField.value;
    const description = descField.value;

    if (!name) {
      nameField.setCustomValidity("Name is required");
      nameField.reportValidity();
      return;
    }

    try {
      const response = await fetch(window.AppRouter ? window.AppRouter.urlForPath('/api/units') : 'api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });

      if (response.ok) {
        this.dispatchEvent(new CustomEvent('unit-added', { bubbles: true, composed: true }));
        this.shadowRoot.querySelector('mwc-dialog').close();
        nameField.value = '';
        descField.value = '';
      } else {
        alert('Failed to save unit');
      }
    } catch (e) {
      console.error("Error saving unit", e);
      alert('Error saving unit');
    }
  }
}
customElements.define('add-unit-dialog', AddUnitDialog);
