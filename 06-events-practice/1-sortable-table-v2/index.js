export default class SortableTable {
  element;
  subElements;

  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = true;

    this.render();
  }

  getHeaderCells() {
    return this.headersConfig
      .map((elem) => {
        return `
        <div 
          class="sortable-table__cell" data-id="${elem.id}" 
          data-sortable="${elem.sortable}" 
          data-order="${elem.id === this.sorted?.id ? this.sorted.order : ''}"
        >
          <span>${elem.title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
        </div>
      `;
      })
      .join("");
  }

  getTableHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderCells()}
      </div>
    `;
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

  getTableBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows()}
      </div>
    `;
  }

  get template() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody()}
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.addEventListeners();
    if (this.sorted?.id) this.sort(this.sorted.id, this.sorted.order);
  }

  addEventListeners() {
    [...this.subElements.header.children].forEach(cell => {
      cell.addEventListener('click', () => this.handleClick(cell));
    });
  }

  handleClick = (elem) => {
    const {id, sortable} = elem.dataset;
    if (sortable === 'false') return;

    const allColumns = this.subElements.header.querySelectorAll('[data-sortable]');
    const column = [...allColumns].find(column => column.dataset.id === id);
    const order = this.getOrderValue(column, id);

    allColumns.forEach(column => {
      column.dataset.order = column.dataset.id === id ? order : '';
    });

    this.sorted = {id, order};
    this.sort(id, order);
  }

  getOrderValue(elem, target) {
    const {id, order} = elem.dataset;
    
    if (id === target) {
      switch (order) {
        case 'desc': return 'asc';
        case 'asc': return 'desc';
        case '': return 'desc';
        default: return '';
      }
    } else return '';
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

  

  sort(fieldValue = "", orderValue = "asc") {
    console.log(this.subElements.body.firstElementChild, this.subElements.body.lastElementChild);
    if (this.isSortLocally) {
      this.sortOnClient(fieldValue, orderValue);
    } else {
      this.sortOnServer(fieldValue, orderValue);
    }
    console.log(this.subElements.body.firstElementChild, this.subElements.body.lastElementChild);
  }
  
  sortOnClient(fieldValue, orderValue) {
    this.data = this.sortData(fieldValue, orderValue);
    this.subElements.body.innerHTML = this.getTableRows();
  }

  sortOnServer(fieldValue, orderValue) {
    return;
  }

  sortData(fieldValue, orderValue) {
    const data = [...this.data];
    const column = this.headersConfig.find(column => column.id === fieldValue);
    const { sortType } = column;
    const orders = { asc: 1, desc: -1 };
    const order = orders[orderValue];

    return data.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return order * (a[fieldValue] - b[fieldValue]);
        case 'string':
          return order * a[fieldValue].localeCompare(b[fieldValue], ["ru", "en"]);
        default:
          throw new Error(`Unknown sorting type: ${sortType}`);
      }
    });
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
