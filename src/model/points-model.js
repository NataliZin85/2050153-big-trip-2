import Observable from '../framework/observable.js';
// import { getRandomEvent } from '../mock/event-points.js';
// import { mockDestinations } from '../mock/destinations.js';
// import { mockOffers } from '../mock/offers.js';
import { POINT_COUNT, UpdateType } from '../const.js';

export default class PointsModel extends Observable {
  #pointsApiService = null;
  #points = [];
  #dataOffers = [];
  #dataDestinations = [];

  constructor({pointsApiService}) {
    super();
    this.#pointsApiService = pointsApiService;

    // this.#pointsApiService.points.then((points) => {
    //   console.log(points.map(this.#adaptToClient));
    // });
    // this.#pointsApiService.offers.then((dataOffers) => {
    //   console.log(dataOffers);
    // });
    // this.#pointsApiService.destinations.then((dataDestinations) => {
    //   console.log(dataDestinations);
    // });
  }

  get points() {
    return this.#points;
  }

  get offers() {
    return this.#dataOffers;
  }

  get destinations() {
    return this.#dataDestinations;
  }

  async init() {
    try {
      const points = await this.#pointsApiService.points;
      this.#points = points.map(this.#adaptToClient);
      console.log(this.#points);
      const offers = await this.#pointsApiService.offers;
      this.#dataOffers = offers.map(this.#adaptToClient);
      console.log(this.#dataOffers);
      const destinations = await this.#pointsApiService.destinations;
      this.#dataDestinations = destinations.map(this.#adaptToClient);
      console.log(this.#dataDestinations);
    } catch(err) {
      this.#points = [];
      this.#dataOffers = [];
      this.#dataDestinations = [];
    }
    this._notify(UpdateType.INIT);
  }

  updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting event point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      update,
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType, update);
  }

  addPoint(updateType, update) {
    this.#points = [
      update,
      ...this.#points,
    ];

    this._notify(updateType, update);
  }

  deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting event point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType);
  }

  #adaptToClient(point) {
    const adaptedPoint = {...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'],
      dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'],
      isFavorite: point['is_favorite'],
    };

    // Ненужные ключи мы удаляем
    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  }
}
