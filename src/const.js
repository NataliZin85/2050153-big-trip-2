const TYPES = [
  'taxi',
  'bus',
  'train',
  'ship',
  'drive',
  'flight',
  'check-in',
  'sightseeing',
  'restaurant'
];

const FilterType = {
  EVERYTHING: 'everything',
  PAST: 'past',
  PRESENT: 'present',
  FUTURE: 'future',
};

const TextNoEvent = {
  'everything': 'Click New Event to create your first point',
  'past': 'There are no past events now',
  'present': 'There are no present events now',
  'future': 'There are no future events now',
};

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

const SortTypes = {
  DEFAULT: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFERS: 'offers',
};

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
};

const FormResetButtonNames = {
  DELETE: 'Delete',
  CANCEL: 'Cancel'
};

const FormResetButtonActions = {
  DELETE: 'Deleting...',
  CANCEL: 'Canceling...'
};

const BLANK_POINT = {
  basePrice: 0,
  dateFrom: '',
  dateTo: '',
  destination: '',
  isFavorite: false,
  offers: [],
  type: 'flight'
};

export { TYPES, TextNoEvent, Mode, SortTypes, FilterType, UserAction, UpdateType, FormResetButtonNames, FormResetButtonActions, BLANK_POINT };
