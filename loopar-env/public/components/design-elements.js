import {HTML} from "/components/base/html.js";
import {icon} from "/components/elements/icon.js";
import {DragAndDropUtils} from "/utils/drag-and-drop.js";
import {humanize} from "/utils/helper.js";
import {element_definition, elements_names} from "/element-definition.js";
import {elements} from "/components/elements.js";

export class DesignElement {
   #obj = null;
   #toElement = null;

   constructor(options) {
      Object.assign(this, options);

      if (this.#toElement) {
         return this[this.#toElement].on("dragstart", (obj, event) => {
            event.stopPropagation();

            DragAndDropUtils.elementToCreate = this.elementToCreate;
         }).on("dragend", () => {
            DragAndDropUtils.elementToCreate = null;
         });
      }
   }

   get obj() {
      return this.#obj
   }

   set toElement(element) {
      this.#toElement = element;
   }

   get toElement() {
      return this.#toElement
   }

   get elementToCreate() {/*Return element to set in drag*/
      const el = elements({
         props: {
            class: "element",
         },
         designer: true,
         has_title: true,
         title: this.#toElement,
         element: this.#toElement
      })[this.#toElement]();

      element_definition[el.element].props.forEach((prop) => {
         el[prop]();
      });

      return el;
   }

   get html() {
      return this.#obj.html();
   }
}

elements_names.forEach(element => {
   Object.defineProperties(DesignElement.prototype, {
      [element]: {
         get: function () {
            return new HTML({
               element: element,
               wrapper: this.wrapper,
               props: {
                  class: "btn btn-app"
               },
               content: [
                  icon()[element](),
                  humanize(element)
               ]
            }).tag("a").draggable();
         }
      }
   });
});