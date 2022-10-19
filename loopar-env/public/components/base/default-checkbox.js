import {BaseInput} from "./base-input.js";
import {value_is_true} from "../../utils/helper.js";

export class DefaultCheckbox extends BaseInput {
   input_type = 'checkbox';

   constructor(props) {
      super(props);
   }

   make() {
      super.make();

      this.input.add_class("custom-control-input");
      this.label.remove_class("col-form-label").add_class("custom-control-label d-block");

      this.add_class(`custom-control custom-${this.element}`);
   }

   val(val = null, trigger_change = true) {
      if (val != null) {
         this.input.obj.checked = value_is_true(val);
         if (trigger_change) this.trigger('change');
      } else {
         return this.input.obj.checked ? 1 : 0;
      }
   }
}