export default class SortableList {
  element;
  item;
  subElements = {};
  shift = {};
  placeholder;

  constructor({items = []}) {
    this.items = items;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);
    
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    const { imageListContainer } = this.subElements;

    imageListContainer.addEventListener('pointerdown', this.handlePointerDown);
    
  }

  handlePointerDown = event => {
    const target = event.target;
    const item = target.closest(`.sortable-list__item`);

    target.ondrag = () => false;

    const isDelete = target.closest(`[data-delete-handle]`);
    const isDrag = target.closest(`[data-grab-handle]`);
    
    if (!item) {return;}

    if (isDelete) {
      item.remove();
    }

    if (isDrag) {
      this.item = item;

      this.getShift(item, event);

      const { offsetHieght, offsetWidth } = item;
      const { clientX, clientY } = event;
      const { left, top } = this.shift;

      item.style.width = `${offsetWidth}px`;
      item.style.height = `${offsetHieght}px`;

      item.classList.add('sortable-list__item_dragging');

      item.style.left = `${clientX - left}px`;
      item.style.top = `${clientY - top}px`;

      this.createPlaceholder();

      item.after(this.placeholder);
      this.element.prepend(this.item);

      document.addEventListener('pointermove', this.handlePointerMove);
      document.addEventListener('pointerup', this.handlePointerUp);
    }
  }

  getShift(item, event) {
    const { clientX, clientY } = event;
    const { left, top } = item.getBoundingClientRect();

    const shiftX = clientX - left;
    const shiftY = clientY - top;

    this.shift = {
      left: shiftX,
      top: shiftY,
    };
  }

  handlePointerMove = event => {
    const { left, top } = this.shift;
    const { clientX, clientY } = event;

    this.item.style.left = `${clientX - left}px`;
    this.item.style.top = `${clientY - top}px`;


    this.movePlaceholder();
  }

  handlePointerUp = event => {
    const target = event.target;

    this.item.style.top = 'unset';
    this.item.style.left = 'unset';
    this.item.style.width = 'unset';
    this.item.style.height = 'unset';

    this.item.classList.remove('sortable-list__item_dragging');

    this.placeholder.after(this.item);
    this.placeholder.remove();

    document.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('pointerup', this.handlePointerUp);
  }

  createPlaceholder() {
    this.placeholder = document.createElement('div');
    this.placeholder.className = 'sortable-list__item sortable-list__placeholder';
  }

  movePlaceholder() {
    const previous = this.placeholder.previousElementSibling;
    const next = this.placeholder.nextElementSibling;
    const shift = -this.item.offsetHeight / 3;

    if ((previous?.getBoundingClientRect().bottom - this.item.getBoundingClientRect().bottom) >= shift) {
      previous.before(this.placeholder);
    }

    if ((this.item.getBoundingClientRect().top - next?.getBoundingClientRect().top) >= shift) {
      next.after(this.placeholder);
    }
  }

  get template() {
    return `
      <ul class="sortable-list" data-element="imageListContainer">
        ${this.getList()}
      </ul>
    `;
  }

  getList() {
    return this.items.map(item => `
      <li class="products-edit__imagelist-item sortable-list__item">
        ${item.innerHTML}
      </li>
    `).join('');
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
    this.remove();
    this.element = null;
    this.placeholder = null;
    this.subElements = null;
  }
}
