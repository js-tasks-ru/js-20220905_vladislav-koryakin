import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements;
  data = [];

  constructor(headersConfig, {
    url = '',
    sorted: {
      id: field = headersConfig.find(cell => cell.sortable).id,
      order: order = 'asc',
    } = {},
    step = 30,
    isSortLocally = false,
  } = {}) {
    this.headersConfig = headersConfig;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);
    this.isLoading = false;
    this.step = step;
    this.sorted = {
      id: field,
      order,
    };

    const now = new Date();
    this.range = {
      from: (new Date(now.setMonth(now.getMonth() - 1))).toISOString(),
      to: (new Date()).toISOString(),
    };

    this.searchParams = {
      _embed: 'subcategory.category',
      _sort: field,
      _order: order,
      _start: 0,
      _end: this.step,
    };

    this.render();
  }

  get template() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody()}
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>
    `;
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderCells()}
      </div>
    `;
  }

  getHeaderCells() {
    const sort = this.searchParams?._sort
      ? this.searchParams?._sort
      : this.headersConfig.find((cell) => cell.sortable).id;
    return this.headersConfig
      .map((elem, index) => {
        return `
        <div 
          class="sortable-table__cell" data-id="${elem.id}" 
          data-sortable="${elem.sortable}" 
          data-order="${elem.id === this.searchParams?._sort ? this.searchParams?._order : ''}"
        >
          <span>${elem.title}</span>
          ${
            elem.id === sort
            ? `<span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
              </span>`
            : ''
          }
        </div>
      `;
      })
      .join("");
  }

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows()}
      </div>
    `;
  }

  getTableRows() {
    return this.data
      .map((row) => {
        return `
        <a href="#" class="sortable-table__row">
          ${this.getRowCells(row)}
        </a>
      `;
      })
      .join("");
  }

  getRowCells(row) {
    return this.headersConfig
      .map((column) => {
        return column.template
          ? column.template(row[column.id])
          : `<div class="sortable-table__cell">${row[column.id]}</div>`;
      })
      .join("");
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.addEventListeners();
    this.data = await this.loadData();

    if (this.isSortLocally) {
      const {_sort, _order} = this.searchParams;

      this.sortOnClient(_sort, _order);
    }

    this.subElements.body.innerHTML = this.getTableRows();
  }

  async loadData() {
    if (Object.keys(this.searchParams).length) {
      Object.entries(this.searchParams).map(([key, value]) => {
        this.url.searchParams.set(key, value);
      });
    }

    this.element.classList.add('sortable-table_loading');
    this.isLoading = true;

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');
    this.isLoading = false;

    return data;
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.handleClick);
    window.addEventListener('scroll', this.handleScroll);
  }

  handleClick = event => {
    const column = event.target.closest('[data-sortable="true"]');

    if (!column) return;

    const {id, order} = column.dataset;
    const newOrder = this.getOrderValue(order);

    [...this.subElements.header.children].forEach(child => {
      child.dataset.order = '';
    });

    column.dataset.order = newOrder;
    column.append(this.subElements.arrow);

    this.searchParams = {
      ...this.searchParams, 
      _sort: id, 
      _order: newOrder,
      _start: 0,
      _end: this.step,
    };

    this.sorted = {id, order: newOrder};

    if (this.isSortLocally) {
      this.sortOnClient(id, newOrder);
    } else {
      this.sortOnServer(id, newOrder);
    }
  }

  handleScroll = async () => {
    const scrollHeight = document.body.scrollHeight;
    const windowHeight = document.documentElement.clientHeight;
    const scrolled = window.pageYOffset + windowHeight;
    const scrollingLimit = scrollHeight - windowHeight / 6;

    if (scrolled > scrollingLimit && !this.isLoading) {
      this.searchParams._start += this.step;
      this.searchParams._end += this.step;

      this.data = [...this.data, ...await this.loadData()];
      this.subElements.body.innerHTML = this.getTableRows();
    }
  }

  getOrderValue(order) {
    switch (order) {
      case 'desc': return 'asc';
      case 'asc': return 'desc';
      case '': return 'desc';
      default: return '';
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  async sortOnServer(fieldValue, orderValue) {
    this.searchParams._sort = fieldValue;
    this.searchParams._order = orderValue;

    this.data = await this.loadData();
    this.subElements.body.innerHTML = this.getTableRows();
  }

  sortOnClient(fieldValue, orderValue) {
    const data = [...this.data];
    const column = this.headersConfig.find(column => column.id === fieldValue);
    const { sortType } = column;
    const orders = { asc: 1, desc: -1 };
    const order = orders[orderValue];

    this.data = data.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return order * (a[fieldValue] - b[fieldValue]);
        case 'string':
          return order * a[fieldValue].localeCompare(b[fieldValue], ["ru", "en"]);
        default:
          throw new Error(`Unknown sorting type: ${sortType}`);
      }
    });

    this.subElements.body.innerHTML = this.getTableRows();
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    window.removeEventListener('scroll', this.handleScroll);
  }
}