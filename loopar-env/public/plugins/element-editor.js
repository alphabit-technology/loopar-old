import {elements} from "/components/elements.js";
import {object_manage} from "/utils/object-manage.js";
import {Capitalize} from "/utils/helper.js";
import {SidebarContainer} from "/plugins/base/sidebar-container.js";

export class ElementEditor extends SidebarContainer {
   #connected_element = null;
   #_child_elements = [];
   #updating = false;

   constructor(parent) {
      super(parent);

      this.hide();
      this.make_wrapper();
      this.make_form();
   }

   make_wrapper() {
      this.element_title_container = elements({wrapper: this.body}).row();
      this.action.on('click', () => {
         this.hide();
         this.parent.toggle(this);
      }).val("<span class='oi oi-brush mr-1'></span>Design");
   }

   make_form() {
      this.form = elements({
         wrapper: this.body,
         content: {
            body: {
               content: {
                  label: elements({
                     legacy_name: true,
                     data: {label: "Label"},
                  }).input(),
                  name: elements({
                     legacy_name: true,
                     data: {label: "Name"},
                  }).input(),
                  format: elements({
                     legacy_name: true,
                     data: {
                        label: "Format",
                        options: [
                           {option: 'data', value: 'Data'},
                           {option: 'text', value: 'Text'},
                           {option: 'email', value: 'Email'},
                           {option: 'decimal', value: 'Decimal'},
                           {option: 'percent', value: 'Percent'},
                           {option: 'currency', value: 'Currency'},
                           {option: 'int', value: 'Int'},
                           {option: 'long_int', value: 'Long Int'},
                           {option: 'password', value: 'Password'},
                           {option: 'read_only', value: 'Read Only'}
                        ],
                        selected: 'data'
                     }
                  }).select(),
                  size: elements({
                     legacy_name: true,
                     data: {
                        label: "Size",
                        options: [
                           {option: 'sm', value: 'Small'},
                           {option: 'md', value: 'Medium'},
                           {option: 'lg', value: 'Large'}
                        ],
                        selected: 'md'
                     }
                  }).select(),
                  type: elements({
                     legacy_name: true,
                     data: {
                        label: "Type",
                        options: [
                           {option: 'default', value: 'Default'},
                           {option: 'primary', value: 'Primary'},
                           {option: 'success', value: 'Success'},
                           {option: 'info', value: 'Info'},
                           {option: 'link', value: 'link'},
                        ],
                        selected: 'default'
                     }
                  }).select(),
                  action: elements({
                     legacy_name: true,
                     data: {label: "Action"}
                  }).input(),
                  options: elements({
                     legacy_name: true,
                     data: {label: "Options"}
                  }).textarea(),
                  style: elements({
                     legacy_name: true,
                     data: {label: "Style"}
                  }).textarea(),
                  class: elements({
                     legacy_name: true,
                     data: {label: "Class"}
                  }).textarea(),
                  no_validate_type: elements({
                     legacy_name: true,
                     data: {label: "No Validate Type"}
                  }).switch(),
                  required: elements({
                     legacy_name: true,
                     data: {label: "Required"}
                  }).switch(),
                  unique: elements({
                     legacy_name: true,
                     data: {label: "Unique"}
                  }).switch(),
                  set_only_time: elements({
                     legacy_name: true,
                     data: {label: "Set Only Time"}
                  }).switch(),
                  draggable: elements({
                     legacy_name: true,
                     data: {label: "Draggable"}
                  }).switch(),
                  droppable: elements({
                     legacy_name: true,
                     data: {label: "Droppable"}
                  }).switch(),
                  hidden: elements({
                     legacy_name: true,
                     data: {label: "Hidden"}
                  }).switch(),
                  in_list_view: elements({
                     legacy_name: true,
                     data: {label: "In List View"}
                  }).switch(),
                  collapsed: elements({
                     legacy_name: true,
                     data: {label: "Collapsed"}
                  }).switch(),
                  div: elements().tag('hr')
               }
            }
         }
      }).col();

      this.#_child_elements = this.form.child_elements();
      this.#make_events();
   }

   edit(element) {
      this.#connected_element = element;
      this.set_data();
      this.sidebar_container.show();
   }

   save_data() {
      if (!this.#updating && this.#connected_element) this.#connected_element.set_data(this.#_child_elements);
   }

   #make_events() {
      object_manage.in_object(this.#_child_elements, (input, field) => {
         input.on(['change', 'keyup'], () => {
            if(field === 'label'){
               this.#_child_elements.name.val(input.val().replaceAll(" ", "_").toLowerCase(), {event_change: false, focus: false});
            }
            this.save_data();
         });
      });
   }

   set_data() {
      if (this.#connected_element) {
         this.#updating = true;
         const data = this.#connected_element.data;
         const _data = JSON.parse(JSON.stringify(this.#connected_element.data));
         if (this.#_child_elements.default_value) this.#_child_elements.default_value.remove();

         if ([INPUT, CHECKBOX, SWITCH, SELECT].includes(this.#connected_element.element)) {
            _data.label = "Default Value";
            _data.value = data.default_value || "";
            this.#_child_elements.default_value = elements({
               identifier: 'default_value',
               data: _data,
               wrapper: this.body,
               props: {
                  class: "col col-12",
                  style: ([CHECKBOX, SWITCH].includes(this.#connected_element.element) ? "padding-left: 35px;" : "")
               }
            })[this.#connected_element.element]().on(['change', 'keyup'], () => {
               this.save_data();
            });
         }

         const disabled_inputs = this.options_disabled;

         this.element_title_container.val(`<h3 class="card-title">${Capitalize(this.#connected_element.element)} Editor</h3>`, {event_change: false, focus: false});

         object_manage.in_object(this.#_child_elements, (input, field) => {
            if (object_manage.is_obj(input) && input.typeof === "JSHtml" && input.is_writeable) {
               input.val(data[field] || "", {event_change: false, focus: false});

               if ((disabled_inputs.length > 0 && disabled_inputs.includes(field) && disabled_inputs[0] !== 'all') ||
                  (disabled_inputs[0] === 'all' && !disabled_inputs.includes(field))) {
                  input.hide();
               } else {
                  input.show();
               }
            }
         });
         this.#updating = false;
      }
   }

   get options_disabled() {
      const input_type_format = ['droppable', 'collapsed', 'type', 'action', 'options'];
      const inputs_type_element = ['droppable', 'collapsed', 'format', 'type', 'action', 'size', 'options'];
      const html = ['required', 'in_list_view', 'collapsed', 'label', 'format', 'datatype', 'options', 'type', 'size', 'action', 'no_validate_type', 'unique'];
      const button = html.concat(input_type_format).filter(item => !['label', 'size', 'type', 'action'].includes(item));
      const markdown = ['all', 'style', 'class'];

      return {
         [INPUT]: input_type_format,
         [TEXTAREA]: inputs_type_element,
         [PASSWORD]: inputs_type_element.filter(item => !['size'].includes(item)),
         [DATE]: inputs_type_element,
         [DATE_TIME]: inputs_type_element,
         [TIME]: inputs_type_element,
         [CHECKBOX]: inputs_type_element,
         [SWITCH]: inputs_type_element,
         [SELECT]: inputs_type_element.filter(field => !['options'].includes(field)),
         [TABLE]: inputs_type_element,
         [COL]: html,
         [ROW]: html,
         [CARD]: html.filter(field => !['collapsed', 'label'].includes(field)),
         [BUTTON]: button,
         [MARKDOWN]: markdown,
      }[this.#connected_element.element.split('.')[0]] || [];
   }
}