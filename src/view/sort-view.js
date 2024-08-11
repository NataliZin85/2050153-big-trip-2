import AbstractView from '../framework/view/abstract-view.js';
import { SortTypes } from '../const.js';
import { capitalizeWords } from '../utils/event.js';

function createSortTemplate(sortType, currentSortType) {
  const isDisabled = (sortType === 'event' || sortType === 'offers') ? 'disabled' : '';

  return (
    `<div class="trip-sort__item  trip-sort__item--${sortType}">
      <input id="sort-${sortType}" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" data-sort-type="${sortType}" value="sort-${sortType}" ${sortType === currentSortType ? 'checked' : ''} ${isDisabled}>
      <label class="trip-sort__btn" for="sort-${sortType}">${capitalizeWords(sortType)}</label>
    </div>`
  );
}

function createSortContainerTemplate(currentSortType) {
  return (
    `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
      ${Object.values(SortTypes).map((sortType) => createSortTemplate(sortType, currentSortType)).join('')}
    </form>`
  );
}

export default class EventSortView extends AbstractView {
  #points = null;
  #currentSortType = null;
  #handleSortTypeChange = null;

  constructor({currentSortType, onSortTypeChange}) {
    super();
    this.#currentSortType = currentSortType;
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortContainerTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }

    evt.preventDefault();
    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };
}
