import PointItemView from '../view/point-view.js';
import FormEditView from '../view/form-edit-view.js';
import { render, replace, remove } from '../framework/render.js';
import { isPointInPresent, isPointInPast, isPointInFuture } from '../utils/filter.js';
import { Mode, UserAction, UpdateType, FormResetButtonNames } from '../const.js';

export default class PointPresenter {
  #eventListContainer = null;

  #handleDataChange = null;
  #handleModeChange = null;

  #pointComponent = null;
  #formEditComponent = null;

  #point = null;
  #dataOffers = null;
  #dataDestinations = null;
  #mode = Mode.DEFAULT;

  constructor({eventListContainer, onDataChange, onModeChange}) {
    this.#eventListContainer = eventListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point, dataOffers, dataDestinations) {
    this.#point = point;
    this.#dataOffers = dataOffers;
    this.#dataDestinations = dataDestinations;

    const prevPointComponent = this.#pointComponent;
    const prevFormEditComponent = this.#formEditComponent;

    this.#pointComponent = new PointItemView({
      point: this.#point,
      dataOffers: this.#dataOffers,
      dataDestinations: this.#dataDestinations,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#formEditComponent = new FormEditView({
      point: this.#point,
      dataOffers: this.#dataOffers,
      dataDestinations: this.#dataDestinations,
      resetButton: FormResetButtonNames.DELETE,
      isNewForm: false,
      onFormEditClick: this.handleFormEditClick,
      onFormSubmit: this.handleFormSubmit,
      onResetClick: this.handleResetClick,
    });

    if (prevPointComponent === null || prevFormEditComponent === null) {
      render(this.#pointComponent, this.#eventListContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#formEditComponent, prevFormEditComponent);
    }

    remove(prevPointComponent);
    remove(prevFormEditComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#formEditComponent);
  }

  setSaving() {
    if (this.#mode === Mode.EDITING) {
      this.#formEditComponent.updateElement({
        isSaving: true,
        isDisabled: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING) {
      this.#formEditComponent.updateElement({
        isDeleting: true,
        isDisabled: true,
      });
    }
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#formEditComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  }

  setAborting() {
    if (this.#mode === Mode.DEFAULT) {
      this.#pointComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#formEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#formEditComponent.shake(resetFormState);
  }

  #replacePointToForm() {
    replace(this.#formEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#formEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      {...this.#point, isFavorite: !this.#point.isFavorite},
    );
  };

  #handleEditClick = () => {
    this.#replacePointToForm();
  };

  handleFormEditClick = () => {
    this.#replaceFormToPoint();
  };

  handleFormSubmit = (update) => {
    // Проверяем, поменялись ли в задаче данные, которые попадают под фильтрацию,
    // а значит требуют перерисовки списка - если таких нет, это PATCH-обновление
    const isMinorUpdate =
      isPointInPast(this.#point.dateTo) !== isPointInPast(update.dateTo) ||
      isPointInPresent(this.#point.dateFrom, this.#point.dateTo) !== isPointInPresent(update.dateFrom, update.dateTo) ||
      isPointInFuture(this.#point.dateFrom) !== isPointInFuture(update.dateFrom);

    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
      update
    );
  };

  handleResetClick = (point) => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#formEditComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  };
}
