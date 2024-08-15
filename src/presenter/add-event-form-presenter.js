import { remove, render, RenderPosition } from '../framework/render.js';
import AddEventFormView from '../view/new-point-edit-form-view.js';
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
      // onFormEditClick: this._handleFormEditClick,
      onFormSubmit: this.#handleFormSubmit,
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

  setSaving() {
    this.#newEventFormComponent.updateElement({
      isDisabled: true,
      isSaving: true,
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

  #handleFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  _handleResetClick = () => {
    this.destroy();
  };

  // _handleFormEditClick = () => {
  //   this.destroy();
  //   // this.#replaceFormToPoint();
  //   // document.addEventListener('keydown', this.#escKeyDownHandler);
  // };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };
}
