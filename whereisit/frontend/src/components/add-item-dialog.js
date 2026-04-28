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
      .file-input {
        margin-top: 8px;
        margin-bottom: 16px;
        width: 100%;
      }
      .file-input label {
        display: block;
        margin-bottom: 4px;
        color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.6));
        font-family: Roboto, sans-serif;
        font-size: 0.75rem;
      }
      .category-container {
          margin-top: 16px;
      }
      .category-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
      }
      .category-pill {
          display: inline-flex;
          align-items: center;
          background: #e3f2fd;
          color: #1565c0;
          border-radius: 16px;
          padding: 4px 8px 4px 12px;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid #bbdefb;
      }
      .category-pill mwc-icon {
          font-size: 18px;
          cursor: pointer;
          margin-left: 4px;
          color: #1976d2;
      }
      .category-pill mwc-icon:hover {
          color: #b71c1c;
      }
      .category-input-group {
          display: flex;
          gap: 8px;
      }
      .category-input-group input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: Roboto, sans-serif;
          font-size: 1rem;
      }
      .category-input-group input:focus {
          outline: none;
          border-color: var(--mdc-theme-primary, #6200ee);
          border-width: 2px;
          padding: 11px 15px;
      }
    `;

  static properties = {
    boxId: { type: Number },
    categories: { type: Array },
    selectedCategories: { type: Array }
  };

  constructor() {
    super();
    this.categories = [];
    this.selectedCategories = [];
  }

  async connectedCallback() {
    super.connectedCallback();
    try {
      const response = await fetch(window.AppRouter ? window.AppRouter.urlForPath(`/api/categories`) : `api/categories`);
      if (response.ok) {
        this.categories = await response.json();
      }
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  }

  render() {
    return html`
        <mwc-dialog heading="Add Item">
          <div>
            <mwc-textfield label="Name" dialogInitialFocus></mwc-textfield>
            <mwc-textfield label="Description" icon="description"></mwc-textfield>
            
            <div class="category-container">
              <div class="category-pills">
                ${this.selectedCategories.map(cat => html`
                  <span class="category-pill">
                    ${cat}
                    <mwc-icon @click=${() => this._removeCategory(cat)}>close</mwc-icon>
                  </span>
                `)}
              </div>
              <div class="category-input-group">
                <input type="text" id="category-input" list="category-list" placeholder="Add category..." 
                  @keydown=${this._handleCategoryKeydown}
                  @input=${this._handleCategoryInput} />
                <datalist id="category-list">
                  ${this.categories.map(c => html`<option value="${c}"></option>`)}
                </datalist>
              </div>
            </div>

            <mwc-textfield label="Quantity" type="number" icon="numbers" value="1"></mwc-textfield>
            <div class="file-input">
                <label>Photo</label>
                <input type="file" id="photo-upload" accept="image/*" capture="environment" />
            </div>
          </div>
          <mwc-button slot="primaryAction" @click=${this._save}>Save</mwc-button>
          <mwc-button slot="secondaryAction" dialogAction="cancel">Cancel</mwc-button>
        </mwc-dialog>
      `;
  }

  show() {
    this.shadowRoot.querySelector('mwc-dialog').show();
  }



  _handleCategoryKeydown(e) {
      if (e.key === 'Enter') {
          e.preventDefault();
          this._addCategory(e.target.value);
      }
  }

  _handleCategoryInput(e) {
      const val = e.target.value;
      if (this.categories.includes(val)) {
          this._addCategory(val);
      }
  }

  _addCategory(name) {
      const val = name.trim();
      if (val && !this.selectedCategories.includes(val)) {
          this.selectedCategories = [...this.selectedCategories, val];
          this.shadowRoot.getElementById('category-input').value = '';
      }
  }

  _removeCategory(cat) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
  }

  async _save() {
    const inputs = this.shadowRoot.querySelectorAll('mwc-textfield');
    const name = inputs[0].value;
    const description = inputs[1].value;
    const quantity = parseInt(inputs[2].value) || 1;
    const photoInput = this.shadowRoot.getElementById('photo-upload');

    if (!name) {
      inputs[0].setCustomValidity("Name is required");
      inputs[0].reportValidity();
      return;
    }

    try {
      const response = await fetch(window.AppRouter ? window.AppRouter.urlForPath(`/api/boxes/${this.boxId}/items`) : `api/boxes/${this.boxId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, categories: this.selectedCategories, quantity })
      });

      if (response.ok) {
        const createdItem = await response.json();

        // If a photo was selected, upload it now
        if (photoInput.files && photoInput.files.length > 0) {
          const file = photoInput.files[0];
          const formData = new FormData();
          formData.append('file', file);

          const uploadUrl = window.AppRouter ? window.AppRouter.urlForPath(`/api/items/${createdItem.id}/photo`) : `api/items/${createdItem.id}/photo`;
          await fetch(uploadUrl, { method: 'POST', body: formData });
        }

        this.dispatchEvent(new CustomEvent('item-added', { bubbles: true, composed: true }));
        this.shadowRoot.querySelector('mwc-dialog').close();
        inputs.forEach(i => i.value = '');
        this.shadowRoot.getElementById('category-input').value = '';
        this.selectedCategories = [];
        inputs[2].value = "1";
        if (photoInput) photoInput.value = "";

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
