const Model = require('../filters/model.js');

class Filter extends Model {

    async _prepare()
    {

        if (typeof this.prepared != 'undefined')
            return this.prepared;

        this.prepared = false;

            if (typeof this.params['fields'] == 'object' && this.params['fields']) {

                for (let _key in this.params['fields']) {

                    if (_key != '' && typeof this.params['fields'][_key]['source'] == 'object' && Object.keys(this.params['fields'][_key]['source']).length > 0) {

                        this.params['fields'][_key]['target'] = _key.split('.');

                        for (let i = 0; i < this.params['fields'][_key]['source'].length; i++) {

                            if (typeof this.params['fields'][_key]['source'][i] == 'string')
                                this.params['fields'][_key]['source'][i] = this.params['fields'][_key]['source'][i].split('.');
                        }

                    } else {
                        delete this.params['fields'][_key];
                    }
                }

                if (Object.keys(this.params['fields']).length > 0)
                    this.prepared = true;
            }

        return this.prepared;
    }

    async _processing(item)
    {
        for (let _key in this.params['fields']) {

            let _value = '';

            for (let _index in this.params['fields'][_key]['source'])
                _value += this._getValueFromPath(this.params['fields'][_key]['source'][_index], item) || '';

            this._setValueFromPath(this.params['fields'][_key]['target'], item, _value);
        }

        return item;
    }

    _setValueFromPath(path, data, value)
    {
        const limit = path.length - 1;

        for (let i = 0; i < limit; i++)
            data = data[ path[i] ] ?? (data[ path[i] ] = { });

        data[ path[limit] ] = value;
    }

    _getValueFromPath(path, data)
    {
        let _data = Object.assign({}, data);
        for (let i = 0; i < path.length; i++) {

            if (typeof _data[ path[i] ] == 'undefined')
                return false;

            _data = _data[ path[i] ];
        }

        if (typeof _data != 'object')
            return ' ' + _data;

        return false;
    }
}

module.exports = Filter;