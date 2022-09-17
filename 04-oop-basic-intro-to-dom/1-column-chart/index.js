export default class ColumnChart {

  constructor(props) {
    this.hasData = !props ? false : true;
    this.chartHeight = 50;
    this.data = props?.data || null;
    this.label = props?.label || null;
    this.value = props?.value || null;
    this.link = props?.link || null;
    this.formatHeading = props?.formatHeading || null;
    this.render();
  }

  get columns() {
    return this.data
      .map((column) => {
        return `<div style="--value: ${Math.floor(
          (column * 50) / Math.max(...this.data)
        )}" data-tooltip="${(column / Math.max(...this.data) * 100).toFixed(0)}%"></div>`;
      })
      .join("");
  }

  getValue () {
    return (this.formatHeading) ? this.formatHeading(this.value) : this.value;
  }

  get template() {
    return `
    <div class="column-chart ${(this.hasData && this.data && this.data.length > 0) ? "" : "column-chart_loading"}">
      <div class="column-chart__title">
        Total ${this.label ? this.label : ''}
        ${this.link ? `<a href=${this.link} class="column-chart__link">View All</a>` : ''}
      </div>
      <div class="column-chart__container">
        
        <div class="column-chart__header">
          ${this.value && this.getValue()}
        </div>
          <div class="column-chart__chart">
            ${(this.data && this.data.length > 0) ? this.columns : ''}
          </div>
      </div>
    </div>
    `;
  }

  render () {
    let wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  update (data) {
    this.data = data;
    this.render();
  }

  destroy () {
    this.element = null;
  }

  remove () {
    this.element = null;
  }
}
