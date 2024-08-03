import EventSortView from '../view/sort-view.js';
import EventListView from '../view/list-view.js';
import NoEventsView from '../view/no-events-view.js';
import HeaderPresenter from './header-presenter.js';
import EventPresenter from './event-presenter.js';
import NewEventFormPresenter from './add-event-form-presenter.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import { SortTypes, UpdateType, UserAction, FilterType } from '../const.js';
import { sortByDay, sortByTime, sortByPrice } from '../utils/sort.js';
import { filterEvents } from '../utils/filter.js';

export default class PagePresenter {
  #tripListComponent = new EventListView();
  #sortComponent = null;
  #noEventComponent = null;

  #pageContainer = null;
  #headerContainer = null;
  #eventsModel = null;
  #filterModel = null;

  #currentSortType = SortTypes.DEFAULT;
  #currentFilterType = FilterType.EVERYTHING;

  #offers = [];
  #destinations = [];

  #newEventFormPresenter = null;
  #eventPresenters = new Map();
  #headerPresenter = null;

  constructor({pageContainer, headerContainer, eventsModel, filterModel, onNewEventDestroy}) {
    this.#pageContainer = pageContainer;
    this.#headerContainer = headerContainer;
    this.#eventsModel = eventsModel;
    this.#filterModel = filterModel;

    this.#newEventFormPresenter = new NewEventFormPresenter({
      eventListContainer: this.#tripListComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewEventDestroy
    });

    this.#eventsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get events() {
    this.#currentFilterType = this.#filterModel.filter;
    const events = this.#eventsModel.events;
    const filteredEvents = filterEvents[this.#currentFilterType](events);

    switch (this.#currentSortType) {
      case SortTypes.TIME:
        return filteredEvents.sort(sortByTime);
      case SortTypes.PRICE:
        return filteredEvents.sort(sortByPrice);
    }
    return filteredEvents.sort(sortByDay);
  }

  init() {
    this.#offers = [...this.#eventsModel.offers];
    this.#destinations = [...this.#eventsModel.destinations];

    this.#renderHeader();
    this.#renderSort();
    this.#renderTripList();
  }

  createEvent() {
    this.#currentSortType = SortTypes.DEFAULT;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newEventFormPresenter.init(this.#offers, this.#destinations);
  }

  #handleModeChange = () => {
    this.#newEventFormPresenter.destroy();
    this.#eventPresenters.forEach((presenter) => presenter.resetView());
  };

  /**
   * #handleViewAction будет вызывать обновление модели.
   * actionType - действие пользователя, нужно чтобы понять, какой метод модели вызвать
   * updateType - тип изменений, нужно чтобы понять, что после нужно обновить
   * update - обновленные данные
   */
  #handleViewAction = (actionType, updateType, update) => {
    // console.log(actionType, updateType, update);
    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#eventsModel.updateEvent(updateType, update);
        break;
      case UserAction.ADD_EVENT:
        this.#eventsModel.addEvent(updateType, update);
        break;
      case UserAction.DELETE_EVENT:
        this.#eventsModel.deleteEvent(updateType, update);
        break;
    }
  };

  /**
  * #handleModelEvent будет обновлять точки маршрута или всю страницу
  * в зависимости от типа изменений:
  * updateType - тип изменений:
  * - PATCH - обновит часть или всю event(точку маршрута),
  * - MINOR - обновит events (точки маршрута),
  * - MAJOR - обновить всю страницу (например, при переключении фильтра.
  * data - обновленные данные
  */
  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#eventPresenters.get(data.id).init(data, this.#offers, this.#destinations);
        this.#clearTripList();
        this.#clearHeader();
        this.#renderHeader();
        this.#renderSort();
        this.#renderTripList();
        break;
      case UpdateType.MINOR:
        this.#clearTripList();
        // this.#clearHeader();
        // this.#renderHeader();
        this.#renderSort();
        this.#renderTripList();
        break;
      case UpdateType.MAJOR:
        this.#clearTripList({resetSortType: true});
        this.#clearHeader();
        this.#renderHeader();
        this.#renderSort();
        this.#renderTripList();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    // - Очищаем сортировку
    this.#clearTripList();
    // - Рендерим сортировку заново
    this.#renderSort();
    // - Рендерим список заново
    this.#renderTripList();
  };

  #renderSort() {
    this.#sortComponent = new EventSortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });

    render(this.#sortComponent, this.#pageContainer, RenderPosition.AFTERBEGIN);
  }

  #renderEvent(event, dataOffers, dataDestinations) {
    const eventPresenter = new EventPresenter({
      eventListContainer: this.#tripListComponent.element,
      eventsModel: this.#eventsModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange
    });
    eventPresenter.init(event, dataOffers, dataDestinations);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  #renderNoEvents() {
    this.#noEventComponent = new NoEventsView({
      filterType: this.#currentFilterType
    });
    render(this.#noEventComponent, this.#pageContainer);
    remove(this.#sortComponent);
  }

  #renderEvents(events) {
    events.forEach((event) => this.#renderEvent(event, this.#offers, this.#destinations));
  }

  #renderHeader() {
    this.#headerPresenter = new HeaderPresenter({
      headerContainer: this.#headerContainer,
      filterModel: this.#filterModel,
      eventsModel: this.#eventsModel,
    });
    this.#headerPresenter.init();
  }

  #clearHeader() {
    this.#headerPresenter.destroy();
  }

  #clearTripList({ resetSortType = false } = {}) {
    this.#newEventFormPresenter.destroy();
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();

    remove(this.#sortComponent);

    if (this.#noEventComponent) {
      remove(this.#noEventComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortTypes.DEFAULT;
    }
  }

  #renderTripList() {
    const events = this.events.slice(0, this.events.length);;
    render(this.#tripListComponent, this.#pageContainer);

    if (this.events.length === 0) {
      this.#renderNoEvents();
      return;
    }
    this.#renderEvents(events);
  }
}
