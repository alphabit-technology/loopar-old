'use strict';

import cookieParser from "cookie-parser";
import session from 'express-session';
import bodyParser from "body-parser";
import express from "express";

import {loopar} from "./loopar.js";
import App from "./app.js";
import path from "path";

class Server {
   express = new express();
   #url = null;

   constructor() {}

   async initialize() {
      await loopar.initialize();

      this.#expose_public_directories();
      this.#initialize_session();
      this.#make_routes();
      this.#start();
   }

   #initialize_session() {
      const session_config = env.server_config.session;
      session_config.maxAge = session_config.maxAge * 1000 * 60 * 60 * 24;

      this.express.use(cookieParser());
      this.express.use(session(session_config));
      this.express.use(bodyParser.json());
      this.express.use(bodyParser.urlencoded({extended: true}));
   }

   #expose_public_directories() {
      const public_dirs = ['public', 'node_modules/loopar-env/core/global', 'node_modules/loopar-env/public'];
      public_dirs.forEach(dir => {
         this.express.use(express.static(path.join(loopar.path_root, dir)));
      });
   }

   #make_routes() {
      this.express.all('*', (req, res, next) => {
         this.#url = req._parsedUrl;
         this.request = req;
         this.response = res;

         if (this.#is_valid_url) {
            new App({
               res: res,
               req: req,
               url: this.#url,
               server: this.express,
               data: req.body
            });
         } else if (this.#is_asset_url) {
            next();
         } else {
            next();
         }
      });
   }

   get #pathname() {
      return this.#url ? this.#url.pathname : null;
   }

   get #is_valid_url() {
      return this.#pathname && !this.#pathname.includes(".") && !this.#pathname.includes("assets");
   }

   get #is_asset_url() {
      return this.#pathname && (this.#pathname.includes(".") || this.#pathname.includes("assets"));
   }

   #start() {
      loopar.server = this;
      const port = env.server_config.port;

      const install_message = loopar.framework_installed ? '' : '\n\nContinue in your browser to complete the installation';

      this.express.listen(port, () => {
         console.log("Server is started in " + port + install_message);
      });
   }
}

export const server = new Server();