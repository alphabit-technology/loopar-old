
'use strict';

import LoginContext from '/context/login-context.js';

export default class LoginForm extends LoginContext {
    constructor(props){
        super(props);
    }

    async login() {
        this.send('login').catch(() => {
            this.get_field('user_name').invalid_status();
            this.get_field('password').invalid_status();
        });
    }
}