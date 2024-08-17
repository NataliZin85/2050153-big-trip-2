import dayjs from 'dayjs';
import { FilterType } from '../const';

// eslint-disable-next-line no-undef
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
dayjs.extend(isSameOrBefore);

// eslint-disable-next-line no-undef
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(isSameOrAfter);

const isPointInPresent = (dateStart, dateEnd) => dayjs().isSameOrAfter(dateStart, 'D') && dayjs().isSameOrBefore(dateEnd, 'D');

const isPointInPast = (dateEnd) => dateEnd && dayjs().isAfter(dateEnd, 'D');

const isPointInFuture = (dateStart) => dateStart && dayjs().isBefore(dateStart, 'D');

const filterEvents = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => isPointInFuture(point.dateFrom)),
  [FilterType.PRESENT]: (points) => points.filter((point) => isPointInPresent(point.dateFrom, point.dateTo)),
  [FilterType.PAST]: (points) => points.filter((point) => isPointInPast(point.dateTo)),
};

export { isPointInPresent, isPointInPast, isPointInFuture, filterEvents };
