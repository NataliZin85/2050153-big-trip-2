import PointFormView from '../view/point-form-view.js';

export default class NewEventFormView extends PointFormView {
  constructor({point, dataOffers, dataDestinations, resetButton, isNewForm, onFormEditClick, onFormSubmit, onResetClick}) {
    super({ point, dataOffers, dataDestinations, resetButton, isNewForm, onFormEditClick, onFormSubmit, onResetClick });

    this._setState(NewEventFormView.parsePointToState({point}));
  }
}
