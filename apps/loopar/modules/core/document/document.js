import {BaseDocument, file_manage, loopar} from "loopar-env";
import path from "path";
import {Helpers} from "loopar-env";

export default class Document extends BaseDocument {
   constructor(props) {
      super(props);
   }

   async save() {
      if(['Page', 'Form', 'Report'].includes(this.type)) {
         this.is_single = 1;
      }

      this.validate_type();
      this.fix_fields();
      this.validate_fields();
      this.validate_table_name();

      await loopar.db.begin_transaction();
         if (this.type === 'Document' && !this.is_single) {
            await loopar.db.make_table(this.name, this.doc_structure);
         }
         await super.save();
      await loopar.db.end_transaction();

      if(loopar.installing) return;

      await this.make_document_structure();
      await this.make_files();
      await this.make_json();
      await this.update_installer();

      await loopar.make_config();
   }

   async update_installer(delete_document = false) {
      const app_name = await this.app_name();
      await loopar.update_installer('apps/' + app_name, "Document", this.name, this.values, delete_document);
   }

   client_fields_list(fields = this.doc_structure) {
      return fields.reduce((acc, field) => {
         return acc.concat(field, this.client_fields_list(field.elements || []));
      }, []);
   }

   fix_fields() {
      let exist_column = false;

      const fix_fields = (fields = this.doc_structure, field_data = {}) => {
         return fields.map(field => {
            if (field.data.name === field_data.data.name) {
               exist_column = true;
               Object.assign(field.data, field_data.data);
            }

            field.elements = fix_fields(field.elements || [], field_data);

            if (this.__IS_NEW__ && field.data.required) {
               field.data.in_list_view = 1;
            }

            return field;
         });
      }

      const name_structure = {
         element: INPUT,
         is_writeable: true,
         data: {
            name: 'name',
            label: 'Name',
            type: 'text',
            required: 1,
            in_list_view: 1,
            set_only_time: 1,
            unique: 1,
         }
      };

      const is_deleted = {
         element: INPUT,
         is_writeable: true,
         data: {
            name: 'is_deleted',
            label: 'Is Deleted',
            type: 'text',
            required: 0,
            in_list_view: 0,
            set_only_time: 0,
            unique: 0,
            hidden: 1
         }
      };

      const id_structure = {
         element: ID,
         is_writeable: true,
         data: {
            name: 'id',
            label: 'ID',
            type: INTEGER,
            required: 1,
            in_list_view: 0,
            hidden: 1
         }
      };

      this.doc_structure = fix_fields(this.doc_structure, name_structure);

      if (!exist_column && this.type === 'Document') {
         name_structure.data.hidden = 1;
         this.doc_structure = [name_structure, ...this.doc_structure];
      }
      exist_column = false;

      /*this.doc_structure = fix_fields(this.doc_structure, is_deleted);

      if (!exist_column) {
         exist_column = false;
         this.doc_structure = [is_deleted, ...this.doc_structure];
      }*/

      this.doc_structure = fix_fields(this.doc_structure, id_structure);

      if (!exist_column) {
         this.doc_structure = [id_structure, ...this.doc_structure];
      }
      exist_column = false;
   }

   validate_type() {
      if (!['Document', 'Page', 'Form', 'Report'].includes(this.type)) {
         loopar.throw('Invalid document type');
      }
   }

   async delete() {
      if(['Document', 'User', 'Module', 'Module Group', 'App'].includes(this.name)) {
         loopar.throw(`You can not delete ${this.name}`);
         return;
      }

      //TODO: Change to soft delete and cascade delete
      await super.delete();

      /*this.is_deleted = 1;
      await this.save();*/
   }

   validate_fields() {
      const fields = this.client_fields_list();

      const duplicates = fields.map(field => field.data.name).filter((value, index, self) => self.indexOf(value) !== index);

      if (duplicates.length) {
         loopar.throw(`Duplicate field names:<br/> ${duplicates.join(', ')}`);
      }
   }

   validate_table_name() {
      const table_name = this.name;

      if (table_name.length < 3) {
         loopar.throw('Document name must be at least 3 characters long.');
      }

      if (table_name.length > 64) {
         loopar.throw('Document name must be at most 64 characters long.');
      }

      if (!/^[a-zA-Z0-9 ]+$/.test(table_name)) {
         loopar.throw('Document name must contain only letters, numbers and spaces.');
      }

      if (/^[0-9_]+$/.test(table_name)) {
         loopar.throw('Document name must not start with a number.');
      }
   }

   name_to_file() {
      return this.name.replaceAll(/\s+/g, '-').toLowerCase();
   }

   module_to_file() {
      return this.module.replaceAll(/\s+/g, '-').toLowerCase();
   }

   async app_name() {
      return await loopar.db.get_value("Module", "app_name", this.module);
   }

   async module_path() {
      return path.join("apps", await this.app_name(), "modules", this.module_to_file());
   }

   async document_path() {
      return path.join(await this.module_path(), this.name_to_file());
   }

   async client_path() {
      return path.join(await this.document_path(), 'client');
   }

   async make_document_structure() {
      await file_manage.make_folder(await this.document_path(), 'client');
   }

   async make_files() {
      const document_path = await this.document_path();
      const client_path = await this.client_path();

      /*Document Model*/
      await file_manage.make_class(document_path, this.name, {
         IMPORTS: {
            'BaseDocument': 'loopar-env',
         },
         EXTENDS: 'BaseDocument'
      });

      /*Document Controller*/
      await file_manage.make_class(document_path, `${this.name}Controller`, {
         IMPORTS: {
            'BaseController': 'loopar-env',
         },
         EXTENDS: 'BaseController'
      });

      /*Document Client*/
      for (const context of ["form", "list", "view", "report"]) {
         const import_context = `${Helpers.Capitalize(context)}Context`;

         await file_manage.make_class(client_path, this.name + Helpers.Capitalize(context), {
            IMPORTS: {
               [import_context]: `/context/${context}-context.js`,
            },
            EXTENDS: import_context
         }, 'default');
      }
   }

   /**installer**/
   async make_json() {
      await file_manage.set_config_file(this.name_to_file(), this.__data__.__DOCUMENT__, await this.document_path());
   }
}