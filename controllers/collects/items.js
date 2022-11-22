const Model = require('./model.js');
const events = require("../../../modules/events/module.js");
const configs = require("../../../configs.json");
const filters = {}

    for (let _filter in configs.filters.import.items.before) {
        try {
            filters[_filter] =  require('../../filters/' + _filter + '.js')
        } catch {}
    }

class Collect extends Model
{
    constructor()
    {
        super();

        this.cachedInstance = {};
        this.params = {"type" : "items", "tables" : []};
    }

    clear()
    {
        this.cachedInstance = {};
        super.clear();
    }

    getInstance(params)
    {
        if (typeof this.instances[ params['table'] ] == 'undefined') {

            if(this.params['tables'].indexOf(params['table']) === -1) this.params['tables'].push(params['table']);
            this.instances[params['table']] = {};
        }

        return this.cachedInstance[ params['table'] ] ?? (this.cachedInstance[ params['table'] ] = super.getInstance(this.instances[ params['table'] ]));
    }

    async processing(item)
    {
        if (typeof item['ID'] != 'undefined') {

            item['external_id'] = item['ID'];
            delete item['ID'];

            return {[ item['external_id'] ]: item};
        }

        return {};
    }

    async get()
    {
        if (this.prepared) return (this.prepared.length > 0 ? this.prepared : false);

        if (await this.prepare()) {

            for (let table in this.instances) {

                for (let id in this.instances[table]) {

                    this.prepared.push({
                        'index': {
                            "_index": table,
                            "_id": id,
                            "_type": '_doc'
                        }
                    });

                    this.prepared.push(this.instances[table][id]);
                }
            }

            return this.prepared;
        }

        return false;
    }

    async prepare()
    {
        if (this.prepared) return true;

        this.prepared = [];

        for (let table of Object.keys(this.instances)) {

            for (let filter of Object.keys(filters)) {

                if (!(this.instances[table] = await (await new filters[filter](
                    this.instances[table],
                    Object.assign(configs.filters.import.items.before[filter] ?? {}, {
                        "table": table,
                        "type": "items"
                    })
                )).filter())) return false;
            }
        }

        await events.triggerAsync('collects', 'prepare', this);

        return this.isPrepared = true;
    }
}

module.exports = Collect;