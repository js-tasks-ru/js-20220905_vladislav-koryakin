export default class SortableTable {
  element;
  subElements;

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  getHeaderCells() {
    return this.headerConfig
      .map((elem) => {
        return `
        <div class="sortable-table__cell" data-id="${elem.id}" data-sortable="${elem.sortable}">
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
    return this.headerConfig
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
    this.data = this.sortData(fieldValue, orderValue);
    this.subElements.body.innerHTML = this.getTableRows();
    this.setArrow(fieldValue, orderValue);
  }

  sortData(fieldValue, orderValue) {
    const data = [...this.data];
    const column = this.headerConfig.find(column => column.id === fieldValue);
    const { sortType } = column;
    const orders = { asc: 1, desc: -1 };
    const order = orders[orderValue];

    return data.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return order * (a[fieldValue] - b[fieldValue]);
        case 'string':
          return (order * a[fieldValue].localeCompare(b[fieldValue], ["ru", "en"]));
        default:
          throw new Error(`Unknown sorting type: ${sortType}`);
      }
    });
  }

  setArrow(fieldValue, orderValue) {
    const allColumns = this.subElements.header.querySelectorAll('[data-id]');
    const sortedColumn = this.subElements.header.querySelector(`[data-id='${fieldValue}']`);

    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    sortedColumn.dataset.order = orderValue;
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
