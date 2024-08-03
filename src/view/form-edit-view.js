import EventFormView from '../view/event-form-view.js';

export default class FormEditView extends EventFormView {
  constructor({event, dataOffers, dataDestinations, resetButton, isNewForm, onFormEditClick, onFormSubmit, onResetClick}) {
    super({event, dataOffers, dataDestinations, resetButton, isNewForm, onFormEditClick, onFormSubmit, onResetClick });

    this._setState(FormEditView.parseEventToState({event}));
  }

  reset = (event) => this.updateElement(FormEditView.parseEventToState(event));
}
