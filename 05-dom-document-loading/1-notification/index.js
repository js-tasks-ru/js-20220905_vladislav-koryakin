export default class NotificationMessage {
  static activeNotification;

  element;
  timer;

  constructor(message = "", { duration = 2000, type = "success" } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value: ${this.duration}ms">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  show(parent = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    parent.append(this.element);
    this.timer = setTimeout(() => this.remove(), this.duration);
    NotificationMessage.activeNotification = this;
  }

  remove() {
    clearTimeout(this.timer);
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeNotification = null;
  }
}
