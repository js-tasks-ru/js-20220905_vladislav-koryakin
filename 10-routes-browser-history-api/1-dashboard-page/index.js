import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  url = `${BACKEND_URL}api/dashboard`;
  element;
  components = {};
  subElements;

  dateSelectionHandler = event => {
    // event for update components
  }

  async render () {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(wrapper);

    console.log(this.subElements);
    this.addComponents();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.element.addEventListener("date-select", this.dateSelectionHandler);
  }

  addComponents() {
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    const to = new Date();

    this.addRangePicker(from, to);
    this.addChartElements(from, to);
    this.addSortableTable();
  }

  addRangePicker(from, to) {
    const rangePicker = new RangePicker({ from, to });

    this.subElements.rangePicker.append(rangePicker.element);
    this.components.rangePicker = rangePicker;
  }

  addChartElements = (from, to) => {
    const ordersChart = new ColumnChart({
      label: "Orders",
      link: "orders",
      url: `${this.url}/orders`,
      range: {
        from,
        to,
      },
    });

    const salesChart = new ColumnChart({
      label: "Sales",
      link: "sales",
      formatHeading: (p) => `$${p}`,
      url: `${this.url}/sales`,
      range: {
        from,
        to,
      },
    });

    const customersChart = new ColumnChart({
      label: "Customers",
      link: "customers",
      url: `${this.url}/customers`,
      range: {
        from,
        to,
      },
    });
 
    this.subElements.ordersChart.append(ordersChart.element);
    this.subElements.salesChart.append(salesChart.element);
    this.subElements.customersChart.append(customersChart.element);

    this.components.ordersChart = ordersChart;
    this.components.salesChart = salesChart;
    this.components.customersChart = customersChart;
  };

  addSortableTable() {
    const sortableTable = new SortableTable(header, {
      url: `${this.url}/bestsellers`,
      isSortLocally: true,
    });

    this.subElements.sortableTable.append(sortableTable.element);
    this.components.sortableTable = sortableTable;
  }

  get template() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <!-- RangePicker component -->
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <!-- column-chart components -->
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>
        <h3 class="block-title">Best sellers</h3>
        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>
    `;
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll(`[data-element]`);

    for (const element of elements) {
      subElements[element.dataset.element] = element;
    }

    return subElements;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    Object.values(this.components).forEach(elem => elem.destroy());

    this.remove();
    this.element = null;
    this.components = null;
    this.subElements = null;
  }
}
