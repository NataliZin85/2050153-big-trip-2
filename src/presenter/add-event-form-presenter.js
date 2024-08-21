import { remove, render, RenderPosition } from '../framework/render.js';
import AddEventFormView from '../view/new-point-edit-form-view.js';
import { UserAction, UpdateType, FormResetButtonNames } from '../const.js';

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
      resetButton: FormResetButtonNames.CANCEL,
      isNewForm: true,
      onFormEditClick: this.handleFormEditClick,
      onFormSubmit: this.handleFormSubmit,
      onResetClick: this.handleResetClick,
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

  setSaving() {
    this.#newEventFormComponent.updateElement({
      isSaving: true,
      isDisabled: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this.#newEventFormComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#newEventFormComponent.shake(resetFormState);
  }

  handleFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  handleResetClick = () => {
    this.destroy();
  };

  handleFormEditClick = () => {
    this.destroy();
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
