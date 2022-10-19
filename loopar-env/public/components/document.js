class _Document {
   constructor(props) {
      Object.assign(this, props);
   }

   docReady(fn) {
      if (document.readyState === "complete" || document.readyState === "interactive") {
         setTimeout(fn(), 1);
      } else {
         document.addEventListener("DOMContentLoaded", fn);
      }
   }

   initialize() {
      this.docReady(() => {
         document.querySelectorAll("[element]").forEach(el => {
            elements({obj: el, from_html: true});
         });
         loopar_document.route = window.location.href;
      });
   }

}

export const Document = new _Document();