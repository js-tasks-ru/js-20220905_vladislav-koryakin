class Tooltip {
  static #instance = null;

  element;

  constructor() {
    if (Tooltip.#instance) {
      return Tooltip.#instance;
    } else {
      this.render();
      Tooltip.#instance = this;
    }
  }
  
  get template() {
    return `<div class="tooltip"></div>`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    
    this.addEventListeners();
    this.initialize();
  }

  initialize() {
    document.body.append(this.element);
  }

  addEventListeners() {
    document.addEventListener('pointerover', this.handlePointerOver);
  }

  handlePointerOver = (e) => {
    const tooltip = e.target.dataset.tooltip;

    if (!tooltip) return;

    this.element.hidden = false;
    this.element.innerHTML = tooltip;
    this.element.style.left = `${e.pageX}px`;
    this.element.style.top = `${e.pageY}px`;

    e.target.addEventListener('pointermove', (e) => this.onMove(e));
    e.target.addEventListener('pointerout', this.mouseOut);
  }

  onMove(e) {
    if (this.element) {
      this.element.style.left = `${e.pageX + 10}px`;
      this.element.style.top = `${e.pageY + 10}px`;
    }
  }

  mouseOut = () => {
    this.element.hidden = true;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    document.removeEventListener('pointerover', this.handlePointerOver);
  }
}

export default Tooltip;
