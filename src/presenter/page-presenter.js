import EventSortView from '../view/sort-view.js';
import EventListView from '../view/list-view.js';
// import PointEditFormView from '../view/new-point-edit-form-view.js';
import NoEventsView from '../view/no-events-view.js';
import EventPresenter from './event-presenter.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import { SortType } from '../const.js';
import { updateItem } from '../utils/utils.js';
import { sortByDay, sortByTime, sortByPrice } from '../utils/sort.js';

export default class PagePresenter {
  #tripListComponent = new EventListView();
  #sortComponent = null;
  #noEventComponent = new NoEventsView();

  #pageContainer = null;
  #eventsModel = null;

  #currentSortType = SortType.DEFAULT;
  #sortedEvents = [];
  #pageEvents = [];
  #sortTypes = [];

  #eventPresenters = new Map();

  constructor({pageContainer, eventsModel, sorts}) {
    this.#pageContainer = pageContainer;
    this.#eventsModel = eventsModel;
    this.#sortTypes = sorts;
  }

  init() {
    this.#pageEvents = [...this.#eventsModel.events];
    // 1. В отличии от сортировки по любому параметру,
    // исходный порядок можно сохранить только одним способом -
    // сохранив исходный массив:
    this.#sortedEvents = [...this.#eventsModel.events];
    this.#renderEvents();
  }

  #handleModeChange = () => {
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleEventChange = (updatedEvent) => {
    this.#pageEvents = updateItem(this.#pageEvents, updatedEvent);
    this.#sortedEvents = updateItem(this.#sortedEvents, updatedEvent);
    this.#eventPresenters.get(updatedEvent.id).init(updatedEvent);
  };

  #handleSortTypeChange = (sortType) => {
    // - Сортируем задачи
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortEvents(sortType);
    // - Очищаем сортировку
    this.#clearSortTypes();
    // - Рендерим сортировку заново
    this.#renderSort();
    // - Очищаем список
    this.#clearEvents();
    // - Рендерим список заново
    this.#pageEvents.forEach((i) => this.#renderEvent(i));
  };

  #sortEvents(sortType) {
    // 2. Этот исходный массив задач необходим,
    // потому что для сортировки мы будем мутировать
    // массив в свойстве pageEvents
    switch (sortType) {
      case SortType.TIME:
        this.#pageEvents.sort(sortByTime);
        break;
      case SortType.PRICE:
        this.#pageEvents.sort(sortByPrice);
        break;
      default:
      // 3. А когда пользователь захочет "вернуть всё, как было",
      // мы просто запишем в pageEvents исходный массив
        this.#pageEvents = [...this.#sortedEvents];
        this.#pageEvents.sort(sortByDay);
        this.#currentSortType = SortType.DEFAULT;
    }

    this.#currentSortType = sortType;
    this.#sortTypes.forEach((i) => (i.type === sortType) ? (i.isChecked = true) : (i.isChecked = false));
  }

  #renderSort() {
    this.#sortComponent = new EventSortView({
      sorts: this.#sortTypes,
      onSortTypeChange: this.#handleSortTypeChange,
    });

    render(this.#sortComponent, this.#pageContainer, RenderPosition.AFTERBEGIN);
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      eventListContainer: this.#tripListComponent.element,
      eventsModel: this.#eventsModel,
      onDataChange: this.#handleEventChange,
      onModeChange: this.#handleModeChange
    });
    eventPresenter.init(event);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  #renderNoEvents() {
    render(this.#noEventComponent, this.#pageContainer);
  }

  #clearEvents() {
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();
  }

  #clearSortTypes() {
    remove(this.#sortComponent);
  }

  #renderTripList() {
    render(this.#tripListComponent, this.#pageContainer);
  }

  #renderEvents() {
    if (this.#pageEvents.length === 0) {
      this.#renderNoEvents();
      return;
    }

    this.#renderSort();
    this.#renderTripList();

    this.#pageEvents.sort(sortByDay);
    this.#pageEvents.forEach((i) => this.#renderEvent(i));
  }
}
