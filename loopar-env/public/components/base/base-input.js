import {Div} from "/components/elements/div.js";
import {elements} from "/components/elements.js";
import {data_interface} from "/element-definition.js";
import {element_manage} from "/components/element-manage.js";


export class BaseInput extends Div {
   input_tag_name = 'input';
   input_type = 'text';
   autocomplete = 'off';
   group_element = INPUT;

   constructor(props) {
      super(props, false);
   }

   make() {
      super.make();

      const element_name = element_manage.element_name(this.element);

      this.data.id = element_name.id;
      this.data.label = this.data.label || element_name.label;

      const components = [
         elements({
            props: {
               for: this.data.id
            },
            content: (this.without_label ? "" : this.data.label),
         }).tag('label'),
         elements({
            props: {
               name: this.data.name,
               id: this.data.id,
               type: this.input_type,
               autocomplete: this.autocomplete,
            },
         }).tag(this.input_tag_name)
      ];
      this.label = components.at(0);
      this.input = components.at(1);

      if(this.input_type === CHECKBOX) components.reverse();

      components.forEach(component => this.append(component));

      this.is_writeable = true;
      this.bin_events();
   }

   bin_events() {
      this.on("change", () => {
         this.validate();
      });

      this.filter_value();
   }

   disable(on_disable = true) {
      super.disable(on_disable);

      this.input.prop('disabled', true);
   }

   enable(on_enable = true) {
      super.enable(on_enable);

      this.input.prop('disabled', true);
   }

   val(val = null, {event_change = true, focus = false} = {}) {
      return this.input.val(val, {event_change, focus});
   }

   get #datatype() {
      const type = (this.element === INPUT ? (this.data.format || this.element) : this.element).toLowerCase();

      return type;
   }

   validate() {
      const validation = data_interface(this).validate();

      if (!validation.valid) {
         this.invalid_status();
      } else {
         this.valid_status();
      }

      return validation;
   }

   invalid_status() {
      this.input.add_class('is-invalid');
   }

   valid_status() {
      this.input.remove_class('is-invalid');
   }

   #is_valid_value(value) {
      if (["Int", "Long Int"].includes(this.data.format)) {
         return /^-?\d*[]?\d*$/.test(value);
      }
      if (["Currency", "Float", "Percent"].includes(this.data.format)) {
         return /^-?\d*[.,]?\d*$/.test(value);
      }

      if ([DATE].includes(this.element)) {
         return /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/.test(value);
      }

      return true;
   }

   filter_value() {
      const self = this;
      ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach((event) => {
         this.input.obj.addEventListener(event, function () {
            if (self.#is_valid_value(this.value)) {
               this.oldValue = this.value;
               this.oldSelectionStart = this.selectionStart;
               this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
               this.value = this.oldValue;
               this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
               this.value = "";
            }
         });
      });
   }

   set_size(size='md') {
      this.input.remove_class(`form-control-${this.data.size}`).add_class(`form-control-${size}`);
      this.label.remove_class(`col-form-label-${this.data.size}`).add_class(`col-form-label-${size}`);
      this.data.size = size;

      return this;
   }
}