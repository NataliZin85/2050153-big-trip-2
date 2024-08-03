import PagePresenter from './presenter/page-presenter.js';
import EventsModel from './model/event-model.js';
import FilterModel from './model/filter-model.js';

const headerElement = document.querySelector('.page-header__container');
const pageMainElement = document.querySelector('.page-main');
const pageMainSortElement = pageMainElement.querySelector('.trip-events');
const newEventButton = document.querySelector('.trip-main__event-add-btn');

const eventsModel = new EventsModel();
const filterModel = new FilterModel();

newEventButton.addEventListener('click', handleNewEventButtonClick);

const pagePresenter = new PagePresenter({
  pageContainer: pageMainSortElement,
  headerContainer: headerElement,
  eventsModel,
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

pagePresenter.init();
