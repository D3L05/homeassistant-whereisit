import { LitElement, html, css } from 'lit';
import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-dialog';
import '@material/mwc-textfield';
import '@material/mwc-button';
import '@material/mwc-fab';

// Color palette for category badges
const CATEGORY_COLORS = [
    { bg: '#e3f2fd', fg: '#1565c0', accent: '#1976d2' },
    { bg: '#fce4ec', fg: '#c62828', accent: '#e53935' },
    { bg: '#e8f5e9', fg: '#2e7d32', accent: '#43a047' },
    { bg: '#fff3e0', fg: '#e65100', accent: '#fb8c00' },
    { bg: '#f3e5f5', fg: '#6a1b9a', accent: '#8e24aa' },
    { bg: '#e0f7fa', fg: '#00695c', accent: '#00897b' },
    { bg: '#fff8e1', fg: '#f57f17', accent: '#fdd835' },
    { bg: '#fbe9e7', fg: '#bf360c', accent: '#ff5722' },
    { bg: '#e8eaf6', fg: '#283593', accent: '#3f51b5' },
    { bg: '#f1f8e9', fg: '#558b2f', accent: '#7cb342' },
];

function getColorForCategory(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

export class CategoriesView extends LitElement {
    static styles = css`
    :host {
        display: block;
        padding: 0;
        min-height: 100%;
    }

    .page-header {
        display: flex;
        align-items: center;
        padding: 0 16px;
        gap: 8px;
    }
    .page-header h2 {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 600;
        color: #212121;
    }
    .page-header .subtitle {
        font-size: 0.85rem;
        color: #757575;
        margin-left: auto;
        font-weight: 500;
    }

    /* Category Grid */
    .category-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 16px;
        padding: 16px;
        animation: fadeInGrid 0.4s ease-out;
    }

    @keyframes fadeInGrid {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Category Card */
    .category-card {
        background: white;
        border-radius: 12px;
        padding: 20px 16px 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        cursor: default;
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.04);
    }
    .category-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    }

    .category-icon-circle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        transition: transform 0.2s ease;
    }
    .category-card:hover .category-icon-circle {
        transform: scale(1.08);
    }
    .category-icon-circle mwc-icon {
        --mdc-icon-size: 28px;
    }

    .category-name {
        font-weight: 600;
        font-size: 0.95rem;
        text-align: center;
        color: #333;
        word-break: break-word;
        line-height: 1.3;
        margin-bottom: 4px;
    }

    .category-badge {
        font-size: 0.75rem;
        font-weight: 500;
        padding: 2px 10px;
        border-radius: 12px;
        margin-bottom: 12px;
    }

    .card-actions {
        display: flex;
        gap: 4px;
        margin-top: auto;
        padding-top: 8px;
        border-top: 1px solid rgba(0,0,0,0.06);
        width: 100%;
        justify-content: center;
    }
    .card-actions mwc-icon-button {
        --mdc-icon-button-size: 36px;
        --mdc-icon-size: 20px;
        color: #9e9e9e;
        transition: color 0.15s ease;
    }
    .card-actions mwc-icon-button:hover {
        color: #424242;
    }
    .card-actions .delete-btn:hover {
        color: #e53935;
    }

    /* Empty State */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 64px 32px;
        text-align: center;
        animation: fadeInGrid 0.5s ease-out;
    }
    .empty-icon-wrapper {
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
    }
    .empty-icon-wrapper mwc-icon {
        --mdc-icon-size: 48px;
        color: #1976d2;
    }
    .empty-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #424242;
        margin-bottom: 8px;
    }
    .empty-subtitle {
        font-size: 0.9rem;
        color: #9e9e9e;
        max-width: 280px;
        line-height: 1.5;
        margin-bottom: 24px;
    }
    .empty-cta {
        --mdc-theme-primary: #1976d2;
    }

    /* FAB */
    mwc-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10;
    }

    /* Dialog styles */
    mwc-dialog {
        --mdc-dialog-min-width: 320px;
    }
    .dialog-content {
        padding: 8px 0;
    }
    .dialog-content p {
        margin: 0 0 16px 0;
        color: #616161;
        font-size: 0.9rem;
    }
    mwc-textfield {
        width: 100%;
    }

    /* Snackbar */
    .snackbar {
        position: fixed;
        bottom: 88px;
        left: 50%;
        transform: translateX(-50%) translateY(200px);
        background: #323232;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 0.875rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        z-index: 100;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
    }
    .snackbar.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
        pointer-events: auto;
    }
  `;

    static properties = {
        categories: { type: Array },
        categoryToRename: { type: String },
        snackbarMsg: { type: String },
        _showSnackbar: { type: Boolean },
    };

    constructor() {
        super();
        this.categories = [];
        this.categoryToRename = "";
        this.snackbarMsg = "";
        this._showSnackbar = false;
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
      <div class="page-header">
        <h2>Categories</h2>
        ${this.categories.length > 0 ? html`
            <span class="subtitle">${this.categories.length} categor${this.categories.length === 1 ? 'y' : 'ies'}</span>
        ` : ''}
      </div>

      ${this.categories.length === 0 ? this._renderEmptyState() : this._renderGrid()}

      <mwc-fab icon="add" @click=${this._openCreateDialog} title="Create Category"></mwc-fab>

      <!-- Create Dialog -->
      <mwc-dialog id="createDialog" heading="New Category">
        <div class="dialog-content">
            <p>Give your new category a name.</p>
            <mwc-textfield id="createInput" label="Category Name" dialogInitialFocus maxLength="50" outlined></mwc-textfield>
        </div>
        <mwc-button slot="primaryAction" @click=${this._createCategory}>Create</mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="close">Cancel</mwc-button>
      </mwc-dialog>

      <!-- Rename Dialog -->
      <mwc-dialog id="renameDialog" heading="Rename Category">
        <div class="dialog-content">
            <p>Rename all items in <b>${this.categoryToRename}</b> to:</p>
            <mwc-textfield id="renameInput" label="New Name" dialogInitialFocus maxLength="50" outlined></mwc-textfield>
        </div>
        <mwc-button slot="primaryAction" @click=${this._renameCategory}>Save</mwc-button>
        <mwc-button slot="secondaryAction" dialogAction="close">Cancel</mwc-button>
      </mwc-dialog>

      <!-- Snackbar -->
      <div class="snackbar ${this._showSnackbar ? 'show' : ''}">${this.snackbarMsg}</div>
    `;
    }

    _renderEmptyState() {
        return html`
        <div class="empty-state">
            <div class="empty-icon-wrapper">
                <mwc-icon>category</mwc-icon>
            </div>
            <div class="empty-title">No categories yet</div>
            <div class="empty-subtitle">
                Create categories to organize your items. Tap the + button to get started.
            </div>
            <mwc-button class="empty-cta" raised icon="add" label="Create Category" @click=${this._openCreateDialog}></mwc-button>
        </div>
        `;
    }

    _renderGrid() {
        return html`
        <div class="category-grid">
            ${this.categories.map(c => {
            const color = getColorForCategory(c);
            return html`
                <div class="category-card">
                    <div class="category-icon-circle" style="background: ${color.bg};">
                        <mwc-icon style="color: ${color.accent};">label</mwc-icon>
                    </div>
                    <div class="category-name">${c}</div>
                    <div class="card-actions">
                        <mwc-icon-button icon="edit" @click=${() => this._openRenameDialog(c)} title="Rename"></mwc-icon-button>
                        <mwc-icon-button class="delete-btn" icon="delete" @click=${() => this._deleteCategory(c)} title="Delete"></mwc-icon-button>
                    </div>
                </div>
            `;
        })}
        </div>
        `;
    }

    /* ---- Create ---- */
    _openCreateDialog() {
        const dialog = this.shadowRoot.getElementById('createDialog');
        const input = this.shadowRoot.getElementById('createInput');
        input.value = '';
        dialog.show();
    }

    async _createCategory() {
        const dialog = this.shadowRoot.getElementById('createDialog');
        const input = this.shadowRoot.getElementById('createInput');
        const name = input.value.trim();

        if (!name) {
            input.setCustomValidity("Name cannot be empty");
            input.reportValidity();
            return;
        }

        try {
            const url = window.AppRouter ? window.AppRouter.urlForPath('/api/categories') : '/api/categories';
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (response.ok) {
                dialog.close();
                this._fetchCategories();
                this._showToast(`Category "${name}" created`);
            } else if (response.status === 409) {
                input.setCustomValidity("Category already exists");
                input.reportValidity();
            } else {
                this._showToast("Failed to create category");
            }
        } catch (e) {
            console.error("Error creating category", e);
            this._showToast("Error creating category");
        }
    }

    /* ---- Rename ---- */
    _openRenameDialog(category) {
        this.categoryToRename = category;
        const dialog = this.shadowRoot.getElementById('renameDialog');
        const input = this.shadowRoot.getElementById('renameInput');
        input.value = category;
        dialog.show();
    }

    async _renameCategory() {
        const dialog = this.shadowRoot.getElementById('renameDialog');
        const input = this.shadowRoot.getElementById('renameInput');
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
                this._fetchCategories();
                this._showToast(`Renamed to "${newName}"`);
            } else {
                this._showToast("Failed to rename category");
            }
        } catch (e) {
            console.error("Error renaming", e);
        }
    }

    /* ---- Delete ---- */
    async _deleteCategory(category) {
        if (!confirm(`Delete "${category}"? All items will become uncategorized.`)) {
            return;
        }

        try {
            const url = window.AppRouter ? window.AppRouter.urlForPath(`/api/categories/${encodeURIComponent(category)}`) : `/api/categories/${encodeURIComponent(category)}`;
            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (response.ok) {
                this._fetchCategories();
                this._showToast(`"${category}" deleted`);
            } else {
                this._showToast("Failed to delete category");
            }
        } catch (e) {
            console.error("Error deleting", e);
        }
    }

    /* ---- Toast ---- */
    _showToast(msg) {
        this.snackbarMsg = msg;
        this._showSnackbar = true;
        setTimeout(() => {
            this._showSnackbar = false;
        }, 3000);
    }
}
customElements.define('categories-view', CategoriesView);
