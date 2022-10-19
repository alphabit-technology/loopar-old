import {div} from "../elements/div.js";
import {elements} from "../elements.js";

export const element_title = (wrapper) => {
   const title = () => {
      return div({
         wrapper_is_super_parent: true,
         props: {
            class: "element-title"
         },
         content: [
            div({
               props: {class: "btn-group element-options"},
               content: [
                  elements({
                     content: [
                        elements().icon().edit(),
                     ],
                     props: {
                        class: "btn-xs element-title-action"
                     }
                  }).button().default().on('click', (obj, ev) => {
                     ev.preventDefault();

                     if (wrapper.parentWrapper) wrapper.parentWrapper.edit_element(wrapper);
                  }),
                  elements({
                     content: [
                        elements().icon().trash()
                     ],
                     props: {
                        class: "btn-xs element-title-action"
                     }
                  }).button().default().on("click", (obj, ev) => {
                     ev.preventDefault();
                     ev.stopPropagation();
                     wrapper.remove();
                  }, "double_click")
               ]
            }),
            div({
               props: {class: "btn-group title-description"},
               content: [
                  elements({
                     content: elements({content: (wrapper.title.toString().split(".")[0]).toUpperCase()}).tag('span'),
                     props: {
                        class: "btn btn-xs element-title-text"
                     }
                  }).button().default()
               ]
            })
         ]
      })
   }

   if (typeof wrapper.content == "string") {
      wrapper.content = {
         title: title(),
         value: wrapper.content
      }
   } else if (typeof wrapper.content == 'object') {
      if (Array.isArray(wrapper.content)) {
         wrapper.content.push(title());
      } else {
         Object.assign(wrapper.content, {title: title()});
      }
   }
}