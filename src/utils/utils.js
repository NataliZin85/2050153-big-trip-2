import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTS = 60;
const ONE_HOUR = 1;
const HOURS_IN_DAY = 24;
const DAYS_IN_MONTH = 30;

const dateFormat = {
  DATE: 'DD/MM/YY HH:mm',
  DATE_AND_TIME: 'YYYY-MM-DD-HH:mm',
  MONTH_DAY: 'MMM DD',
  HOURS: 'HH:mm',
  DATE_POINT: 'YYYY-MM-DD',
};

// Получение целого положительного числа из диапазона
const getRandomInteger = (a, b) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(Math.random() * (upper - lower + 1) + lower);
};

// Получение случайного значения из массива данных
const getRandomArrayElement = (elements) => elements[getRandomInteger(0, elements.length - 1)];

// получение массива случайной длины из значений
const getArrayFromRandomElements = (elements) => Array.from(
  { length: getRandomInteger(0, elements.length - 1) },
  () => getRandomArrayElement(elements),
).join(', ');

const capitalizeWords = (str) => str.replace(/\b\w/g, c => c.toUpperCase());

const isEscapeKey = (evt) => (evt).key === 'Escape';
const isEnterKey = (evt) => (evt).key === 'Enter';

// Приобразование данных по дате в нужный формат
const humanizeDate = (eventDate, format) => eventDate ? dayjs(eventDate).format(format) : '';

const getLongDuration = (start, end) => {
  const durationInDays = dayjs.duration(dayjs(end).diff(dayjs(start))).asDays();
  const durationInHours = dayjs.duration(dayjs(end).diff(dayjs(start))).asHours();

  let days = Math.round(durationInDays);
  const restDays = durationInDays - days;
  const restHours = durationInHours - Math.round(durationInHours);
  let hours = 0;
  if (restDays < 0) {
    hours = Math.round((1 + restDays) * HOURS_IN_DAY);
    days = days - 1;
  } else {
    hours = Math.round(restDays * HOURS_IN_DAY);
  }

  let minutes = 0;
  if (restHours < 0) {
    minutes = Math.round((1 + restHours) * MINUTES_IN_HOUR);
    hours = hours - 1;
  } else {
    minutes = Math.round(restHours * MINUTES_IN_HOUR);
  }

  if((hours.toString()).length === 1 && (minutes.toString()).length !== 1){
    return `${days}D 0${hours}H ${minutes}M`;
  } else if((hours.toString()).length !== 1 && (minutes.toString()).length === 1){
    return `${days}D ${hours}H 0${minutes}M`;
  } else if((hours.toString()).length === 1 && (minutes.toString()).length === 1){
    return `${days}D 0${hours}H 0${minutes}M`;
  } else {
    return`${days}D ${hours}H ${minutes}M`;
  }
};

function getDurationInTime(start, end) {
  const difference = (dayjs(end).diff(dayjs(start)));
  const differenceInHours = dayjs(end).diff(dayjs(start), 'hour');
  let eventDuration;

  if (differenceInHours < ONE_HOUR) {
    eventDuration = dayjs(difference).format('mm[M]');;
  } else if (differenceInHours > ONE_HOUR && differenceInHours < HOURS_IN_DAY) {
    eventDuration = dayjs(difference).format('HH[H] mm[M]');
  } else if (differenceInHours >= HOURS_IN_DAY) {
    if(dayjs(end).diff(dayjs(start), 'day') > DAYS_IN_MONTH) {
      eventDuration = getLongDuration(start, end);
    } else {
      eventDuration = dayjs(difference).format('DD[D] HH[H] mm[M]');
    }
  }
  return eventDuration;
}

function updateItem (items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

const getPointTypeOffer = (dataOffers, point) => dataOffers.find((offer)=> offer.type === point.type);

const getOfferById = (dataOffers, point) => {
  const offerByType = getPointTypeOffer(dataOffers, point);
  return offerByType.offers.filter((item) => point.offers.find((id) => item.id === id));
};

const getDestinationById = (dataDestinations, point) => dataDestinations.find((item)=>item.id === point.destination);

const getDestinationByTargetName = (dataDestinations, targetName) => dataDestinations.find((item)=>item.name === targetName);

/**
 * Function to getTotalEventPrice
 * Parametrs: event.basePrice, offers.price
 */
// function getTotalPrice (basePrice, offerPrices) {
//   let totalOfferesPrice = 0;

//   offerPrices.forEach((value) => totalOfferesPrice += +value);

//   const totalPrice = basePrice + totalOfferesPrice;
//   return totalPrice;
// }

export { getRandomArrayElement, getRandomInteger, getArrayFromRandomElements, dateFormat, humanizeDate, getDurationInTime, capitalizeWords, isEscapeKey, getPointTypeOffer, getOfferById, getDestinationByTargetName, getDestinationById, updateItem };
