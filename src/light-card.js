import { LitElement, html, css } from 'https://unpkg.com/lit@2?module'; 

class SmartQasaLightCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
      .card {
        margin: var(--sq-card-margin, 0);
        padding: 18px;
        border: var(--sq-card-border);
        border-radius: var(--sq-card-border-radius, 12px);
        box-shadow: var(--sq-card-box-shadow, 0 2px 4px 0 rgba(0, 0, 0, 0.2));
        display: grid;
        grid-template-areas: "i n" "i s";
        grid-template-columns: auto 1fr;
        grid-column-gap: 10px;
        grid-row-gap: 5px;
        background-color: var(--sq-card-background-color, white);
        cursor: pointer;
      }
      .icon {
        height: var(--sq-icon-size);
        width: var(--sq-icon-size);
        grid-area: i;
        display: flex;
        justify-content: center;
        align-self: center;
        padding: var(--sq-icon-padding);
        border-radius: 50%;
        transition: background-color 0.3s ease-out, color 0.3s ease-out;
      }
      .name {
        grid-area: n;
        align-self: end;
        text-align: left;
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight: var(--sq-primary-font-weight, 400);
        font-size: var(--sq-primary-font-size, 16px);
        color: rgb(var(--sq-primary-font-rgb), 0, 0, 0);
      }
      .state {
        grid-area: s;
        align-self: start;
        text-align: left;
        text-overflow: ellipsis;
        overflow: hidden;
        font-weight: var(--sq-secondary-font-weight, 300);
        font-size: var(--sq-secondary-font-size, 14px);
        color: rgb(var(--sq-secondary-font-rgb, 0, 0, 0));
      }
    `;
  }

  constructor() {
    super();
    this.hass = {};
    this.config = {};
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const stateObj = this.hass.states[this.config.entity];
    const state = stateObj?.state;
    if (stateObj) {
      var stateFmtd = this.hass.formatEntityState(stateObj) + (state == 'on' && stateObj.attributes.brightness ? ' - ' + this.hass.formatEntityAttributeValue(stateObj, 'brightness') : '');
      var iconColor = state == 'on' ? 'var(--sq-light-on-rgb)' : 'var(--sq-inactive-rgb)';
    } else {
      stateFmtd = 'Unknown';
      iconColor = 'var(--sq-unavailable-rgb)';
    }

    return html`
      <div class="card" @click=${this._toggleEntity}>
        <div class="icon" @click=${this._showMoreInfo} style="color: rgb(${iconColor}); background-color: rgba(${iconColor}, var(--sq-icon-opacity));">
          <ha-icon .icon=${stateObj?.attributes.icon || 'hass:alert-rhombus'}></ha-icon>
        </div>
        <div class="name">${this.config.name || stateObj?.attributes.friendly_name}</div>
        <div class="state">${stateFmtd}</div>
      </div>
    `;
  }

  _toggleEntity(e) {
    e.stopPropagation();
    this.hass.callService('light', 'toggle', {
      entity_id: this.config.entity,
    });
  }

  _showMoreInfo(e) {
    e.stopPropagation();
    const event = new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: this.config.entity } });
    this.dispatchEvent(event);
  }
}

customElements.define('smartqasa-light-card', SmartQasaLightCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'smartqasa-light-card',
  name: 'SmartQasa Light Card',
  preview: true,
  description: 'A custom card for controlling a light entity',
});