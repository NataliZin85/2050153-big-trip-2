import FilterPresenter from '../presenter/filter-presenter.js';
import TripInfoView from '../view/trip-info-view.js';
import { RenderPosition, render, remove } from '../framework/render.js';

export default class HeaderPresenter {
  #tripInfoComponent = null;

  #headerContainer = null;
  #tripInfoContainer = null;
  #filterContainer = null;

  #pointsModel = null;
  #filterModel = null;

  #filterPresenter = null;

  constructor({headerContainer, pointsModel, filterModel}) {
    this.#headerContainer = headerContainer;
    this.#tripInfoContainer = this.#headerContainer.querySelector('.trip-main');
    this.#filterContainer = this.#headerContainer.querySelector('.trip-controls__filters');
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
  }

  init() {
    this.#renderTripInfo();
    this.#renderFilters();
  }

  destroy() {
    this.#filterPresenter.destroy();

    if (this.#tripInfoComponent.element === null) {
      return;
    }

    remove(this.#tripInfoComponent);
    this.#tripInfoComponent = null;
  }

  #renderTripInfo() {
    this.#tripInfoComponent = new TripInfoView({
      points: this.#pointsModel.points,
      dataOffers: this.#pointsModel.offers,
      dataDestinations: this.#pointsModel.destinations,
      currentFilterType: this.#filterModel.filter,
    });
    if (this.#pointsModel.points.length !== 0) {
      render(this.#tripInfoComponent, this.#tripInfoContainer, RenderPosition.AFTERBEGIN);
    }
  }

  #renderFilters() {
    this.#filterPresenter = new FilterPresenter({
      filterContainer: this.#filterContainer,
      pointsModel: this.#pointsModel,
      filterModel: this.#filterModel,
    });
    this.#filterPresenter.init();
  }
}
