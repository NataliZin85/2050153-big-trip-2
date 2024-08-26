import PointFormView from '../view/point-form-view.js';

export default class FormEditView extends PointFormView {
  constructor({point, dataOffers, dataDestinations, resetButton, isNewForm, onFormEditClick, onFormSubmit, onResetClick}) {
    super({point, dataOffers, dataDestinations, resetButton, isNewForm, onFormEditClick, onFormSubmit, onResetClick });

    this._setState(FormEditView.parsePointToState({point}));
  }

  reset (point) {
    this.updateElement(FormEditView.parsePointToState(point));
  }
}
