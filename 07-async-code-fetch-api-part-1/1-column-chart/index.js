import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  element;

  constructor({
    data = {},
    label = '',
    value = '',
    link = '',
    url = '',
    range = {},
    formatHeading = data => data,
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;
    this.columnsProps = [];
    this.subElements = {};
    this.render();
  }

  get columns() {
    const maxValue = Math.max(...Object.values(this.data));
    const scale = this.chartHeight / maxValue;

    return Object.entries(this.data)
      .map(([date, item]) => {
        const percent = (item / maxValue * 100).toFixed(0) + '%';
        const value = String(Math.floor(item * scale));

        return `
          <div style="--value: ${value}"
            data-date="${date}"
            data-tooltip="${percent}">
          </div>
        `;
      })
      .join("");
  }

  get template() {
    return `
    <div class="column-chart">
      <div class="column-chart__title">
        Total ${this.label ? this.label : ''}
        ${this.link ? `<a href=${this.link} class="column-chart__link">View All</a>` : ''}
      </div>
      <div class="column-chart__container">
        
        <div data-element="header" class="column-chart__header">
          ${this.value}
        </div>
          <div data-element="body" class="column-chart__chart">
            ${(this.data && this.data.length > 0) ? this.columns : ''}
          </div>
      </div>
    </div>
    `;
  }

  render() {
    let wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    wrapper.firstElementChild.classList.add("column-chart_loading");

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.update(this.range.from?.toISOString(), this.range.to?.toISOString());
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  async update(from = '', to = '') {
    if (!from || !to) return;

    this.url.searchParams.set('from', from);
    this.url.searchParams.set('to', to);

    const data = await fetchJson(this.url);

    this.element.classList.remove('column-chart_loading');

    if (!Object.keys(data).length) {
      this.element.classList.add('column-chart_loading');
    }
    
    this.data = data;
    this.subElements.body.innerHTML = this.columns;

    return data;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
