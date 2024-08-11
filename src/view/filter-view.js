import AbstractView from '../framework/view/abstract-view.js';
import { filterEvents } from '../utils/filter.js';
import { capitalizeWords } from '../utils/event.js';

function createFilterTemplate(filter, currentFilterType, points) {
  const { type } = filter;
  const filteredEvents = filterEvents[type](points);

  return (
    `<div class="trip-filters__filter">
      <input id="filter-${type}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${type}" ${type === currentFilterType ? 'checked' : ''} ${filteredEvents.length === 0 ? 'disabled' : ''}>
      <label class="trip-filters__filter-label" for="filter-${type}">${capitalizeWords(type)}</label>
    </div>`
  );
}

// ${Object.values(FilterType).map((filter) => createFilterTemplate(filter, currentFilterType)).join('')}
function createEventFiltersTemplate(filters, currentFilterType, points) {
  return (
    `<form class="trip-filters" action="#" method="get">
      ${filters.map((filter) => createFilterTemplate(filter, currentFilterType, points)).join('')}

      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`
  );
}

export default class EventFilterView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #points = null;
  #handleFilterTypeChange = null;

  constructor({filters, currentFilterType, onFilterTypeChange, points}) {
    super();
    this.#filters = filters;
    this.#points = points;
    this.#currentFilter = currentFilterType;
    this.#handleFilterTypeChange = onFilterTypeChange;

    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  get template() {
    return createEventFiltersTemplate(this.#filters, this.#currentFilter, this.#points);
  }

  #filterTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this.#handleFilterTypeChange(evt.target.value);
  };
}
