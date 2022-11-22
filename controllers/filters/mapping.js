const Model = require('../filters/model.js');
const elasticsearch = require("../../modules/connections/elasticsearch.js");

class Filter extends Model {

    async _prepare()
    {
        this.map = {"properties" : {}};
        this.params.maps = Object.assign({"else" : 'keyword', "number" : 'integer'}, this.params.maps ?? {});

        return true;
    }


    async _processing(item)
    {
        this._multiAssign(this.map['properties'], this._getObjectMap(item, this.params.table)['properties']);

        return item;
    }

    _multiAssign(target, source)
    {

        for (let key in source)
        {

            if (typeof target[key] == 'object') {
                this._multiAssign(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    _getObjectMap(object, parentKeyMap)
    {
        let _map = {"properties" : {}};

        for (let key in object) {

            let _keymap = (typeof parentKeyMap != 'undefined' ? parentKeyMap + '.' : '') + key;

            if (typeof object[key] == 'object') {

                let _objectMap = this._getObjectMap(object[key], _keymap);

                if (_objectMap) _map['properties'][key] = _objectMap;
            } else {

                let _currentMap = ((this.params.maps[_keymap] ?? this.params.maps[parentKeyMap]) ?? this.params.maps[ typeof object[key] ]) ?? this.params.maps['else'];

                    if (typeof _currentMap != 'object')
                        _currentMap = {"type" : _currentMap};

                _map['properties'][key] = _currentMap;
            }
        }

        return (Object.keys(_map['properties']).length > 0 ? _map : false);
    }

    async _postProcessing()
    {
        return (Object.keys(this.map['properties']).length > 0 && await elasticsearch.repairMapping(this.params.table, this.map));
    }
}

module.exports = Filter;