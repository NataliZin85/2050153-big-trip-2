import { getRandomEvent } from '../mock/event-points.js';
import { mockDestinations } from '../mock/destinations.js';
import { mockOffers } from '../mock/offers.js';

const EVENT_COUNT = 3;

export default class EventsModel {
  #events = Array.from({length: EVENT_COUNT},() => getRandomEvent());
  #dataOffers = mockOffers;
  #dataDestinations = mockDestinations;

  get events() {
    return this.#events;
  }

  get offers() {
    return this.#dataOffers;
  }

  get destinations() {
    return this.#dataDestinations;
  }
}
