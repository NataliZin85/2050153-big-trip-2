import AbstractView from '../framework/view/abstract-view.js';
import { dateFormat, humanizeDate, getDurationInTime, capitalizeWords, getPointTypeOffer, getOfferById, getDestinationByTargetName, getDestinationById } from '../utils/utils.js';

function createOfferTemplate({title, price}) {
  return (
    `<li class="event__offer">
      <span class="event__offer-title">${title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${price}</span>
    </li>`
  );
}

function createEventItemTemplate(event, dataOffers, dataDestinations) {
  const { type, dateFrom, dateTo, isFavorite, basePrice } = event;
  console.log(event, dataOffers, dataDestinations);
  const destination = getDestinationById(dataDestinations, event);
  console.log(destination);
  const eventOffers = getOfferById(dataOffers, event);
  // console.log(eventOffers);
  // const checkedOffers =
  // const { name } = destination;

  const favouriteClassName = isFavorite
    ? 'event__favorite-btn--active'
    : '';

  return (
    `<li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime=${dateFrom}>${humanizeDate(dateFrom, dateFormat.MONTH_DAY)}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${capitalizeWords(type)} ${destination.name}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${dateFrom}">${humanizeDate(dateFrom, dateFormat.HOURS)}</time>
            &mdash;
            <time class="event__end-time" datetime="${dateTo}">${humanizeDate(dateTo, dateFormat.HOURS)}</time>
          </p>
          <p class="event__duration">${getDurationInTime(dateFrom, dateTo)}M</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${eventOffers.map((offer) => createOfferTemplate(offer)).join('')}
        </ul>
        <button class="event__favorite-btn ${favouriteClassName}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>`
  );
}

export default class EventItemView extends AbstractView {
  #event = null;
  #dataOffers = null;
  #dataDestinations = null;

  #handleEditClick = null;
  #handleFavoriteClick = null;

  constructor({event, dataOffers, dataDestinations, onEditClick, onFavoriteClick}) {
    super();
    this.#event = event;
    this.#dataOffers = dataOffers;
    this.#dataDestinations = dataDestinations;

    this.#handleEditClick = onEditClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editClickHandler);
    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createEventItemTemplate(this.#event, this.#dataOffers, this.#dataDestinations);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };
}
