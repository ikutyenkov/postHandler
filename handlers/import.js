const Queue = require("../class/queue.js");
const Interface = require("../class/interface.js");
const Request = require("../class/request.js");
const Await = require("../../node_modules/micro-service-modules-await");

const collects = require("../controllers/collects.js");
const config = require("../config.json");

class Handler
{
    constructor()
    {
        this.isAwait = new Await(1000, 20);

        Queue.subscribe('import', this.add, this.executeCollects);
    }

    async add(source)
    {
        if (
            typeof source.headers != 'undefined'
            && source.headers.source != 'undefined'
            && source.headers.instance != 'undefined'
            && source.message != 'undefined'
            && typeof source.message == 'object'
        ) {

            if (!this.isAwait.ready)
                await this.isAwait.wait();

            try {

                let _collect = collects.createCollect(source.headers.source);

                if (_collect) {

                    for (let id of Object.keys(source.message)) {
                        await _collect.getInstance(source.headers.instance).set(source.message[id]);
                        await this._progress(_collect);
                    }

                    return true;
                }
            } catch (e) {
                console.log(e);
            }
        }

        return false;
    }

    async _progress(collect)
    {
        if (collect.length >= (config.collects.step_limit ?? 20))
            await this._execute(collect);

        return true;
    }

    async executeCollects()
    {
        if (!this.isAwait.ready)
            await this.isAwait.wait();

        for (let collect of collects.getCollects())
            await this._execute(collect);
    }

    async _execute(collect)
    {
        this.isAwait.ready = false;
        let _preparedCollect = await collect.get();

        if (_preparedCollect && Object.keys(_preparedCollect).length > 0) {

            try {

                await Request.insert({"body": _preparedCollect});
                collect.destroy();

                this.isAwait.ready = true;
            } catch (e) {
                console.log(e);
            }
        } else {
            collect.destroy();
        }
    }
}

module.exports = new Handler();