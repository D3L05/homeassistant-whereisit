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
    .file-input {
      margin-top: 16px;
      width: 100%;
    }
    .file-input label {
      display: block;
      margin-bottom: 4px;
      color: var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.6));
      font-family: Roboto, sans-serif;
      font-size: 0.75rem;
    }
    .current-photo {
        max-width: 100%;
        max-height: 200px;
        margin-top: 8px;
        border-radius: 8px;
        object-fit: contain;
    }
    .delete-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
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
        item: { type: Object },
        categories: { type: Array },
        selectedCategories: { type: Array },
        _units: { type: Array, state: true }
    };

    constructor() {
        super();
        this.item = null;
        this.categories = [];
        this.selectedCategories = [];
        this._units = [];
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

    async show(item) {
        this.item = item;
        this.selectedCategories = item.categories || [];
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
        if (!this.item) return html``;

        return html`
      <mwc-dialog heading="Edit Item">
        <div>
          <mwc-textfield id="name" label="Name" .value=${this.item.name} dialogInitialFocus></mwc-textfield>
          <mwc-textfield id="description" label="Description" .value=${this.item.description || ''} icon="description"></mwc-textfield>
          
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
              <input type="text" id="category-input" list="edit-category-list" placeholder="Add category..." 
                @keydown=${this._handleCategoryKeydown}
                @input=${this._handleCategoryInput} />
              <datalist id="edit-category-list">
                ${this.categories.map(c => html`<option value="${c}"></option>`)}
              </datalist>
            </div>
          </div>

          <mwc-textfield id="quantity" label="Quantity" type="number" .value=${this.item.quantity} icon="numbers"></mwc-textfield>

          <div class="field-group">
            <label>Move to Box</label>
            <select id="box-select">
              ${this._units.map(unit => html`
                <optgroup label="${unit.name}">
                  ${(unit.boxes || []).map(box => html`
                    <option value="${box.id}" ?selected=${box.id === this.item.box_id}>${box.name}</option>
                  `)}
                </optgroup>
              `)}
            </select>
          </div>
          
          <div class="file-input">
            <label>Update Photo</label>
            <input type="file" id="photo-upload" accept="image/*" capture="environment" />
            ${this.item.photo_path
                ? html`<img src="${window.AppRouter ? window.AppRouter.urlForPath(this.item.photo_path) : this.item.photo_path}" class="current-photo" />`
                : ''}
          </div>
        </div>
        
        <div class="delete-section">
            <mwc-button @click=${this._delete} style="--mdc-theme-primary: #f44336;">Delete Item</mwc-button>
        </div>

        <mwc-button slot="primaryAction" @click=${this._save}>Save</mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="close">Cancel</mwc-button>
      </mwc-dialog>
    `;
    }



    _handleCategoryKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this._addCategory(e.target.value);
        }
    }

    _handleCategoryInput(e) {
        // Check if value exists in datalist (user selected from dropdown)
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
        const name = this.shadowRoot.getElementById('name').value;
        const description = this.shadowRoot.getElementById('description').value;
        const quantity = parseInt(this.shadowRoot.getElementById('quantity').value);
        const box_id = parseInt(this.shadowRoot.getElementById('box-select').value);
        const photoInput = this.shadowRoot.getElementById('photo-upload');

        try {
            const url = window.AppRouter ? window.AppRouter.urlForPath(`/api/items/${this.item.id}`) : `api/items/${this.item.id}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, categories: this.selectedCategories, quantity, box_id })
            });

            if (response.ok) {
                // Handle optional photo update
                if (photoInput.files && photoInput.files.length > 0) {
                    const file = photoInput.files[0];
                    const formData = new FormData();
                    formData.append('file', file);

                    const uploadUrl = window.AppRouter ? window.AppRouter.urlForPath(`/api/items/${this.item.id}/photo`) : `api/items/${this.item.id}/photo`;
                    await fetch(uploadUrl, { method: 'POST', body: formData });
                }

                this.dispatchEvent(new CustomEvent('item-updated'));
                this.shadowRoot.querySelector('mwc-dialog').close();
                if (photoInput) photoInput.value = "";
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
