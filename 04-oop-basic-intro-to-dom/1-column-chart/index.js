export default class ColumnChart {
  chartHeight = 50;

  constructor({
    data = [],
    label = '',
    value = '',
    link = '',
    formatHeading = data => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;
    this.columnsProps = [];
    this.subElements = {};
    this.render();
  }

  get columns() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map((item) => {
        const percent = (item / maxValue * 100).toFixed(0) + '%';
        const value = String(Math.floor(item * scale));

        return `
          <div style="--value: ${value}" 
            data-tooltip="${percent}">
          </div>
        `;
      })
      .join("");
  }

  get template() {
    return `
    <div class="column-chart column-chart_loading">
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
    
    if (this.data?.length) {
      wrapper.firstElementChild.classList.remove("column-chart_loading");
    }
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    console.log(result);

    return result;
  }

  update(data = []) {
    if (!data.length) {
      this.element.classList.add('column-chart__loading');
    }

    this.data = data;
    this.subElements.body.innerHTML = this.columns;
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
}
