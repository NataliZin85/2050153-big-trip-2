import EventItemView from '../view/event-view.js';
import FormEditView from '../view/form-edit-view.js';
import { render, replace, remove } from '../framework/render.js';
import { isEscapeKey } from '../utils/utils.js';
import { isEventInPresent, isEventInPast, isEventInFuture } from '../utils/filter.js';
import { Mode, UserAction, UpdateType, FormResetButton } from '../const.js';

export default class EventPresenter {
  #eventListContainer = null;

  #handleDataChange = null;
  #handleModeChange = null;

  #eventComponent = null;
  #formEditComponent = null;

  #event = null;
  #dataOffers = null;
  #dataDestinations = null;
  #mode = Mode.DEFAULT;

  constructor({eventListContainer, onDataChange, onModeChange}) {
    this.#eventListContainer = eventListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(event, dataOffers, dataDestinations) {
    this.#event = event;
    this.#dataOffers = dataOffers;
    this.#dataDestinations = dataDestinations;

    const prevEventComponent = this.#eventComponent;
    const prevFormEditComponent = this.#formEditComponent;

    this.#eventComponent = new EventItemView({
      event: this.#event,
      dataOffers: this.#dataOffers,
      dataDestinations: this.#dataDestinations,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#formEditComponent = new FormEditView({
      event: this.#event,
      dataOffers: this.#dataOffers,
      dataDestinations: this.#dataDestinations,
      resetButton: FormResetButton.DELETE,
      isNewForm: false,
      onFormEditClick: this._handleFormEditClick,
      onFormSubmit: this._handleEventFormSubmit,
      onResetClick: this._handleDeleteClick,
    });

    if (prevEventComponent === null || prevFormEditComponent === null) {
      render(this.#eventComponent, this.#eventListContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#eventComponent, prevEventComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#formEditComponent, prevFormEditComponent);
    }

    remove(prevEventComponent);
    remove(prevFormEditComponent);
  }

  destroy() {
    remove(this.#eventComponent);
    remove(this.#formEditComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#formEditComponent.reset(this.#event);
      this.#replaceFormToEvent();
    }
  }

  #replaceEventToForm() {
    replace(this.#formEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceFormToEvent() {
    replace(this.#eventComponent, this.#formEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #escKeyDownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#formEditComponent.reset(this.#event);
      this.#replaceFormToEvent();
    }
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_EVENT,
      UpdateType.MINOR,
      {...this.#event, isFavorite: !this.#event.isFavorite},
    );
  };

  #handleEditClick = () => {
    this.#replaceEventToForm();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  _handleFormEditClick = () => {
    this.#replaceFormToEvent();
    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  _handleEventFormSubmit = (update) => {
    // Проверяем, поменялись ли в задаче данные, которые попадают под фильтрацию,
    // а значит требуют перерисовки списка - если таких нет, это PATCH-обновление
    const isMinorUpdate =
      isEventInPast(this.#event.dateTo) !== isEventInPast(update.dateTo) ||
      isEventInPresent(this.#event.dateFrom, this.#event.dateTo) !== isEventInPresent(update.dateFrom, update.dateTo) ||
      isEventInFuture(this.#event.dateFrom) !== isEventInFuture(update.dateFrom);

    this.#handleDataChange(
      UserAction.UPDATE_EVENT,
      isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
      update
    );

    this.#replaceFormToEvent();
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  };

  _handleResetClick = (event) => {
    this.#handleDataChange(
      UserAction.DELETE_EVENT,
      UpdateType.MINOR,
      event,
    );
  };
}
