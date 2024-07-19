import EventItemView from '../view/event-view.js';
import FormEditView from '../view/form-edit-view.js';
import { render, replace, remove } from '../framework/render.js';
import { isEscapeKey, isEnterKey } from '../utils/utils.js';
import { Mode } from '../const.js';

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
      onFormEditClick: this.#handleFormEditClick,
      onFormSubmit: this.#handleFormSubmit,
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
      // console.log(1, this.#formEditComponent);
      this.#replaceFormToEvent();
    }
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange({...this.#event, isFavorite: !this.#event.isFavorite});
  };

  #handleEditClick = () => {
    this.#replaceEventToForm();
  };

  #handleFormEditClick = () => {
    this.#formEditComponent.reset(this.#event);
    // console.log(2, this.#formEditComponent);
    this.#replaceFormToEvent();
  };

  #handleFormSubmit = (event) => {
    this.#handleDataChange(event);
    // this.#formEditComponent.reset(event);
    // this.#eventComponent.reset(event);
    // console.log(3, this.#formEditComponent);
    this.#replaceFormToEvent();
  };
}
