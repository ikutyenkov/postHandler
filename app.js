const config = require("./config.json");

class App
{
    constructor()
    {
        this.handlers = {};

            for (let i = 0; i < (config.handlers ?? []).length; i++) {

                try {
                    this.handlers[config.handlers[i]] = require("./handlers/" + config.handlers[i] + ".js");
                } catch (e) {
                    console.log([e]);
                }
            }
    }
}

module.exports = new App();