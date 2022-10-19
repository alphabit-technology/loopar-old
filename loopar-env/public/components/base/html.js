import {BaseHtml} from "/components/base/base-html.js";
import {elements} from "/components/elements.js";
import {object_manage} from "/utils/object-manage.js";
import {value_is_true} from "/utils/helper.js";
import {loopar} from "/loopar.js";
import {data_interface} from "/element-definition.js";
import {element_title} from "./element-title.js";

export class HTML extends BaseHtml {
   last_class = "";
   constructor(options) {
      super(options);
      if (this.has_title) element_title(this);
   }

   field_data() {
      const data = [];

      object_manage.in_object(this.elements, el => {
         if (el.element) {
            data.push({
               element: el.element,
               is_writeable: el.is_writeable || false,
               elements: el.field_data ? el.field_data() : [],
               content: typeof el.content === "string" ? el.content : "",
               data: el.data || {},
            });
         }
      });

      return data;
   }

   field_values() {
      const data = {};

      object_manage.in_object(this.child_elements(), el => {
         if (el.element && el.element !== TABLE) data[el.data.name] = el.val();
      });

      return data;
   }

   child_elements() {
      const elements = {};

      object_manage.in_object(this.elements, el => {
         if (el.data.name !== 'doc_designer') {
            if (el.is_writeable) {
               elements[el.identifier] = el;
            }
            if (el.element !== TABLE) Object.assign(elements, el.child_elements());
         }
      });

      return elements;
   }

   label(options) {
      return this.tag("label", options);
   }

   tag(tag_name) {
      this.tag_name = tag_name;
      this.render();

      return this;
   }

   render() {
      super.render();
   }

   get focus_actions() {
      this.on("mouseover", (obj) => {
         obj.toggle_common('element', 'hover');
      }).on("mouseout", (obj) => {
         obj.remove_class('hover');
      });

      return this;
   }

   make_element(props) {
      return elements(object_manage.assign(props, this));
   }

   set_data(data) {
      this.last_class = clone(this.data.class);
      //this.data = {};

      object_manage.in_object(data, (obj, field) => {
         const val = obj.val();

         if (typeof val != "undefined") {
            if ( this.element === BUTTON) {
               if (field === "type") this.set_type(val);
               if (field === "size") this.set_size(val);
            }

            if ( this.group_element === INPUT && this.set_size) {
               if (field === "size") this.set_size(val);
            }

            this.data[field] = val;

            if (field === 'label') {
               if (this.label && this.label.val) this.label.val(val, {event_change: false});

               if (this.element === CARD) {
                  this.title.val(val, {event_change: false});
               }
            }

            if (field === 'name') {
               if (this.label && this.label.prop) this.label.prop("for", val);
               if (this.input && this.input.prop) this.input.prop({
                  name: val,
                  id: val
               });
            }

            if (field === 'default_value') {
               //this.val(val, false);
            }

            if (obj.data.name === "format" && this.element === "input") {
               this.input.val("", {event_change: false});
               this.filter_value();
            }
         }
      });

      this.apply_properties();
   }

   apply_properties() {
      const data = clone(this.data);
      let classes = this.props.class || "";
      let styles = this.props.style || "";

      if (data) {
         if (!this.designer && value_is_true(data.hidden)) this.hide();
         //if (this.designer && value_is_true(data.droppable)) this.droppable().droppable_actions();
         //if (this.designer && value_is_true(data.draggable)) this.draggable().draggable_actions();

         if (data.class) classes += " " + data.class;
         if (data.style) styles += " " + data.style;

         if (data.action && data.action.split("/").length > 1) {
            this.on('click', (obj, event) => {
               event.preventDefault();
               loopar.route = data.action;
            });
         }

         if (data.size) {
            if ( this.group_element === INPUT && this.set_size) {
               this.set_size(data.size);
            }
            /*if ([INPUT, DATE, DATE_TIME].includes(this.element)) {
               this.set_size(data.size);
               //this.input.reset_classes().add_class("form-control-" + data.size);
            }
            if ([SELECT].includes(this.element)) {
               //this.input_search.reset_classes().add_class("form-control-" + data.size);
            }*/
         }

         setTimeout(() => {
            if (!this.designer && data.set_only_time && this.val().length > 0) {
               this.disable();
            }
         }, 0);
      }

      if (classes.length > 0) this.reset_classes().add_class(classes);
      //if (styles.length > 0) this.reset_styles().css(styles);
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

   validate() {
      return data_interface(this).validate();
   }
}