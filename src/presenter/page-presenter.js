import EventSortView from '../view/sort-view.js';
import EventListView from '../view/list-view.js';
import NoEventsView from '../view/no-events-view.js';
import HeaderPresenter from './header-presenter.js';
import PointPresenter from './point-presenter.js';
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
  #pointsModel = null;
  #filterModel = null;

  #currentSortType = SortTypes.DEFAULT;
  #currentFilterType = FilterType.EVERYTHING;

  // #offers = [];
  // #destinations = [];

  #newEventFormPresenter = null;
  #pointPresenters = new Map();
  #headerPresenter = null;

  constructor({pageContainer, headerContainer, pointsModel, filterModel, onNewEventDestroy}) {
    this.#pageContainer = pageContainer;
    this.#headerContainer = headerContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;

    this.#newEventFormPresenter = new NewEventFormPresenter({
      eventListContainer: this.#tripListComponent.element,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewEventDestroy
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#currentFilterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    console.log(points);
    const filteredPoints = filterEvents[this.#currentFilterType](points);

    switch (this.#currentSortType) {
      case SortTypes.TIME:
        return filteredPoints.sort(sortByTime);
      case SortTypes.PRICE:
        return filteredPoints.sort(sortByPrice);
    }
    return filteredPoints.sort(sortByDay);
  }

  init() {
    // this.#offers = [...this.#pointsModel.offers];
    // this.#destinations = [...this.#pointsModel.destinations];

    this.#renderHeader();
    this.#renderSort();
    this.#renderTripList();
  }

  createEvent() {
    this.#currentSortType = SortTypes.DEFAULT;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newEventFormPresenter.init(this.#pointsModel.offers, this.#pointsModel.destinations);
  }

  #handleModeChange = () => {
    this.#newEventFormPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
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
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_EVENT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_EVENT:
        this.#pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  /**
  * #handleModelEvent будет обновлять точки маршрута или всю страницу
  * в зависимости от типа изменений:
  * updateType - тип изменений:
  * - PATCH - обновит часть или всю point(точку маршрута),
  * - MINOR - обновит points (точки маршрута),
  * - MAJOR - обновить всю страницу (например, при переключении фильтра.
  * data - обновленные данные
  */
  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data, this.#pointsModel.offers, this.#pointsModel.destinations);
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
        // this.#clearHeader();
        // this.#renderHeader();
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

  #renderPoint(point, dataOffers, dataDestinations) {
    const pointPresenter = new PointPresenter({
      eventListContainer: this.#tripListComponent.element,
      pointsModel: this.#pointsModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange
    });
    pointPresenter.init(point, dataOffers, dataDestinations);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderNoEvents() {
    this.#noEventComponent = new NoEventsView({
      filterType: this.#currentFilterType
    });
    render(this.#noEventComponent, this.#pageContainer);
    remove(this.#sortComponent);
  }

  #renderPoints(points) {
    points.forEach((point) => this.#renderPoint(point, this.#pointsModel.offers, this.#pointsModel.destinations));
  }

  #renderHeader() {
    this.#headerPresenter = new HeaderPresenter({
      headerContainer: this.#headerContainer,
      filterModel: this.#filterModel,
      pointsModel: this.#pointsModel,
    });
    this.#headerPresenter.init();
  }

  #clearHeader() {
    this.#headerPresenter.destroy();
  }

  #clearTripList({ resetSortType = false } = {}) {
    this.#newEventFormPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);

    if (this.#noEventComponent) {
      remove(this.#noEventComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortTypes.DEFAULT;
    }
  }

  #renderTripList() {
    const points = this.points.slice(0, this.points.length);;
    render(this.#tripListComponent, this.#pageContainer);

    if (this.points.length === 0) {
      this.#renderNoEvents();
      return;
    }
    this.#renderPoints(points);
  }
}
