import AbstractView from '../framework/view/abstract-view.js';
import { getTotalPrice, getOfferById } from '../utils/event.js';

function createTripInfoTemplate(points, dataOffers) {
  return (
    `<section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">Amsterdam &mdash; Chamonix &mdash; Geneva</h1>
        <p class="trip-info__dates">18&nbsp;&mdash;&nbsp;20 Mar</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${getTotalPrice(points, dataOffers)}</span>
      </p>
    </section>`
  );
}

export default class TripInfoView extends AbstractView {
  #points = null;
  #dataOffers = null;

  constructor({points, dataOffers}) {
    super();
    this.#points = points;
    this.#dataOffers = dataOffers;
  }

  get template() {
    return createTripInfoTemplate(this.#points, this.#dataOffers);
  }
}
