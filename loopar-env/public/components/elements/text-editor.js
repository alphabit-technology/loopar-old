import {elements} from "/components/elements.js";
import {BaseInput} from "/components/base/base-input.js";

export class TextEditor extends BaseInput {
   _editor = null;

   constructor(props) {
      super(props);

      this.make();
   }

   make() {
      super.make();

      this.input.hide();

      this._editor = elements({
         wrapper: this
      }).tag("div");

      const toolbarOptions = [
         ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
         ['blockquote', 'code-block'],

         [{'header': 1}, {'header': 2}],               // custom button values
         [{'list': 'ordered'}, {'list': 'bullet'}],
         [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
         [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
         [{'direction': 'rtl'}],                         // text direction

         [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
         [{'header': [1, 2, 3, 4, 5, 6, false]}],

         [{'color': []}, {'background': []}],          // dropdown with defaults from theme
         [{'font': []}],
         [{'align': []}],

         ['clean']                                         // remove formatting button
      ];

      this.editor = new Quill(this._editor.obj, {
         modules: {
            toolbar: toolbarOptions
         },
         theme: 'snow'
      });

      this.editor.on('text-change', (delta, oldDelta, source) => {
         this.trigger('change');
      });
   }

   val(val = null) {
      if (val != null) {
         this.editor.setContents(JSON.parse(val));
         this.trigger('change');
      } else {
         return JSON.stringify(this.editor.getContents());
      }
   }
}

export const text_editor = (options) => {
   return new TextEditor(options);
}