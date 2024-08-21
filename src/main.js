import PagePresenter from './presenter/page-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import PointsApiService from './points-api-service.js';

const headerElement = document.querySelector('.page-header__container');
const pageMainElement = document.querySelector('.page-main');
const pageMainSortElement = pageMainElement.querySelector('.trip-events');
const newEventButtonElement = document.querySelector('.trip-main__event-add-btn');

const AUTHORIZATION = 'Basic bmF0YWxpYTp6aW5vdmV2YQ==';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const pointsModel = new PointsModel({
  pointsApiService: new PointsApiService(END_POINT, AUTHORIZATION)
});
const filterModel = new FilterModel();

const pagePresenter = new PagePresenter({
  pageContainer: pageMainSortElement,
  headerContainer: headerElement,
  pointsModel,
  filterModel,
  newEventButtonElement,
  onNewEventDestroy: handleNewEventFormClose,
});

newEventButtonElement.addEventListener('click', handleNewEventButtonClick);

function handleNewEventFormClose() {
  newEventButtonElement.disabled = false;
}

function handleNewEventButtonClick() {
  pagePresenter.createEvent();
  newEventButtonElement.disabled = true;
}

newEventButtonElement.disabled = true;
pagePresenter.init();
pointsModel.init();
