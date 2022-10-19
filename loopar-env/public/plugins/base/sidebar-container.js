import {elements} from "/components/elements.js";

export class SidebarContainer {
   constructor(parent) {
      this.parent = parent;

      this.sidebar_container = elements({
         wrapper: parent.sidebar.sidebar,
         props: {
            class: 'page-sidebar sidebar-dar-primary',
            //style: 'position: absolute; transition: unset; top: 10px;'
            style: 'position: absolute; transition: unset;'
         }
      }).div();

      this.header = elements({
         wrapper: this.sidebar_container,
         props: {
            class: "nav nav-tabs nav-fill"
         }
      }).div();

      this.action = elements({
         wrapper: this.header,
         props: {
            class: 'btn btn-secondary'
         }
      }).tag('button');

      this.body = elements({
         wrapper: this.sidebar_container,
         props: {class: "sidebar-section-fill"}
      }).div();
   }

   hide() {
      this.sidebar_container.hide();
   }

   show() {
      this.sidebar_container.show();
      this.parent.sidebar.toggle(false);
   }
}