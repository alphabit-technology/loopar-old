
'use strict';

import {BaseController, loopar, file_manage} from 'loopar-env';
import fs from "fs";

export default class AppManagerController extends BaseController {
    context = "view";
    constructor(props){
        super(props);

        if(this.action !== 'view'){
            this.redirect('view');
        }
    }

    async action_view(){
        const apps_list = [];

        const dir = await fs.promises.opendir(loopar.path_root + "/apps");

        for await (const dirent of dir) {
            const app_data = file_manage.get_config_file('installer', "apps/" + dirent.name, null);

            if(app_data && app_data.App) {
                for (const app of Object.values(app_data.App)) {
                    const installed_app = await loopar.get_app(app.name);
                    app.installed = !!installed_app;
                    app.version = app.version || '0.0.1';
                    app.installed_version = installed_app ? installed_app.version : app.version;

                    apps_list.push(app);
                }
            }
        }

        this.response.apps = apps_list;
        await super.action_update();
    }
}