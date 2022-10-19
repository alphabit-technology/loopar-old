import {BaseInput} from "/components/base/base-input.js";

export class DefaultInput extends BaseInput {
   constructor(props) {
      super(props);
   }

   make() {
      super.make();

      this.input.add_class("form-control");
      this.label.add_class("col-form-label d-block");

      this.add_class('form-group');
   }
}