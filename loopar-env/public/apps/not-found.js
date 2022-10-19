import {elements} from "/assets/js/elements.js";
import {DeskView} from "/apps/desk-view.js";

export class NotFound extends DeskView {
   constructor(options) {
      super(options);
      this.#render();
   }

   #render() {
      this.wrapper_container = elements({
         props: {class: 'metric-row metric-flush'}
      }).div();

      this.page_section = elements({
         wrapper: this.wrapper,
         props: {class: 'page-section', style: "padding: 15px"},
         content: elements({
            props: {class: 'card-body'},
            content: elements({
               props: {class: "metric-row"},
               content: elements({
                  content: this.wrapper_container
               }).col()
            }).div()
         }).div()
      }).div();

      this.#make_links()
   }

   #make_links() {
      elements({
         wrapper: this.wrapper_container,
         content: "Page Not Found"
      }).tag("h1");
   }
}



