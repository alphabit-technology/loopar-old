import {loopar} from "/loopar.js";
import {Capitalize} from '/utils/helper.js';
import {elements} from "/components/elements.js";
import {object_manage} from "/utils/object-manage.js";
import {element_definition} from "/element-definition.js";
import {HTML} from "./base/html.js";

export default class ElementManage {
   initialized = false;
   constructor() { }

   initialize() {
      return new Promise(resolve => {
         document.docReady(() => {
            this.make_html_elements();

            this.initialized = true;
            resolve();
         });
      });
   }

   make_html_elements(base = document, context = null) {
      base.querySelectorAll("[element]").forEach(el => {
         new HTML({obj: el, from_html: true, context: context});
      });
   }

   render_element(element, wrapper, designer = false, parent) {
      if (element.element) {
         element.designer = designer;

         Object.assign(element, {props: element.props || {}}, {wrapper: wrapper, title: element.element});

         const sub_elements = element.elements;
         element.elements = [];

         /*** */
         if (designer) {
            element.props.class = element.props.class || "";
            element.props.class += " element";
            element.has_title = true;

            if (parent) {
               element.parentWrapper = parent;
            }
         }
         /** */

         const el = (elements)(element)[element.element.split('.')[0]]();

         if (el) {
            if (sub_elements) object_manage.in_object(sub_elements, e => {
               this.render_element(e, el, designer, parent);
            });

            el.apply_properties();

            /** */
            if (designer) {
               element_definition[element.element].props.forEach((prop) => {
                  el[prop]();
               });

               el.container.add_class("element");
            }
            /** */
         }
      }
   }

   element_name(element) {
      let counter = loopar['element' + element];
      counter = !counter || isNaN(counter) ? 1 : counter + 1;
      loopar['element' + element] = counter;

      const base_name = `${element}${counter}`;
      const id = base_name + "_" + this.uuid();

      return {
         id: id,
         name: id,
         label: Capitalize(base_name)
      };
   }

   uuid() {
      return "el" + Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
   }
}

export const element_manage = new ElementManage();