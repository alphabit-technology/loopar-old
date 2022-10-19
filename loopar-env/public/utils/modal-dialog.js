import {elements} from "/components/elements.js";
import {loopar} from "/loopar.js";

class ModalDialog {
   constructor(options) {
      Object.assign(this, options);

      this.title = elements({
         props: {class: 'modal-title inline-editable'},
         content: `${this.title}`
      }).tag('h6');

      this.body = elements({
         props: {
            class: 'modal-body'
         }
      }).tag('div').val(this.message);

      this.ok_btn = elements({
         props: {
            class: 'btn btn-primary'
         },
         content: 'Ok'
      }).tag('button').on('click', () => {
         this.ok && this.ok();
         this.close();
      });

      this.cancel_btn = elements({
         props: {
            class: 'btn btn-light'
         },
         content: 'Cancel'
      }).tag('btn').on('click', () => {
         this.on_cancel && this.on_cancel();
         this.close();
      });

      this.footer = elements({
         props: {
            class: 'modal-footer'
         },
         content: {
            ok: this.ok_btn,
            cancel: this.cancel_btn
         }
      }).tag('div');

      this.wrapper = elements({
         wrapper: loopar.modal_wrapper,
         props: {
            class: 'modal fade has-shown show'
         },
         content: elements({
            props: {class: 'modal-dialog'},
            content: elements({
               props: {class: 'modal-content'},
               content: {
                  header: elements({
                     props: {class: 'modal-header'},
                     content: this.title
                  }).tag('div'),
                  body: this.body,
                  footer: this.footer
               }
            }).tag('div')
         }).tag('div')
      }).tag('div');
   }

   open() {
      this.wrapper.add_class('show').css({display: 'block'});
      loopar.body.add_class('modal-open');
   }

   close() {
      this.wrapper.remove_class('show').css({display: 'none'});
      loopar.body.remove_class('modal-open');
      this.on_close && this.on_close();
   }

   footer_template() {
      return `
        <div class="modal-footer">
            <button type="submit" class="btn btn-primary">Save</button> 
            <button type="button" class="btn btn-light" data-dismiss="modal">Close</button>
        </div>`;
   }

   template(message) {
      return `
            <div class="modal fade has-shown show" id="clientNewModal" tabindex="-1" role="dialog" aria-labelledby="clientNewModalLabel" style="display: block;" aria-modal="true">
                <div class="modal-dialog" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                        <h6 id="clientNewModalLabel" class="modal-title inline-editable">
                            Modal Title
                        </h6>
                    </div>

                    <div class="modal-body">
                      ${message}
                    </div>

                    <div class="modal-footer">
                      <button type="submit" class="btn btn-primary">Save</button> 
                      <button type="button" class="btn btn-light" data-dismiss="modal">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            `;
   }
}

export function modal_dialog(options) {
   const modal = new ModalDialog(options);
   modal.open();
   return modal;
}

//const modal_dialog = new ModalDialog()