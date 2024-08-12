import dayjs from 'dayjs';

function getDuration(point) {
  return dayjs(point.dateTo).diff(dayjs(point.dateFrom));
}

function sortByDay(pointA, pointB) {
  return pointA.dateFrom - pointB.dateFrom;
}

function sortByTime(pointA, pointB) {
  const durationA = getDuration(pointA);
  const durationB = getDuration(pointB);

  return durationB - durationA;
}

function sortByPrice(pointA, pointB) {
  return pointA.basePrice - pointB.basePrice;
}

export { sortByDay, sortByTime, sortByPrice };
