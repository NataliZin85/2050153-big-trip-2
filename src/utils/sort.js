import dayjs from 'dayjs';

const getDuration = (point) => dayjs(point.dateTo).diff(dayjs(point.dateFrom));

const sortByDay = (pointA, pointB) => pointA.dateFrom - pointB.dateFrom;

const sortByTime = (pointA, pointB) => {
  const durationA = getDuration(pointA);
  const durationB = getDuration(pointB);

  return durationB - durationA;
};

const sortByPrice = (pointA, pointB) => pointA.basePrice - pointB.basePrice;

export { sortByDay, sortByTime, sortByPrice };
