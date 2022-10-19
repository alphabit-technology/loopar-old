class DynamicTable extends Div {
   constructor(options) {
      super(options, false);

      this.make_wrapper();
   }

   get template() {
      return super.div();
   }

   get _editable() {
      return !this.editable === false;
   }

   get _has_title() {
      return !this.has_title === false;
   }

   make_wrapper() {
      super.make();
      this.add_class('table-responsive');

      this.label = elements({content: 'Table Detail'}).tag('label');
      this.head = elements().tag('thead');
      this.body = elements().tag('tbody');
      this.table = elements({
         props: {class: 'table table-bordered table-condensed table-striped table-hover'}
      }).tag('table');

      this.table.append(this.head);
      this.table.append(this.body);
      if (this._has_title) this.append(this.label);
      this.append(this.table);

      this.make_table();
   }

   make_table() {
      this.data_table = this.data_table && Object.keys(this.data_table).length > 0 ? this.data_table : {
         columns: [
            {name: 'name', title: 'Name', element: 'input'},
            {name: 'description', title: 'Description', element: 'input'},
            {name: 'disabled', title: 'Disabled', element: 'switch'}
         ],
         rows: [
            {name: 'Raquel', description: 'Acosta', disabled: true},
            {name: 'Alfredo', description: 'Ramirez', disabled: true}
         ]
      }

      ///this.data_table.columns.push({name: 'options', title: '...', element: 'div'});

      this.data_table.columns.forEach(column => {
         this.head.append(
            elements({static: true, content: column.title}).tag('th')
         );
      });

      this.data_table.rows.forEach(row => {
         const tr = elements().tag('tr');
         this.data_table.columns.forEach(column => {
            const td = elements({
               props: {class: this._editable ? 'td-like-input' : ''}
            }).tag('td');

            if (this._editable) {
               elements({
                  props: {
                     /*contenteditable: "true",*/
                     class: this._editable ? 'input-like-div' : ''
                  },
                  without_label: true,
                  wrapper: td,
                  value: row[column.name],
                  content: row[column.name]
               })[column.element]();

               tr.append(td);
            } else {
               if (column.name === 'name') {
                  td.append(elements({
                     props: {
                        //href:`/${MODULE}/${DOCUMENT}/update?document_name=${row[column.name]}`
                     },
                     content: () => {
                        return row[column.name]
                     }
                  }).tag('a'))
               } else {
                  td.val(row[column.name]);
               }
            }

            tr.append(td);

            /*.tag('input').on('change', ob => {
                console.log(ob.val());
                //ob.trigger('change');
            });*/

         });
         this.body.append(tr);
      });
   }

   get_table_values() {
      return this.body.field_values();
   }
}