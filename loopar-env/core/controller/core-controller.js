'use strict'

import express from "express";
import path from "path";
import AuthController from "./auth-controller.js";
import {loopar} from "../loopar.js";
import {lowercase,} from '../helper.js';
import {file_manage} from "../file-manage.js";

export default class CoreController extends AuthController {
   error = {};
   default_importer_files = ['index', 'form'];
   response = {};

   constructor(props) {
      super(props);

      this.default_importer_files.forEach(file => {
         this.server.use(express.static(path.join(this.controller_path, file)));
      });

      this.server.use(express.static(path.join(this.controller_path, "public")));
      this.server.use(express.static(path.join(this.controller_path, "client")));
   }

   has_data() {
      return Object.keys(this.data).length > 0;
   }

   async client_importer() {
      const document = this.document.replaceAll(/\s+/g, '-').toLowerCase();
      const client = this.client || this.context;
      const route = path.join(this.controller_path, 'client', `${document}-${client}.js`).toLocaleLowerCase();
      return await file_manage.exist_file(route) ? `/${document}-${client}.js` : `/context/${this.context}-context.js`;
   }

   get_code_error(code) {
      const valid_code_errors = [400, 401, 403, 404, 500];
      const code_error = this.error[code] || this.error[500];

      return valid_code_errors.includes(code_error) ? code_error : 500;
   }

   async send_error(error) {
      error = Object.keys(this.error).length === 0 ? error : this.error;

      this.error = {};

      error = {
         error: this.get_code_error(error.error),
         message: error.message || error,
      }

      try {
         if (this.method === AJAX) {
            return this.res
               .status(error.error)
               .json({error: 'Error ' + error.error, message: error.message}).send();

         } else {
            return await this.render({
               title: 'Error ' + error.error,
               message: error.message
            }, this.template_error(error.error));
         }
      } catch (e) {
         console.log(['Err on to try send error', e]);
      }
   }

   redirect(url = null) {
      this.res.redirect(url || this.req.originalUrl);
   }

   template_error(code) {
      return `errors/base-error`;
   }

   async render(content, template = this.layout) {
      Object.assign(content, {
         action: this.action,
      });

      content.source_url = this.url;

      content = {content: content};

      Object.assign(content, {
         url: this.url,
         client_importer: await this.client_importer(),
         context: this.context,
         user: loopar.current_user || {},
      });

      this.method === AJAX ? this.res.send(content) : await this.main(content, template);
   }

   async main(content = {}, template) {
      if (content.content) {
         content.content = JSON.stringify(content.content);
      }

      const client_importer = await this.client_importer();

      this.res.render(path.join(loopar.path_framework, "templates", template) + ".jade", Object.assign(content, {
         sidebar: this.has_sidebar ? await CoreController.#sidebar_data() : [],
         document: lowercase(this.document),
         client_importer: client_importer,
         action: this.action
      }));
   }

   async render_sidebar() {
      return this.get_groups();
   }

   not_found() {
      return this.render({
         app: "not_found"
      });
   }

   static async #sidebar_data() {
      return loopar.modules_group;
   }

   async action_search() {
      const document = await loopar.new_document(this.document, {module: this.module});
      const list = await document.get_list_to_select_element(this.q);

      this.res.send(list);
   }
}