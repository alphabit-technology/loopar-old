import {elements} from "/components/elements.js";
export class Sidebar {
   collapsed = localStorage.getItem('sidebar-collapsed') === 'true';

   constructor(parent) {
      this.parent = parent;

      this.sidebar = elements({
         wrapper: parent.wrapper
      }).div();

      this.toggle(this.collapsed);
   }

   hide() {
      this.sidebar.hide()
   }

   show() {
      this.sidebar.show();
   }

   toggle(collapsed = null) {
      this.collapsed = collapsed !== null ? collapsed : !this.collapsed;

      localStorage.setItem('sidebar-collapsed', this.collapsed);

      if (this.collapsed) {
         this.parent.wrapper.remove_class('has-sidebar-expand-xl has-sidebar-open');
      } else {
         this.parent.wrapper.add_class('has-sidebar-expand-xl has-sidebar-open');
         this.show();
      }
   }
}