import PointFormView from '../view/point-form-view.js';

export default class NewEventFormView extends PointFormView {
  constructor({point, dataOffers, dataDestinations, resetButton, isNewForm, onFormSubmit, onResetClick}) {
    super({ point, dataOffers, dataDestinations, resetButton, isNewForm, onFormSubmit, onResetClick });

    this._setState(NewEventFormView.parsePointToState({point}));
  }

  reset = (point) => this.updateElement(NewEventFormView.parsePointToState(point));
}
