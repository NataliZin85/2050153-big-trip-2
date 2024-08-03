import EventFormView from '../view/event-form-view.js';

export default class NewEventFormView extends EventFormView {
  constructor({event, dataOffers, dataDestinations, resetButton, isNewForm, onFormEditClick, onFormSubmit, onResetClick}) {
    super({event, dataOffers, dataDestinations, resetButton, isNewForm, onFormSubmit, onFormEditClick, onResetClick });

    this._setState(NewEventFormView.parseEventToState({event}));
  }

  reset = (event) => this.updateElement(NewEventFormView.parseEventToState(event));
}
