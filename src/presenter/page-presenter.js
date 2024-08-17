import EventSortView from '../view/sort-view.js';
import EventListView from '../view/list-view.js';
import NoEventsView from '../view/no-events-view.js';
import LoadingView from '../view/loading-view.js';
import HeaderPresenter from './header-presenter.js';
import PointPresenter from './point-presenter.js';
import NewEventFormPresenter from './add-event-form-presenter.js';
import { render, remove, RenderPosition } from '../framework/render.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';
import { SortTypes, UpdateType, UserAction, FilterType } from '../const.js';
import { sortByDay, sortByTime, sortByPrice } from '../utils/sort.js';
import { filterEvents } from '../utils/filter.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class PagePresenter {
  #tripListComponent = new EventListView();
  #loadingComponent = new LoadingView();
  #sortComponent = null;
  #noEventComponent = null;

  #pageContainer = null;
  #headerContainer = null;
  #pointsModel = null;
  #filterModel = null;

  #currentSortType = SortTypes.DEFAULT;
  #currentFilterType = FilterType.EVERYTHING;
  #newEventButton = null;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  #newEventFormPresenter = null;
  #pointPresenters = new Map();
  #headerPresenter = null;

  constructor({pageContainer, headerContainer, pointsModel, filterModel, newEventButton, onNewEventDestroy}) {
    this.#pageContainer = pageContainer;
    this.#headerContainer = headerContainer;

    this.#newEventButton = newEventButton;

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
    const filteredPoints = filterEvents[this.#currentFilterType](points);

    switch (this.#currentSortType) {
      case SortTypes.TIME:
        return filteredPoints.sort(sortByTime);
      case SortTypes.PRICE:
        return filteredPoints.sort(sortByPrice);
    }
    return filteredPoints.sort(sortByDay);
  }

  get offers () {
    const offers = this.#pointsModel.offers;
    return offers;
  }

  get destinations () {
    const destinations = this.#pointsModel.destinations;
    return destinations;
  }

  init() {
    this.#newEventButton.disabled = true;
    this.#renderSort();
    this.#renderTripList();
  }

  createEvent() {
    this.#currentSortType = SortTypes.DEFAULT;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newEventFormPresenter.init(this.offers, this.destinations);
  }

  /**
   * #handleViewAction будет вызывать обновление модели.
   * actionType - действие пользователя, нужно чтобы понять, какой метод модели вызвать
   * updateType - тип изменений, нужно чтобы понять, что после нужно обновить
   * update - обновленные данные
   */
  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointPresenters.get(update.id).setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_POINT:
        this.#newEventFormPresenter.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch(err) {
          this.#newEventFormPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenters.get(update.id).setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch(err) {
          this.#pointPresenters.get(update.id).setAborting();
        }
        break;
    }
    this.#uiBlocker.unblock();
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
        this.#clearHeader();
        this.#renderHeader();
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
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#clearHeader();
        this.#renderHeader();
        this.#newEventButton.disabled = false;
        this.#renderSort();
        this.#renderTripList();
        break;
    }
  };

  #handleModeChange = () => {
    this.#newEventFormPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
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

  #renderLoading() {
    render(this.#loadingComponent, this.#pageContainer);
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
    remove(this.#loadingComponent);

    if (this.#noEventComponent) {
      remove(this.#noEventComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortTypes.DEFAULT;
    }
  }

  #renderTripList() {
    const points = this.points.slice(0, this.points.length);
    render(this.#tripListComponent, this.#pageContainer);

    if (this.#isLoading) {
      this.#renderHeader();
      this.#renderLoading();
      return;
    }

    if (this.points.length === 0) {
      this.#renderNoEvents();
      return;
    }

    this.#renderPoints(points);
  }
}
