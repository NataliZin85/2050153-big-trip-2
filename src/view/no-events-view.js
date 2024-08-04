import AbstractView from '../framework/view/abstract-view.js';
import { TextNoEvent } from '../const.js';

function createNoEventsTemplate(filterType) {
  return `<p class="trip-events__msg">${ TextNoEvent[filterType] }</p>`;
}

export default class NoEventsView extends AbstractView {
  #filterType = null;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoEventsTemplate(this.#filterType);
  }
}
