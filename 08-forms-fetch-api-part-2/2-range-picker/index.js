export default class RangePicker {
  element = null;
  subElements = {};
  selectingFrom = true;
  selected = {
    from: new Date(),
    to: new Date()
  };

  static formatDate(date) {
    return date.toLocaleString('ru', {dateStyle: 'short'});
  }

  constructor({from = new Date(), to = new Date()} = {}) {
    this.showDateFrom = new Date(from);
    this.selected = {from, to};

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    this.initEventListeners();
  }

  initEventListeners() {
    const { input, selector } = this.subElements;

    document.addEventListener('click', this.documentClickHandler, true);
    input.addEventListener('click', this.inputClickHandler);
    selector.addEventListener('click', this.selectorClickHandler);
  }

  documentClickHandler = event => {
    const isOpen = this.element.classList.contains('rangepicker_open');
    const isRangePicker = this.element.contains(event.target);
    
    if (isOpen && !isRangePicker) {
      this.element.classList.remove('rangepicker_open');
    }
  }

  inputClickHandler = () => {
    this.element.classList.toggle('rangepicker_open');
    this.renderCalendar();
  }

  selectorClickHandler = event => {
    if (event.target.classList.contains('rangepicker__cell')) {
      this.onRangePickerCellClick(event.target);
    }
  }

  onRangePickerCellClick(target) {
    const { value } = target.dataset;

    if (value) {
      const dateValue = new Date(value);

      if (this.selectingFrom) {
        this.selected = {
          from: dateValue,
          to: null
        };
        this.selectingFrom = false;
        this.renderHighlight();
      } else {
        if (dateValue > this.selected.from) {
          this.selected.to = dateValue;
        } else {
          this.selected.to = this.selected.from;
          this.selected.from = dateValue;
        }

        this.selectingFrom = true;
        this.renderHighlight();
      }

      if (this.selected.from && this.selected.to) {
        this.dispatchEvent();
        this.element.classList.remove('rangepicker_open');
        this.subElements.from.innerHTML = RangePicker.formatDate(this.selected.from);
        this.subElements.to.innerHTML = RangePicker.formatDate(this.selected.to);
      }
    }
  }

  get template() {
    const from = RangePicker.formatDate(this.selected.from);
    const to = RangePicker.formatDate(this.selected.to);

    return `<div class="rangepicker">
      <div class="rangepicker__input" data-element="input">
        <span data-element="from">${from}</span> -
        <span data-element="to">${to}</span>
      </div>
      <div class="rangepicker__selector" data-element="selector"></div>
    </div>`;
  }

  renderCalendar() {
    const showDate1 = new Date(this.showDateFrom);
    const showDate2 = new Date(this.showDateFrom);
    const { selector } = this.subElements;

    showDate2.setMonth(showDate2.getMonth() + 1);

    selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.getMonthCalendar(showDate1)}
      ${this.getMonthCalendar(showDate2)}
    `;

    const leftArrow = selector.querySelector('.rangepicker__selector-control-left');
    const rightArrow = selector.querySelector('.rangepicker__selector-control-right');

    leftArrow.addEventListener('click', this.prev);
    rightArrow.addEventListener('click', this.next);

    this.renderHighlight();
  }

  prev = () => {
    this.showDateFrom.setMonth(this.showDateFrom.getMonth() - 1);
    this.renderCalendar();
  }

  next = () => {
    this.showDateFrom.setMonth(this.showDateFrom.getMonth() + 1);
    this.renderCalendar();
  }

  renderHighlight() {
    const { from, to } = this.selected;
    const cells = this.element.querySelectorAll('.rangepicker__cell');
    
    for (const cell of cells) {
      const { value } = cell.dataset;
      const cellDate = new Date(cell.dataset.value);

      cell.classList.remove('rangepicker__selected-from');
      cell.classList.remove('rangepicker__selected-between');
      cell.classList.remove('rangepicker__selected-to');

      if (from && value === from.toISOString()) {
        cell.classList.add('rangepicker__selected-from');
      } else if (to && value === to.toISOString()) {
        cell.classList.add('rangepicker__selected-to');
      } else if (from && to && cellDate >= from && cellDate <= to) {
        cell.classList.add('rangepicker__selected-between');
      }
    }

    if (from) {
      const selectedFromElem = this.element.querySelector(`[data-value="${from.toISOString()}"]`);
      if (selectedFromElem) {
        selectedFromElem.closest('.rangepicker__cell').classList.add('rangepicker__selected-from');
      }
    }

    if (to) {
      const selectedToElem = this.element.querySelector(`[data-value="${to.toISOString()}"]`);
      if (selectedToElem) {
        selectedToElem.closest('.rangepicker__cell').classList.add('rangepicker__selected-to');
      }
    }
  }

  getMonthCalendar(showDate) {
    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${this.monthsList[showDate.getMonth()]}">
            ${this.monthsList[showDate.getMonth()]}
          </time>
        </div>
        <div class="rangepicker__day-of-week">
          ${this.getDaysOfWeek()}
        </div>
        <div class="rangepicker__date-grid">
          ${this.getDaysOfMonth(showDate)}
        </div>
      </div>
    `;
  }

  getDaysOfMonth(showDate) {
    const buttons = [];
    const date = new Date(showDate);
    const lastDay = new Date(showDate);

    date.setDate(1);

    lastDay.setMonth(lastDay.getMonth() + 1);
    lastDay.setDate(0);
    
    const getDayOfWeek = (day) => {
      const result = day === 0 ? 6 : day - 1;
      return result + 1;
    };

    while (date.getDate() <= lastDay.getDate()) {
      const button = `
        <button type="button"
          class="rangepicker__cell"
          data-value="${date.toISOString()}"
          style="--start-from: ${getDayOfWeek(date.getDay())}">
            ${date.getDate()}
        </button>
      `;

      buttons.push(button);

      if (date.getDate() === lastDay.getDate()) {break;}
      
      date.setDate(date.getDate() + 1);
    }

    return buttons.join('');
  }

  getDaysOfWeek() {
    return this.daysList.map(day => `<div>${day}</div>`).join('');
  }

  getMonths() {
    return this.monthsList.map(month => `<div>${month}</div>`).join('');
  }

  get daysList() {
    return [...Array(7).keys()].map(key => {
      return new Date(0, 0, key + 1).toLocaleDateString(['ru'], {weekday: 'short'});
    }); // navigator.language toggled on 'ru' locale, because tests don't pass
  }

  get monthsList() {
    return [...Array(12).keys()].map(key => {
      return new Date(0, key).toLocaleDateString(['ru'], {month: 'long'});
    }); // navigator.language toggled on 'ru' locale, because tests don't pass
  }

  getSubElements(element) {
    const subElements = {};

    for (const subElement of element.querySelectorAll('[data-element]')) {
      subElements[subElement.dataset.element] = subElement;
    }

    return subElements;
  }

  dispatchEvent() {
    this.element.dispatchEvent(new CustomEvent('date-select', {
      bubbles: true,
      detail: this.selected,
    }));
  }

  remove() {
    this.element.remove();
    document.removeEventListener('click', this.documentClickHandler, true);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.selectingFrom = true;
    this.selected = {
      from: new Date(),
      to: new Date()
    };

    return this;
  }
}
