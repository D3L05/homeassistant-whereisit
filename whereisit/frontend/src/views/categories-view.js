import { LitElement, html, css } from 'lit';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item.js';
import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-dialog';
import '@material/mwc-textfield';

export class CategoriesView extends LitElement {
    static styles = css`
    :host { display: block; padding: 16px; }
    h2 { margin-top: 0; }
    .category-list {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .action-icons {
        display: flex;
        gap: 8px;
    }
    .empty-state {
        padding: 32px;
        text-align: center;
        color: #757575;
    }
  `;

    static properties = {
        categories: { type: Array },
        isRenaming: { type: Boolean },
        categoryToRename: { type: String }
    };

    constructor() {
        super();
        this.categories = [];
        this.isRenaming = false;
        this.categoryToRename = "";
    }

    async connectedCallback() {
        super.connectedCallback();
        this._fetchCategories();
    }

    async _fetchCategories() {
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
      <h2>Manage Categories</h2>
      
      <div class="category-list">
        ${this.categories.length === 0 ? html`
            <div class="empty-state">
                <mwc-icon style="--mdc-icon-size: 48px; opacity: 0.5;">category</mwc-icon>
                <p>No categories found. Assign categories to items to see them here.</p>
            </div>
        ` : html`
            <mwc-list>
                ${this.categories.map(c => html`
                    <mwc-list-item hasMeta>
                        <span>${c}</span>
                        <div slot="meta" class="action-icons">
                            <mwc-icon-button icon="edit" @click=${() => this._openRenameDialog(c)} title="Rename Category"></mwc-icon-button>
                            <mwc-icon-button icon="delete" @click=${() => this._deleteCategory(c)} title="Delete Category" style="color: #f44336;"></mwc-icon-button>
                        </div>
                    </mwc-list-item>
                `)}
            </mwc-list>
        `}
      </div>

      <mwc-dialog id="renameDialog" heading="Rename Category">
        <div>
            <p>Rename all items currently in <b>${this.categoryToRename}</b> to:</p>
            <mwc-textfield id="newNameInput" label="New Category Name" dialogInitialFocus></mwc-textfield>
        </div>
        <mwc-button slot="primaryAction" @click=${this._renameCategory}>Save</mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="close" @click=${() => this.isRenaming = false}>Cancel</mwc-button>
      </mwc-dialog>
    `;
    }

    _openRenameDialog(category) {
        this.categoryToRename = category;
        this.isRenaming = true;
        const dialog = this.shadowRoot.getElementById('renameDialog');
        const input = this.shadowRoot.getElementById('newNameInput');
        input.value = category;
        dialog.show();
    }

    async _renameCategory() {
        const dialog = this.shadowRoot.getElementById('renameDialog');
        const input = this.shadowRoot.getElementById('newNameInput');
        const newName = input.value.trim();

        if (!newName) {
            input.setCustomValidity("Name cannot be empty");
            input.reportValidity();
            return;
        }

        try {
            const url = window.AppRouter ? window.AppRouter.urlForPath(`/api/categories/${encodeURIComponent(this.categoryToRename)}`) : `/api/categories/${encodeURIComponent(this.categoryToRename)}`;
            const response = await fetch(url + `?new_name=${encodeURIComponent(newName)}`, {
                method: 'PUT'
            });

            if (response.ok) {
                dialog.close();
                this.isRenaming = false;
                this._fetchCategories();
            } else {
                alert("Failed to rename category");
            }
        } catch (e) {
            console.error("Error renaming", e);
        }
    }

    async _deleteCategory(category) {
        if (!confirm(`Are you sure you want to delete the category "${category}"? All items will become uncategorized.`)) {
            return;
        }

        try {
            const url = window.AppRouter ? window.AppRouter.urlForPath(`/api/categories/${encodeURIComponent(category)}`) : `/api/categories/${encodeURIComponent(category)}`;
            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (response.ok) {
                this._fetchCategories();
            } else {
                alert("Failed to delete category");
            }
        } catch (e) {
            console.error("Error deleting", e);
        }
    }
}
customElements.define('categories-view', CategoriesView);
