import AbstractView from '../framework/view/abstract-view.js';
import { getTotalPrice, getDestinationById, humanizeDate, dateFormat } from '../utils/event.js';
import { sortByDay } from '../utils/sort.js';
import { filterEvents } from '../utils/filter.js';

function getTripInfoTitle(firstPoint, secondPoint, lastPoint, sortedPoints, dataDestinations) {
  const startPoint = getDestinationById(dataDestinations, firstPoint);
  const endPoint = getDestinationById(dataDestinations, lastPoint);
  if (sortedPoints.length === 1) {
    return `${startPoint.name}`;
  } else if (sortedPoints.length === 2) {
    return `${startPoint.name} &mdash; ${endPoint.name}`;
  } else if (sortedPoints.length === 3) {
    const nextPoint = getDestinationById(dataDestinations, secondPoint);
    return `${startPoint.name} &mdash; ${nextPoint.name} &mdash; ${endPoint.name}`;
  }
  return `${startPoint.name} &mdash; ... &mdash; ${endPoint.name}`;
}

function getNewDate(pointDate) {
  return pointDate !== null ? new Date(pointDate) : pointDate;
}

function createTripInfoTemplate(points, dataOffers, dataDestinations, currentFilterType) {
  const filteredEvents = filterEvents[currentFilterType](points);
  if (filteredEvents.length !== 0) {
    const sortedPoints = filteredEvents.sort(sortByDay);

    const firstPoint = sortedPoints[0];
    const secondPoint = sortedPoints[1];
    const lastPoint = sortedPoints[(sortedPoints.length - 1)];

    const firstDateFromMonth = getNewDate(firstPoint.dateFrom).getUTCMonth();
    const lastDateToMonth = getNewDate(lastPoint.dateTo).getUTCMonth();

    return (
      `<section class="trip-main__trip-info  trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${getTripInfoTitle(firstPoint, secondPoint, lastPoint, sortedPoints, dataDestinations)}
          </h1>
          <p class="trip-info__dates">
            ${(firstDateFromMonth !== lastDateToMonth) ? humanizeDate(firstPoint.dateFrom, dateFormat.DATE_MONTH) : humanizeDate(firstPoint.dateFrom, dateFormat.DATE_DAY)}
            &nbsp;&mdash;&nbsp;
            ${humanizeDate(lastPoint.dateTo, dateFormat.DATE_MONTH)}
          </p>
        </div>
        <p class="trip-info__cost">
          Total: &euro;&nbsp;<span class="trip-info__cost-value">${getTotalPrice(filteredEvents, dataOffers)}</span>
        </p>
      </section>`
    );
  }
  return '';
}

export default class TripInfoView extends AbstractView {
  #points = null;
  #dataOffers = null;
  #dataDestinations = null;
  #currentFilterType = null;

  constructor({points, dataOffers, dataDestinations, currentFilterType}) {
    super();
    this.#points = points;
    this.#dataOffers = dataOffers;
    this.#dataDestinations = dataDestinations;
    this.#currentFilterType = currentFilterType;
  }

  get template() {
    return createTripInfoTemplate(this.#points, this.#dataOffers, this.#dataDestinations, this.#currentFilterType);
  }
}
