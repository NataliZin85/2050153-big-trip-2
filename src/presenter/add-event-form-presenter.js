import { remove, render, RenderPosition } from '../framework/render.js';
import AddEventFormView from '../view/new-point-edit-form-view.js';
import { nanoid } from 'nanoid';
import { UserAction, UpdateType, FormResetButton } from '../const.js';

export default class NewEventFormPresenter {
  #newEventFormComponent = null;
  #eventListContainer = null;
  #handleDataChange = null;
  #handleModeChange = null;
  #handleDestroy = null;

  #point = null;
  #dataOffers = null;
  #dataDestinations = null;

  constructor({eventListContainer, onDataChange, onDestroy}) {
    this.#eventListContainer = eventListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init(dataOffers, dataDestinations) {
    this.#dataOffers = dataOffers;
    this.#dataDestinations = dataDestinations;

    if (this.#newEventFormComponent !== null) {
      return;
    }

    this.#newEventFormComponent = new AddEventFormView({
      dataOffers: this.#dataOffers,
      dataDestinations: this.#dataDestinations,
      resetButton: FormResetButton.CANCEL,
      isNewForm: true,
      onFormEditClick: this._handleFormEditClick,
      onFormSubmit: this._handlePointFormSubmit,
      onResetClick: this._handleResetClick,
    });

    render(this.#newEventFormComponent, this.#eventListContainer, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#newEventFormComponent === null) {
      return;
    }

    this.#handleDestroy();

    remove(this.#newEventFormComponent);
    this.#newEventFormComponent = null;

    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  _handlePointFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      // Пока у нас нет сервера, который бы после сохранения
      // выдывал честный id задачи, нам нужно позаботиться об этом самим
      {id: nanoid(), ...point},
    );
    this.destroy();
  };

  _handleResetClick = () => {
    this.destroy();
  };

  _handleFormEditClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
