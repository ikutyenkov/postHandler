const events = require("../../../modules/events/module.js");

class Model
{
    constructor()
    {
        this.clear();
    }

    clear()
    {
        this.prepared = false;
        this.instances = {};
        this.length = 0;
    }

    async init()
    {
        await events.triggerAsync('collects', 'create', this);
    }

    getInstance(instance)
    {
        return {"set" : this._set.bind({"self" : this, "instance" : instance})}
    }

    async destroy()
    {
        await events.triggerAsync('collects', 'destroy', this);
        this.clear();
    }

    async _set(item)
    {
        this.instance = Object.assign(this.instance, await this.self.processing(item));
        this.self._reCalc();

        await events.triggerAsync('collects', 'add', this.self);
    }

    _reCalc()
    {
        let _length = 0;

        for (let instance in this.instances)
            _length += Object.keys(this.instances[instance]).length;

        this.length = _length;
        this.prepared = false;
    }
}

module.exports = Model;