import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);
// eslint-disable-next-line no-undef
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

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

// Приобразование данных по дате в нужный формат
const humanizeDate = (eventDate, format) => eventDate ? dayjs.utc(eventDate).format(format) : '';

// Приобразование формата отображения текста с первой заглавной буквой.
// Пример: "Название Города"
const capitalizeWords = (str) => str.replace(/\b\w/g, c => c.toUpperCase());

/**
 * getLongDuration - Получение длительности события, которое более 99 дней по продолжительности
 * Parametrs:
 * start - начало события;
 * end - завершения события;
 */
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

/**
 * getDurationInTime - Получение длительности события
 * Parametrs:
 * start - начало события;
 * end - завершения события;
 */
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

/**
 * getPointTypeOffer - Получение дополнительных предложений в зависимости от типа.
 * Parametrs:
 * dataOffers - все имеющиеся предложения;
 * point - точка маршрута;
 */
const getPointTypeOffer = (dataOffers, point) => dataOffers.find((offer)=> offer.type === point.type);

/**
 * getOfferById - Получение дополнительных предложений по id
 * Parametrs:
 * dataOffers - все имеющиеся предложения;
 * point - точка маршрута;
 */
const getOfferById = (dataOffers, point) => {
  const offerByType = getPointTypeOffer(dataOffers, point);
  return offerByType.offers.filter((item) => point.offers.find((id) => item.id === id));
};

/**
 * getDestinationById - Получение описания точки маршрута по id.
 * Parametrs:
 * dataDestinations - все имеющиеся описания точек маршрута;
 * point - точка маршрута;
 */
const getDestinationById = (dataDestinations, point) => dataDestinations.find((item)=>item.id === point.destination);

/**
 * getDestinationByTargetName - Получение описания точки маршрута в зависимости от названия точки назначения.
 * Parametrs:
 * dataDestinations - все имеющиеся описания точек маршрута;
 * targetName - название точки назначения;
 */
const getDestinationByTargetName = (dataDestinations, targetName) => dataDestinations.find((item)=>item.name === targetName);

/**
 * Function to getTotalPrice - получение значения конечной цены точеки назначения плюс дополнительные расстраты
 * Parametrs: event offers
 */
const getTotalEventPrice = (event, offers) => {
  const eventOffers = getOfferById(offers, event);
  let totalOfferesPrice = 0;

  eventOffers.forEach((offer) => {
      totalOfferesPrice += offer.price;
  });

  const totalEventPrice = Number(event.basePrice) + totalOfferesPrice;
  return totalEventPrice;
};

/**
 * Function to getTotalPrice - получение значения конечной цены точеки назначения плюс дополнительные расстраты
 * Parametrs: events offers
 */
const getTotalPrice = (events, offers) => {
  let totalPrice = 0;

  events.forEach((event) => {
    const totalEventPrice = getTotalEventPrice(event, offers);
    totalPrice += totalEventPrice;
  });
  return totalPrice;
};


export { dateFormat, humanizeDate, getDurationInTime, capitalizeWords, getPointTypeOffer, getOfferById, getDestinationByTargetName, getDestinationById, getTotalPrice };
