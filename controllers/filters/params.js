const Model = require('./model.js');
const params = require("../../modules/params/module.js");

class Filter extends Model {

    constructor(collect, params)
    {
        super(collect, params);
        this.paramsCollect = false;
    }

    async _prepare()
    {
        this.paramsCollect = false;

        if (typeof this.params.table != '') {

            this.paramsCollect = new params(this.params.table);
            await this.paramsCollect.prepare();
        }

        return true;
    }

    async _processing(item)
    {
        let processed = {};

        if (this.paramsCollect && typeof item['params'] != 'undefined') {

            for (let name of Object.keys(item['params'])) {

                if (typeof  item['params'][name].parent != 'undefined' &&  item['params'][name].parent != '') {

                    if (item['params'][name].parent != '') {

                        let _parent = await this._paramProcessing(name, item['params'][name].parent);

                        if (_parent) {
                            item['params'][name].parent = _parent.value;
                        } else {
                            delete item['params'][name].parent;
                        }
                    } else {
                        delete item['params'][name].parent;
                    }
                }

                let _param = await this._paramProcessing(name, item['params'][name]);

                if (_param)
                    processed['_' + _param.id] = _param.value;
            }
        }

        item['params'] = processed;

        return item;
    }

    async _paramProcessing(name, param)
    {
        param = (typeof param == 'object') ? param : {"value" : param};
        let _param = await this.paramsCollect.isset(name, (Number.isInteger(param.value) && !isNaN(param.value - 0)) ? 'N' : 'L');

        if (_param) {

            if (_param.types[this.params.table] === 'N') {
                return  Object.assign({}, _param, {"value" : ((param.value - 0) ?? 0)});
            } else {

                let _valueId = await _param.isset(param);

                if (_valueId)
                    return Object.assign({}, _param, {"value" : _valueId});
            }
        }

        return false;
    }
}

module.exports = Filter;