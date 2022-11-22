const Model = require('../filters/model.js');

class Filter extends Model {

    async _prepare()
    {
        if (typeof this.params.target == 'string' && this.params.target !== '') this.params.target = [this.params.target];

        return true;
    }

    async _processing(item)
    {
        if (typeof this.params.target == 'object' && this.params.target) {

            for (let index in this.params.target) {

                if (typeof item[ this.params.target[index] ] != 'undefined')
                    item[ this.params.target[index] ] = (typeof item[ this.params.target[index] ] == 'object') ? this._processingObject(item[ this.params.target[index] ]) : this._processingValue(item[ this.params.target[index] ]);
            }
        } else {
            item = this._processingObject(item);
        }

        return item;
    }

    _processingObject(object)
    {
        for (let key in object)
            object[key] = this._processingValue(object[key]);

        return object;
    }

    _processingValue(value)
    {
        if (['string', 'number', 'boolean'].includes(typeof value)) {

            let _value = value - 0;

            if (!isNaN(_value)) value = Math.ceil(_value * 1000);
        }

        return value;
    }
}

module.exports = Filter;