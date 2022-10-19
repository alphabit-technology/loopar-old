import {elements} from "/components/elements.js";
import {BaseInput} from "/components/base/base-input.js";

export class Markdown extends BaseInput {
   _editor = null;
   tag_name = "textarea";

   constructor(props = {}) {
      super(props);

      this.make();
   }

   make() {
      super.make();

      if (!this.designer) {
         this.input.hide();
         this._editor = elements({
            wrapper: this
         }).tag('div');
      }else{
         this._editor = this.input;
      }

      if (this.designer) {
         this.editor = new SimpleMDE({
            element: this._editor.obj,
            toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side"],
         });

         this.editor.codemirror.on('change', () => {
            this.trigger('change');

            this.data.value = this.editor.value();
         });

         this.editor.value(this.data.value);
      } else if (this.data.value) {
         this.label.hide();
         this._editor.append_content(marked.parse(this.data.value));
      }
   }

   val(val = null) {
      console.log(["markdow value", val])
      if (val != null) {
         this.designer && this.editor.value(val);

         this.trigger('change');
      } else {
         return this.data.value;
      }
   }
}

export const markdown = (options) => {
   return new Markdown(options);
}