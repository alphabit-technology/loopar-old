import {elements} from "/components/elements.js";
import {http} from "/utils/http.js";
import {BaseInput} from "/components/base/base-input.js";
import {loopar} from "/loopar.js";

export class Select extends BaseInput {
   #model = null;
   filtered_options = [];
   opened = false;
   internal_click = false;
   position_setted = false;

   constructor(props) {
      super(props);

      this.make();
   }

   make() {
      super.make();

      this.add_class("form-group select-2 select-closed");

      this.input.add_class('select2-hidden-accessible');
      this.label.add_class('control-label');
      this.selector = this.input;

      this.input_search = elements({
         props: {
            class: 'select2-search__field'
         }
      }).tag('input');

      this.result_options = elements({
         props: {
            class: 'select2-results__options'
         },
         content: [
            elements({
               props: {
                  class: 'select2-results__option select2-results__message',
               },
               content: 'Please enter 1 or more characters'
            }).tag('li')
         ]
      }).tag('ul');

      this.selection_area = elements({
         props: {
            class: 'select2-selection__rendered', role: 'textbox', 'aria-readonly': true
         }
      }).tag('span');

      this.result_area = elements({
         wrapper: this,
         props: {
            class: 'select2 select2-container select2-container--default select2-container--below',
            style: 'width: 100%;'
         },
         content: {
            selection: elements({
               props: {
                  class: 'selection'
               },
               content: elements({
                  props: {
                     class: "select2-selection select2-selection--single",
                     role: 'combobox', 'aria-haspopup': true, 'aria-expanded': false, 'aria-disabled': false,
                     'aria-labelledby': 'select2-select2-data-remote-container'
                  },
                  content: {
                     selection_area: this.selection_area,
                     arrow: elements({
                        props: {
                           class: 'select2-selection__arrow',
                           role: 'presentation'
                        },
                        content: '<b role="presentation"></b>'
                     }).tag('span')
                  }
               }).tag('span')
            }).tag('span'),
            dropdown: elements({
               props: {
                  class: 'dropdown-wrapper',
                  'aria-hidden': true
               }
            }).tag('span'),
            virtual_select: elements({
               props: {
                  class: 'select2-container select2-container--default select2-container--open select-loaded',
                  style: 'position: relative;left: 0;width: 100%;'
               },
               content: elements({
                  props: {
                     class: 'select2-dropdown select2-dropdown--below',
                     style: 'width: 100%;'
                  },
                  content: {
                     search: elements({
                        props: {
                           class: 'select2-search select2-search--dropdown'
                        },
                        content: this.input_search
                     }).tag('span'),
                     result: elements({
                        props: {
                           class: 'select2-results'
                        },
                        content: {
                           ul: this.result_options
                        }
                     }).tag('span')
                  }
               }).tag('span').on('mouseleave')
            }).tag('span')
         }
      }).tag('span');

      this.make_events();

      this.data.selected && (this.default_selected = this.data.selected);

      this.title_fields = "value";
   }

   make_events() {
      this.result_area.selection.on('click', () => {
         this.toggle_close();
      });

      this.result_area.selection.on('mouseleave', () => {
         this.internal_click = false;
      }).on('mouseenter', () => {
         this.internal_click = true;
      });

      this.result_area.virtual_select.on('mouseleave', () => {
         this.internal_click = false;
      }).on('mouseenter', () => {
         this.internal_click = true;
      });

      this.input_search.on('keyup', () => {
         this.#search();
      });
   }

   toggle_close() {
      this.opened ? this.close() : this.open();
   }

   open() {
      this.position_setted = false;
      if (this.opened) return;
      this.opened = true;

      this.result_area.add_class('select2-container--focus select2-container--open');
      this.remove_class('select-closed').add_class('select-opened');

      this.input_search.focus();
      this.#search();

      loopar.ui.current_select = this;
      this.set_position();
   }

   close() {
      this.opened = false;
      this.result_area.remove_class('select2-container--focus select2-container--open');
      this.remove_class('select-opened').add_class('select-closed');
   }

   #search() {
      if (this.is_local) {
         const q = this.input_search.val().toLowerCase();

         this.filtered_options = this.options.filter(row => {
            return (typeof row == "object" ? (`${row.option} ${row.value}`) : row).toLowerCase().includes(q);
         }).map(row => {
            return typeof row == "object" ? row : {name: row, value: row}
         });

         this.render_result();
      } else {
         this.#model = this.options[0];
         this.get_server_data();
      }
   }

   get is_local() {
      return this.options.length > 1;
   }

   get model() {
      return (this.#model.option || this.#model.name);
   }

   get options() {
      const opts = (this.data.options || "");
      return typeof opts == 'object' && Array.isArray(opts) ? opts :
         opts.split(/\r?\n/).map(item => ({option: item, value: item}));
   }

   get_server_data() {
      http.send({
         action: `/api/${this.model}/search`,
         params: {q: this.input_search.val() || ''},
         success: r => {

            this.title_fields = r.title_fields;
            this.filtered_options = r.rows;
            this.render_result();
         },
         error: r => {
            console.log(r);
         }
      });
   }

   render_result() {
      const template = (row) => {
         return elements({
            props: {
               class: 'select2-results__option select2-results__option--highlighted',
               role: 'option', 'area-selected': false
            },
            content: `
                <div class="media">
                    <div class="media-body">
                        <h6 class="my-0">${this.option_value(row).value}</h6>
                        <ul class="list-inline small text-muted">
                            <li class="list-inline-item">
                                <i class="fa fa-flash"></i>
                                ${this.option_value(row).option}
                            </li>
                        </ul>
                    </div>
                </div>
                `
         }).tag('li').on('click', () => {
            this.set_option_select(row);
         });
      }

      this.result_options.empty();

      this.filtered_options.forEach(row => {
         this.result_options.append(template(row), false, false);
      });
   }

   option_value(option = this.current_selection) {
      const value = (data) => {
         if(data && typeof data == 'object') {
            if(Array.isArray(this.title_fields)) {
               const values = this.title_fields.map(item => data[item]);

               return values.reduce((a, b) => {
                  return [...a, [...a.map(item => item.toLowerCase())].includes(b.toLowerCase()) ? '' : b];
               }, []).join(" ");
            } else {
               return data[this.title_fields];
            }
         }
      }

      return option && typeof option == "object" ? {
         option: option.option || option.name,
         value: value(option),//option[this.title_fields] || option.value || option.option
      } : {option: option || this.assigned_value, value: option || this.assigned_value};
   }

   set_option_select(row) {
      this.close();
      this.assigned_value = row;
      this.render_value();
   }

   render_value(trigger_change = true) {
      this.selection_area.empty().append_content(
         `</div>${this.option_value().value || ""}</div>`
      );

      if (trigger_change) this.trigger('change');
   }

   /**
    *
    * @param {string || object} val
    * @param {boolean} trigger_change
    * @returns
    */
   val(val = null, {trigger_change = true} = {}) {
      if (val != null) {
         if (val === "") val = this.default_selected;
         this.assigned_value = val;
         this.render_value(trigger_change);
         return this;
      } else {
         return this.option_value().option
      }
   }

   get current_selection() {
      return Object.keys(this.filtered_options) > 0 ?
         this.filtered_options.filter(item => this.option_value(item).option === this.option_value(this.assigned_value).option)[0]
         : this.assigned_value;
   }

   set_position() {
      const getPosition = (el) => {
         let yPos = 0;

         while (el) {
            yPos += (el.offsetTop - el.scrollTop + el.clientTop);
            el = el.offsetParent;
         }

         return yPos;
      }

      const selector_parent = this.result_area.virtual_select;
      const selector = selector_parent.content;
      const position = getPosition(this.obj);
      const windowHalf = window.innerHeight / 2;

      if (position > windowHalf) {
         this.result_area.remove_class('select2-container--below', true).add_class('select2-container--above');
         selector.remove_class('select2-dropdown--below', true).add_class('select2-dropdown--above');
         selector_parent.css({top: '-280px'});
         this.result_options.css({height: '200px'});
      } else {
         this.result_area.remove_class('select2-container--above', true).add_class('select2-container--below')
         selector.remove_class('select2-dropdown--above', true).add_class('select2-dropdown--below');
         selector_parent.css({top: '0'});
      }

      this.position_setted = true;
   }

   validate() {
      const validate = super.validate();

      if (!validate.valid) {
         this.selector.remove_class('is-invalid');
      } else {
         this.selector.add_class('is-invalid');
      }

      return validate;
   }

   set_size(size='md') {
      this.input_search.remove_class(`form-control-${this.data.size}`).add_class(`form-control-${size}`);
      this.data.size = size;

      return this;
   }

   invalid_status() {
      this.result_area.selection.content.add_class('is-invalid');
   }

   valid_status() {
      this.result_area.selection.content.remove_class('is-invalid');
   }
}

export const select = (options) => {
   return new Select(options);
}

document.addEventListener('click', () => {
   const current_select = loopar.ui.current_select;

   current_select && !current_select.internal_click && current_select.opened && current_select.close();
}, true);

/*(function () {
   document.onmousemove = handleMouseMove;

   function handleMouseMove() {
      const current_select = loopar.ui.current_select;
      //current_select && !current_select.opened && !current_select.position_setted && current_select.set_position();
   }
})();*/