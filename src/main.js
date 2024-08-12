import PagePresenter from './presenter/page-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import PointsApiService from './points-api-service.js';

const headerElement = document.querySelector('.page-header__container');
const pageMainElement = document.querySelector('.page-main');
const pageMainSortElement = pageMainElement.querySelector('.trip-events');
const newEventButton = document.querySelector('.trip-main__event-add-btn');

const AUTHORIZATION = `Basic bmF0YWxpYTp6aW5vdmV2YQ==`;
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const pointsModel = new PointsModel({
  pointsApiService: new PointsApiService(END_POINT, AUTHORIZATION)
});
const filterModel = new FilterModel();

newEventButton.addEventListener('click', handleNewEventButtonClick);

const pagePresenter = new PagePresenter({
  pageContainer: pageMainSortElement,
  headerContainer: headerElement,
  pointsModel,
  filterModel,
  onNewEventDestroy: handleNewEventFormClose
});

function handleNewEventFormClose() {
  newEventButton.disabled = false;
}

function handleNewEventButtonClick() {
  pagePresenter.createEvent();
  newEventButton.disabled = true;
}

newEventButton.disabled = true;
pagePresenter.init();
pointsModel.init()
  .finally(() => {
    newEventButton.disabled = false;
  });
