import {debug_name} from "/utils/helper.js";
import {object_manage} from "/utils/object-manage.js";
import {element_manage} from "/components/element-manage.js";
import {DragAndDropUtils} from "/utils/drag-and-drop.js";
import {loopar} from "/loopar.js";

export class BaseHtml {
   #obj = null;
   #disabled = false;
   #cursor_position = 0;
   #click_attempts = 0;
   #confirming = false;
   #jshtml_identifier = 'jstmlefc65a6efc9cb8afbc85';
   _listeners = {};
   listeners = null;
   content = "";
   #draggable = null;
   #droppable = null;
   typeof = "JSHtml";
   parent = null;
   #identifier = this.uuid();
   legacy_name = false;
   from_html = false;
   props = {};
   rendered = false;
   elements = {};
   element = null;
   original_class = [];
   original_style = "";
   #container = null;

   constructor(options = {}) {
      this.data = this.data || {};
      this.listeners = this.listeners || {};

      Object.assign(this, options);

      if (this.obj) {
         this.from_html = true;
         this.identifier = debug_name(this.obj.getAttribute('element')) || this.identifier;
         this.props['class'] = this.obj.classList.value;

         if (this.obj.getAttribute('href')) {
            this.listeners['click'] = (obj, event) => {
               event.preventDefault();
               loopar.click_event(event);
               return;
            }
         }
      } else if (options && options.element) {
         this.element = options.element;
         const element_name = element_manage.element_name(this.element);
         this.identifier = this.data.name || element_name.id
      }

      if (this.listeners != null) {
         object_manage.in_object(this.listeners, (listen, listen_name) => {
            this.set_listener(listen_name, listen);
         });
      }

      if (this.tag_name && typeof options.obj === "undefined") {
         this._make();
      }

      this.make_var_or_const();

      if (this.props && this.props.class) this.original_class = this.props.class.split(" ");
      if (this.props && this.props.style) this.original_style = this.props.style;

      return this;
   }

   make_var_or_const() {
      if (!this.designer) {
         const core = this.obj ? this.obj.hasAttribute('core') : false;
         const inside_of = this.context || loopar; //create inside this element

         if (inside_of) {
            if (core) {
               if(!inside_of[this.identifier]) {
                  Object.defineProperty(inside_of, this.identifier, {
                     get: () => {
                        return this;
                     },
                     set: () => {
                        throw (this.identifier + ' is a Safe CONST and cannot be redeclared.');
                     }
                  });
               }
            } else {
               inside_of[this.identifier] = this;
            }
         }

         /*if(inside_of && !inside_of[this.identifier]){
             Object.defineProperty(inside_of, this.identifier, {
                 get: () => {
                     return this;
                 },
                 set: () => {
                    throw (this.identifier + ' is a Safe CONST and cannot be redeclared.');
                 }
             });
         }*/
      }
   }

   get identifier() {
      return this.#identifier
   }

   set identifier(identifier) {
      this.#identifier = identifier || this.uuid();
      this.data.name = this.data.name || identifier;
      this.data.id = this.data.id || identifier;

      this.prop('element', identifier);
   }

   reload_options() {
      this.fusion_props();
   }

   drop(element, event) {
      event.preventDefault();
      element.remove_class("over-drag");

      const elementToCreate = DragAndDropUtils.elementToCreate;
      const elementToDrag = DragAndDropUtils.elementToDrag;

      if (elementToCreate) {
         elementToCreate.parentWrapper = this._owner.parentWrapper;
         elementToCreate.is_element = true;
         element.set_dropped_element(elementToCreate);
      } else {
         if (elementToDrag) {
            if (elementToDrag.parentOf(element) || element === elementToDrag) {

            } else {
               element.set_dropped_element(elementToDrag);
            }
         }
      }
   }

   draggable(draggable = true) {
      this.#draggable = draggable;

      if (draggable) {
         this.attr("draggable", true);
         this.add_class("draggable");
      } else {
         this.remove_attr("draggable");
         this.remove_class("draggable");
      }

      return this;
   }

   draggable_actions() {
      this.over_animations();

      this.on("dragstart", (obj, event) => {
         event.stopPropagation();

         this.add_class("on-drag");

         DragAndDropUtils.elementToDrag = obj;
      });

      this.on("dragenter", (obj, event) => {
         event.stopPropagation();

         this.apply_event_drag_end();
      });

      this.container.on(["dragend"], (obj, event) => {
         event.stopPropagation();
         event.stopPropagation();

         this.remove_class("on-drag");
      });

      /*All draggable elements can receive before or after other elements*/
      /*this.on(["dragleave"], (obj, event) => {
          event.preventDefault();
          event.stopPropagation();

          this.apply_event_drag_end();
      });*/

      return this;
   }

   droppable(droppable = true) {
      this.#droppable = droppable;
      if (this.#droppable) {
         this.container.attr("droppable", true);
         this.container.add_class("droppable");
      } else {
         this.container.remove_attr("droppable");
         this.container.remove_class("droppable");
      }

      return this;
   }

   over_animations() {
      this.on("mouseover", (obj) => {
         obj.toggle_common('element', 'hover');
      }).on("mouseout", (obj) => {
         obj.remove_class('hover');
      });

      return this;
   }

   apply_event_drag_end() {
      if (DragAndDropUtils.lastElementTargetSibling) {
         if (DragAndDropUtils.currentElementTargetSibling.identifier !== this.identifier) {

            DragAndDropUtils.lastElementTargetSibling = DragAndDropUtils.currentElementTargetSibling;
         }
      } else {
         DragAndDropUtils.lastElementTargetSibling = this;
      }

      DragAndDropUtils.currentElementTargetSibling = this;
   }

   droppable_actions() {
      this.on(["dragover"], (obj, event) => {
         event.preventDefault();

         this.container.add_class("over-drag");
      });

      this.on("drop", (obj, event) => {
         event.stopPropagation();

         this.container.drop(obj, event);
         this.container.remove_class("over-drag");
      });

      this.on(["dragleave"], (obj, event) => {
         event.preventDefault();

         this.container.remove_class('over-drag');
      });

      /*All droppable elements can receive before or after other elements*/
      this.on("dragenter", (obj, event) => {
         event.stopPropagation();

         this.apply_event_drag_end();
      });

      return this;
   }

   im_container(parent) {
      if (parent) parent.container = this;
      return this;
   }

   get container() {
      return (this.#container && this.#container.obj) ? this.#container : this;
   }

   get _owner() {
      return this.owner || this;
   }

   set container(container) {
      this.#container = container;
      container.owner = this;
   }

   get is_droppable() {
      return this.#droppable;
   }

   get is_draggable() {
      return this.#draggable;
   }

   dynamic_attr(attr) {
      let at = this['#' + attr];
      return typeof at == "undefined" && at === true;
   }

   is_JSHtml(element) {
      return typeof element == "object" && element.typeof === "JSHtml";
   }

   parentOf(child) {
      let testChild = this.is_JSHtml(child) ? child.obj : child;
      while ((testChild = testChild.parentNode) && testChild !== this.obj) ;
      return !!testChild;
   }

   remove_attr(attr) {
      this.#obj.removeAttribute(attr);
      delete this.props[attr];
      return this;
   }

   set obj(obj) {
      if (this.obj == null) this.#obj = obj;
   }

   get obj() {
      return this.#obj
   }

   get disabled() {
      return this.#disabled
   }

   get cursor_position() {
      return this.#cursor_position
   }

   get click_attempts() {
      return this.#click_attempts
   }

   get confirming() {
      return this.#confirming
   }

   get jshtml_identifier() {
      return this.#jshtml_identifier
   }

   get float_val() {
      return isNaN(parseFloat(this.val())) ? 0.0 : parseFloat(this.val())
   }

   get int_val() {
      return parseInt(isNaN(this.val()) ? 0 : this.val())
   }

   fusion_props() {
      if (this.#droppable) {
         this.props.class += " droppable";
      }

      if (this.#draggable) {
         this.props.class += " draggable";
      }
   }

   make_attributes() {
      if (this.obj) {
         this.make_listener();
         this.set_attributes();
      }
   }

   render() {
      this.fusion_props();
      this.make_dom();
      this.set_wrapper();
      this.render_content(this.content);
      this.set_attributes();

      return this;
   }

   update_props(options) {
      Object.assign(this, object_manage.assign(this, options));
   }

   set_attributes() {
      object_manage.in_object(this.props || {}, (value, attr_name) => {
         if (this.obj) {
            this.#obj.setAttribute(attr_name, value);
         }
      });
   }

   toggle_common(base_class, toggle_class) {
      this.add_class(toggle_class).siblings(base_class, toggle_class);//.removeClass(toggle_class);
      return this;
   }

   siblings(base_class, toggle_class) {
      /*let items = document.querySelectorAll(`.${base_class}.${toggle_class}`);

      items.forEach(item => {
          let jsHtmlObj = window[debug_name(item.getAttribute('element'))];

          if(jsHtmlObj){
              if(jsHtmlObj.identifier !== this.identifier){
                  jsHtmlObj.remove_class(toggle_class);
              }
          }else{
              item.classList.remove(toggle_class);
          }
      });*/
   }

   on(listener, fn, method = null, callBack = null) {
      if (typeof listener == "object") {
         listener.forEach(listen => {
            this.set_listener(listen, fn, method, callBack);
         });
      } else {
         this.set_listener(listener, fn, method, callBack);
      }

      return this;
   }

   has_listener(listen, f) {
      let exist = false;
      object_manage.in_object(this._listeners[listen], ef => {
         if (f === ef.listen) exist = true;
      });

      return exist;
   }

   make_listener() {
      if (this.obj == null) return;

      object_manage.in_object(this._listeners, (listen_group, listen_name) => {
         object_manage.in_object(listen_group, listen => {
            this.set_listen(listen_name, listen);
         });
      });

      return this;
   }

   reset_listeners(from = "") {
      object_manage.in_object(this._listeners, listen_group => {
         object_manage.in_object(listen_group, listen => {
            listen.options.added = false;
         });
      });

      return this;
   }

   set_listen(listen_name, listen) {
      if (!listen.options.added) {
         let self = this;

         listen.options.added = true;
         if (typeof listen.listen === 'function') {
            (this.ref ? this.ref : this).#obj.addEventListener(listen_name, (event) => {
               event.stopPropagation();
               //event.preventDefault();
               if (this.is_disabled) return;

               if (listen.options.method != null && listen.options.method === "double_click") {
                  if (this.click_attempts === 0) {
                     this.#confirming = true;
                     if (typeof this.text != "undefined" && this.text.length > 0) {
                        this.val(__("Confirm"));
                     }
                     this.#click_attempts = 1;
                     this.add_class(`${this.jshtml_identifier}-confirm`).delay(5000).then(() => {
                        if (this.confirming) {
                           this.reset_confirm();
                        }
                     });
                  } else {
                     this.reset_confirm();
                     listen.listen(self, event);
                  }
               } else {
                  listen.listen(self, event);
               }
            });
         }
      }
   }

   delay(delay) {
      return new Promise((resolve) => {
         setTimeout(() => {
            resolve();
         }, delay);
      });
   }

   set_listener(listen_name, fn, method = null, callBack) {
      const listen = {listen: fn, options: {added: false, method: method, callBack: callBack}};

      if (typeof this._listeners[listen_name] == "object") {
         this._listeners[listen_name].push(listen);
      } else {
         this._listeners[listen_name] = [listen];
      }

      this.make_attributes();
   }

   set_content(content) {
      this.content = content;
      this.val("");
      return this;
   }

   make_dom() {
      if (!this.obj) {
         this.#obj = document.createElement(this.tag_name ? this.tag_name : "div");
         //this.attr('element', this.identifier);
      }

      this.obj.removeAttribute('element')

      this.default_listeners();
   }

   remove_wrapper() {
      if (this.wrapper) {
         if (this.wrapper.elements[this.identifier]) {
            delete this.wrapper.elements[this.identifier]
         }
      }
   }

   set_element(element) {
      this.elements[element.identifier] = element;
      element.wrapper = this;
   }

   _make() {
      this.obj ? this.set_attributes() : this.render();
   }

   set_wrapper(wrapper = null) {
      if ((typeof this.wrapper != "undefined" && this.wrapper != null) || wrapper) {
         (wrapper || this.wrapper).container.obj.appendChild(this.#obj);
         this.make_attributes();

         (wrapper || this.wrapper).set_element(this);
      }
   }

   get i_like_owner() {
      if (this.decorator) {
         return this.wrapper ? this.wrapper.i_like_owner : this;
      } else {
         return this;
      }
   }

   render_content(content = null, identifier = null) {
      if (object_manage.is_obj(content)) {
         if (Array.isArray(content)) {
            content.forEach((e) => {
               this.render_content(e, null, true);
            });
         } else if (content.typeof === "JSHtml") {
            content.decorator = content.decorator || true;
            if (identifier) {
               content.identifier = identifier;
               this.i_like_owner[identifier] = content;

               if (identifier === this.ref) {
                  this.ref = content;
               }
            }

            if (content.set_wrapper) content.set_wrapper(this);

            if (content.render) content.render();
         } else if (typeof content == 'function') {
            this.render_content(content());
         } else {
            object_manage.in_object(content, (el, identifier) => {
               if (!['listeners'].includes(identifier)) {
                  this.render_content(el, identifier, (el && typeof el == "object") ? el.decorator : true);
               }
            });
         }
      } else {
         this.rendered = true;
         const current_content = this.#obj.innerHTML;
         if (current_content !== content) {
            if (this.input && this.input.typeof === "JSHtml") {
               this.val(content);
            } else {
               this.#obj.insertAdjacentHTML('beforeend', content);

               loopar.make_html_elements(this.#obj, this);
            }
         }
      }
   }

   render_children(children) {
      if (typeof children == "object") {
         if (children.typeof === "JSHtml") {
            this.append(children);
         } else {
            object_manage.in_object(children, child => {
               this.render_children(child);
            });
         }
      } else {
         this.#obj.innerHTML += children;
      }
   }

   merge_options(options) {
      Object.assign(this, object_manage.assign(this, options));
   }

   html() {
      return this.#obj;
   }

   reset_confirm() {
      this.#confirming = false;
      this.#click_attempts = 0;
      this.remove_class(`${this.jshtml_identifier}-confirm`);
      this.val(this.text);

      return this;
   }

   prepend(obj, is_child_element = true, rewrite) {
      if (is_child_element && obj.remove_wrapper) obj.remove_wrapper();
      if (rewrite) this.container.empty();
      this.container.obj.prepend(obj.obj);
      if (is_child_element) this._owner.set_element(obj);

      return this;
   }

   is_child_element(obj) {
      return this.obj === obj.obj.parentNode;
   }

   /*
     * @move_element Object - element to move
     * @target_element Object - sibling element to moved_element
     * @direction String - "up" or "down"
   * */
   sort_elements(moved_element, target_element, direction) {
      const identifiers = Object.keys(this.elements);

      const target_index = identifiers.includes(target_element.identifier) ?
         identifiers.findIndex(identifier => identifier === target_element.identifier) :
         identifiers.length;

      const position_index = (target_index + (direction === UP ? 0 : 1));

      identifiers.splice(position_index < 0 ? 0 : position_index, 0, moved_element.identifier);

      this.elements = identifiers.reduce((acc, identifier) => {
         acc[identifier] = (identifier === moved_element.identifier ? moved_element : this.elements[identifier]);
         return acc;
      }, {});
   }

   append(obj, is_child_element = true, rewrite, is_dragged = false) {
      if (is_child_element && obj.remove_wrapper) obj.remove_wrapper();
      const lastElementTargetSibling = DragAndDropUtils.lastElementTargetSibling

      if (rewrite) this.container.empty();

      /*TODO invert logical of is_child_element*/
      if (lastElementTargetSibling && this.container.is_child_element(lastElementTargetSibling)) {
         if (vertical_direction === DOWN) {
            insertAfter(obj.obj, lastElementTargetSibling.obj);
         } else {
            this.container.obj.insertBefore(obj.obj, lastElementTargetSibling.obj);
         }

         function insertAfter(newElement, referenceElement) {
            referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
         }
      } else {
         if(obj.wrapper_is_super_parent) {
            this.obj.appendChild(obj.obj);
         }else {
            this.container.obj.appendChild(obj.obj);
            this._owner.set_element(obj);
         }
      }

      if (is_child_element) {
         if (is_dragged && lastElementTargetSibling) {
            this._owner.sort_elements(obj, lastElementTargetSibling, vertical_direction, is_dragged);
         }
         obj.wrapper = this;
      }

      return this;
   }

   set_dropped_element(element) {
      this.append(element, true, false, true);
   }

   set_selection() {
      this.#cursor_position = this.obj.selectionStart;
   }

   default_listeners() {
      /*if (this.tag_name === "input") {
          this.on(["click", "onkeydown", "onkeypress"], () => {
              this.set_selection();
          });
      }*/
      /*this.on(["click"], () => {
          //if(!design)
          //console.log("Ready to Open");
          //this.set_selection();
      });*/

      //this.set_listener();

      //this.make_listener()
   }

   name() {
      return this.get_attr("name");
   }

   get_attr(attr = "") {
      return this.obj.getAttribute(attr);
   }

   has_attr(attr) {
      return this.obj.hasAttribute(attr);
   }

   enable(on_enable = true) {
      this.#disabled = false;
      if (on_enable) {
         this.remove_attr("disabled");
      }
      this.remove_class(this.jshtml_identifier);

      return this;
   }

   disable(on_disable = true) {
      this.#disabled = true;
      if (on_disable) {
         this.prop("disabled", true);
      }
      this.add_class(this.jshtml_identifier);
      return this;
   }

   css(props = "", val = "") {
      if (this.#obj && props) {
         if (typeof props == "object") {
            object_manage.in_object(props, (value, prop) => {
               this.css(prop, value);
            });
         } else {
            props = props.replace(/ /g, "");
            val = val.replace(/ /g, "");

            if (props.split(":").length > 1) {
               props.split(";").forEach(prop => {
                  this.css(...prop.split(":"));
               });
            } else {
               this.props.style += `;${props}:${val};`
               this.#obj.style[props] = val;
            }
         }
      }

      return this;
   }

   attr(attr = null, value = "") {
      if (value === "") {
         return this.#obj.getAttribute(attr);
      } else {
         if (typeof attr == "object") {
            object_manage.in_object(attr, a => {
               this.attr(a);
            });
         } else {
            const attrs = attr.split(" ");
            if (attrs.length > 1) {
               this.attr(attrs);
            } else {
               this['props'][attr] = value;
            }
         }

         this.set_attributes();
         return this;
      }
   }

   add_class(class_name) {
      if (typeof class_name == "object") {
         object_manage.in_object(class_name, c => {
            this.add_class(c);
         });
      } else {
         class_name.toString().split(" ").forEach(c => {
            const classes = `${this.props.class || ""} ${c}`;
            this.props.class = [...new Set(classes.split(" "))].join(" ");// `${this.props.class || ""} ${c}`;
         });
      }

      this.set_classes();
      return this;
   }

   set_classes() {
      object_manage.in_object((this.props.class || "").split(" "), c => {
         const _c = c.replace(/ /g, "");
         if (this.obj && _c !== "undefined" && _c.length > 0) {
            this.#obj.classList.add(_c);
         }
      });
   }

   has_class(class_name) {
      return this.obj && this.obj.classList.contains(class_name);
   }

   has_classes(classes) {
      let has_class = false;
      object_manage.in_object(classes, (c) => {
         if (this.has_class(c)) has_class = true;
      });

      return has_class;
   }

   remove_class(class_name, every = false) {
      if (typeof class_name == "object") {
         object_manage.in_object(class_name, c => {
            this.remove_class(c);
         });
      } else if (typeof class_name == "string" && class_name.length > 0) {
         class_name.toString().split(' ').forEach(c => {
            if (!this.original_class.includes(c) || every) {
               this.#obj.classList.remove(c);
               this.props.class = this.obj.classList.value;
            }
         });
      }
      return this;
   }

   reset_classes() {
      this.obj.className = '';
      this.props.class = '';
      this.add_class(this.original_class);

      return this;
   }

   reset_styles() {
      this.obj.style = '';
      this.css(this.original_style);

      return this;
   }

   get is_disabled() {
      return this.disabled;
   }

   /*delete_selection(value, move_position = 1) {
      let current_value = this.val();
      let current_selection = window.getSelection().toString();

      this.#cursor_position = current_value.search(current_selection) + move_position;

      this.val(current_value.replace(current_selection, value));
   }

   has_selection() {
      return window.window.getSelection().toString().length;
   }*/

   /*write(value) {
      if (this.is_disabled) return;

      let current_value = this.val();

      if (this.has_selection()) {
         this.delete_selection(value);
         return;
      }

      let left_value = current_value.substring(0, this.cursor_position);
      let right_value = current_value.substring(this.cursor_position, current_value.length);

      this.val(left_value + value + right_value);

      this.#cursor_position++;
      this.trigger("change");
   }*/

   plus(value = 1) {
      this.val(this.float_val + value);
      this.focus();

      return this;
   }

   minus(value = 1) {
      this.val(this.float_val - value);
      this.focus();

      return this;
   }
   val(val = null, {event_change = true, focus = false} = {}) {
      if (val == null) {
         if (['input', 'textarea'].includes(this.props.type) || ['input', 'textarea'].includes(this.tag_name)) {
            return this.#obj.value;
         } else {
            return this.#obj.innerText;
         }
      } else {
         if (typeof this.text != "undefined" && !this.confirming) this.text = val;
         if (['input', 'textarea'].includes(this.props.type) || ['input', 'textarea'].includes(this.tag_name)) {
            this.#obj.value = val;
         } else {
            this.empty().render_content(val);
         }
         if (event_change) this.trigger("change", {focus});

         return this;
      }
   }

   prepend_content(content, context = null) {
      this.#obj.innerHTML = content + this.#obj.innerHTML;
      element_manage.make_html_elements(this.obj, context);
      return this;
   }

   append_content(content, context = null) {
      this.#obj.innerHTML += content;
      element_manage.make_html_elements(this.obj, context);
      return this;
   }

   empty() {
      this.#obj.innerHTML = "";
      return this;
   }

   destroy() {
      this.#obj = null;
   }

   remove() {
      this.remove_wrapper();
      this.#obj.remove();
   }

   hide() {
      this.add_class("hide");
      this.css("display", 'none');
      return this;
   }

   show() {
      this.remove_class("hide");
      this.css("display", '');
      return this;
   }

   prop(prop, value = null) {
      if (typeof prop == "object") {
         object_manage.in_object(prop, (value, key) => {
            this.prop(key, value);
         });
      } else if (value === null) {
         return this.obj ? this.obj.getAttribute(prop) : null;
      } else {
         if (prop === "disabled") {
            if (value) {
               this.disable(false);
            } else {
               this.enable(false);
            }
         }

         if (this.obj) this.#obj.setAttribute(prop, value);
      }

      return this
   }

   /*check_changes(last_val) {
      let save_cursor_position = this.cursor_position;
      if (this.val() !== last_val) {
         this.trigger("change");
      }

      this.#cursor_position = save_cursor_position;
      this.focus();
   }

   delete_value() {
      if (this.is_disabled) return;
      let current_value = this.val();

      if (this.has_selection()) {
         this.delete_selection("", 0);
         return;
      }

      let left_value = current_value.substring(0, this.cursor_position);
      let right_value = current_value.substring(this.cursor_position, current_value.length);
      let new_value;

      if (this.cursor_position === this.val().length) {
         new_value = left_value.substring(0, this.val().length - 1);
         this.#cursor_position--;
      } else {
         new_value = left_value.substring(0, this.cursor_position - 1) + right_value;
         this.#cursor_position--;
      }

      this.val(new_value);
   }*/

   trigger(listen, {event, focus=false} = {}) {
      if (this._listeners[listen]) this._listeners[listen].forEach(listen => listen.listen(this, event));

      if(focus) this.focus();

      return this;
   }

   focus() {
      this.#cursor_position = this.cursor_position < 0 ? 0 : this.cursor_position;
      if (this.obj) {
         this.obj.focus({preventScroll: true});
      }
   };

   /*setInputFilter(inputFilter) {
      ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach((event) => {
         this.obj.addEventListener(event, function () {
            if (inputFilter(this.value)) {
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
   }*/

   /*props_by_json(props = {}) {
      let _html = "";
      for (let prop in props) {
         if (!props.hasOwnProperty(prop)) continue;
         _html += `${prop}='${props[prop]}'`;
      }
      return _html;
   }*/

   uuid() {
      return "el" + Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
   }
}

const jshtml = (options) => {
   return new JSHtml(options)
}

var $$ = (selector) => {
   let obj = document.querySelector(selector);
   if (obj) {
      return new JSHtml({
         obj: obj
      });
   }
   return null;
}

