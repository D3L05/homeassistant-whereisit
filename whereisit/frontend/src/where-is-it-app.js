import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import '@material/mwc-top-app-bar-fixed';
import '@material/mwc-icon-button';
import '@material/mwc-drawer';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item.js';
import '@material/mwc-icon';

import './views/home-view.js';
import './views/unit-view.js';
import './views/box-view.js';
import './views/categories-view.js';
import './components/item-detail-dialog.js';

export class WhereIsItApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      height: 100vh;
      --mdc-theme-primary: var(--primary-color, #03a9f4);
      --mdc-theme-secondary: var(--accent-color, #ff9800);
      background-color: var(--primary-background-color, #fafafa);
      color: var(--primary-text-color, #212121);
    }
    
    mwc-drawer {
      height: 100%;
    }

    div[slot="appContent"] {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    main {
      flex: 1;
      overflow: auto;
      padding: 16px;
    }
    
    /* HA-like scrollbar */
    main::-webkit-scrollbar {
      width: 0.4rem;
      height: 0.4rem;
    }
    main::-webkit-scrollbar-thumb {
      background-color: var(--scrollbar-thumb-color, #bdbdbd);
      border-radius: 0.4rem;
    }
  `;

  firstUpdated() {
    console.log("%c WHERE IS IT APP VERSION 0.0.3 ", "background: red; color: white; font-size: 20px");

    // DYNAMIC BASE TAG FOR HA INGRESS
    // Use the dynamic base tag injected in index.html as the router base
    const baseTag = document.querySelector('base');
    const baseUrl = baseTag ? new URL(baseTag.href, window.location.origin).pathname : '/';

    // THE ULTIMATE FIX: Do not let Vaadin Router initialize if the URL is dirty!
    const currentPath = window.location.pathname;
    if (currentPath.includes('//')) {
      const cleanPath = currentPath.replace(/\/+/g, '/');
      console.warn(`[Prod Debug] Double slash detected in physical URL. Preemptively redirecting iframe to clean path: ${cleanPath}`);
      window.location.href = (window.location.origin + cleanPath + window.location.search + window.location.hash).replace(/([^:])\/\/+/g, '$1/');
      return;
    }

    console.log("Router Base URL (from <base>):", baseUrl);

    const router = new Router(this.shadowRoot.querySelector('main'), { baseUrl: baseUrl });
    window.AppRouter = router;

    // ----- HYPER AGGRESSIVE PROD DEBUGGING -----
    window.addEventListener('click', (e) => console.log("[Prod Debug] Global click captured:", e.target));
    window.addEventListener('vaadin-router-go', (e) => console.log("[Prod Debug] Vaadin Router GO event fired:", e.detail));
    window.addEventListener('vaadin-router-location-changed', (e) => console.log("[Prod Debug] Vaadin Router LOCATION CHANGED:", e.detail));

    router.setRoutes([
      { path: '/', component: 'home-view' },
      { path: '/categories', component: 'categories-view' },
      { path: '/unit/:id', component: 'unit-view' },
      { path: '/box/:id', component: 'box-view' },
      { path: '(.*)', component: 'home-view' },
    ]);
  }

  render() {
    return html`
      <mwc-drawer hasHeader type="dismissible">
        <span slot="title">WhereIsIt</span>
        <span slot="subtitle">Storage Manager</span>
        
        <mwc-list>
          <mwc-list-item graphic="icon" @click=${() => { this._closeDrawer(); Router.go(window.AppRouter.urlForPath('/').replace(/([^:])\/\/+/g, '$1/')); }}>
            <mwc-icon slot="graphic">home</mwc-icon>
            <span>Home</span>
          </mwc-list-item>
          
          <mwc-list-item graphic="icon" @click=${() => { this._closeDrawer(); Router.go(window.AppRouter.urlForPath('/categories').replace(/([^:])\/\/+/g, '$1/')); }}>
            <mwc-icon slot="graphic">category</mwc-icon>
            <span>Categories</span>
          </mwc-list-item>
        </mwc-list>

        <div slot="appContent">
          <mwc-top-app-bar-fixed>
            <mwc-icon-button icon="menu" slot="navigationIcon" @click=${this._toggleDrawer}></mwc-icon-button>
            <div slot="title">WhereIsIt</div>
          </mwc-top-app-bar-fixed>
          <main></main>
        </div>
      </mwc-drawer>
      
      <item-detail-dialog id="globalItemDetailDialog"></item-detail-dialog>
    `;
  }

  _toggleDrawer() {
    const drawer = this.shadowRoot.querySelector('mwc-drawer');
    drawer.open = !drawer.open;
  }

  _closeDrawer() {
    const drawer = this.shadowRoot.querySelector('mwc-drawer');
    drawer.open = false;
  }
}

customElements.define('where-is-it-app', WhereIsItApp);
