import { LitElement, html, css } from 'lit';
import '@material/mwc-icon-button';
import '@material/mwc-fab';
import { Router } from '@vaadin/router';
import '@material/mwc-dialog';
import '../components/add-box-dialog.js';
import '../components/edit-unit-dialog.js';
import '../components/edit-box-dialog.js';

export class UnitView extends LitElement {
  static styles = css`
    :host { display: block; position: relative; height: 100%; }
    .header {
      display: flex;
      align-items: center;
      padding: 0 16px;
    }
    .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .box-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      padding: 16px;
    }
    .box-card {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.2s;
    }
    .box-card-header {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
    .edit-btn {
        --mdc-icon-button-size: 32px;
        --mdc-icon-size: 20px;
        margin: -8px -8px 0 0;
        color: gray;
    }
    .box-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    .box-icon {
      font-size: 48px;
      color: var(--mdc-theme-primary);
      margin-bottom: 8px;
    }
    .box-name {
      font-weight: 500;
      text-align: center;
    }
    mwc-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
    }
  `;

  static properties = {
    location: { type: Object },
    unit: { type: Object }
  };

  constructor() {
    super();
    this.unit = null;
  }

  onBeforeEnter(location) {
    this.unitId = location.params.id;
    this._fetchUnit(this.unitId);
  }

  async _fetchUnit(id) {
    try {
      const response = await fetch(window.AppRouter ? window.AppRouter.urlForPath(`/api/units/${id}`) : `api/units/${id}`);
      if (response.ok) {
        this.unit = await response.json();
      } else {
        // Handle 404
      }
    } catch (e) {
      console.error("Error fetching unit", e);
    }
  }

  render() {
    if (!this.unit) return html`<p>Loading...</p>`;

    return html`
      <div class="header">
        <div class="header-title">
            <mwc-icon-button icon="arrow_back" @click=${this._goBack}></mwc-icon-button>
            <h2 style="margin:0;">${this.unit.name}</h2>
            <mwc-icon-button icon="edit" @click=${this._openEditUnitDialog} style="--mdc-icon-size: 20px; color: gray;"></mwc-icon-button>
        </div>
      </div>

      <div class="box-grid">
        ${this.unit.boxes.map(box => html`
          <div class="box-card" @click=${() => this._navigateToBox(box.id)}>
            <div class="box-card-header">
                <mwc-icon-button class="edit-btn" icon="edit" @click=${(e) => this._openEditBoxDialog(e, box)}></mwc-icon-button>
            </div>
            <mwc-icon class="box-icon">inventory_2</mwc-icon>
            <span class="box-name">${box.name}</span>
            <span style="font-size: 0.8em; color: gray;">${box.items ? box.items.length : 0} items</span>
          </div>
        `)}
      </div>

      <mwc-fab icon="add" @click=${this._openAddBoxDialog}></mwc-fab>
      <add-box-dialog .unitId=${this.unitId} @box-added=${() => this._fetchUnit(this.unitId)}></add-box-dialog>
      <edit-unit-dialog .unit=${this.unit} @unit-updated=${() => this._fetchUnit(this.unitId)} @unit-deleted=${this._handleUnitDeleted}></edit-unit-dialog>
      <edit-box-dialog @box-updated=${() => this._fetchUnit(this.unitId)} @box-deleted=${() => this._fetchUnit(this.unitId)}></edit-box-dialog>
    `;
  }

  _openEditUnitDialog() {
    this.shadowRoot.querySelector('edit-unit-dialog').show(this.unit);
  }

  _openEditBoxDialog(e, box) {
    e.stopPropagation();
    this.shadowRoot.querySelector('edit-box-dialog').show(box);
  }

  _handleUnitDeleted() {
    Router.go(window.AppRouter.urlForPath('/').replace(/([^:])\/\/+/g, '$1/'));
  }

  _goBack() {
    const url = '/';
    let targetUrl = url;
    if (window.AppRouter) {
      targetUrl = window.AppRouter.urlForPath(url).replace(/([^:])\/\/+/g, '$1/');
    }

    console.log(`[Prod Debug] UnitView _goBack to: ${targetUrl}`);

    try {
      Router.go(targetUrl);
      setTimeout(() => {
        const current = window.location.pathname;
        if (!current.endsWith('/') && !current.endsWith('/#/')) {
          console.warn("[Prod Debug] UnitView backnav failed. Forcing:", targetUrl);
          window.location.href = targetUrl;
        }
      }, 100);
    } catch (e) {
      window.location.href = targetUrl;
    }
  }

  _navigateToBox(id) {
    const originalPath = `/box/${id}`;
    let targetUrl = originalPath;
    if (window.AppRouter) {
      // Refined Regex: Strip double slashes but preserve protocol if present (though unlikely in urlForPath)
      targetUrl = window.AppRouter.urlForPath(originalPath).replace(/([^:])\/\/+/g, '$1/');
    }

    console.log(`[Prod Debug] Navigating from Unit to Box: ${targetUrl} (Original: ${originalPath})`);

    try {
      Router.go(targetUrl);
      setTimeout(() => {
        // More robust check: check if either the exact path OR path with trailing slash matches
        const current = window.location.pathname;
        if (!current.endsWith(originalPath) && !current.endsWith(originalPath + '/')) {
          console.warn("[Prod Debug] Router.go failed for Unit -> Box. Forcing hard nav:", targetUrl);
          window.location.href = targetUrl;
        }
      }, 100);
    } catch (e) {
      window.location.href = targetUrl;
    }
  }

  _openAddBoxDialog() {
    this.shadowRoot.querySelector('add-box-dialog').show();
  }
}
customElements.define('unit-view', UnitView);
