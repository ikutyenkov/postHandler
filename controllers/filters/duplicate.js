const Model = require('./model.js');
const elasticsearch = require("../../../modules/connections/elasticsearch.js");

class Filter extends Model {

    async _prepare()
    {
        this.oldCollect = {};

        if (typeof this.params.table != '')
            elasticsearch.search({
                "index": this.params.table,
                "body": {
                    "query": {
                        "bool" : {
                            "filter" : {
                                "terms" : {
                                    "external_id" : Object.keys(this.collect || {})
                                }
                            }
                        }
                    },
                    "from" : 0,
                    "size" : 9999
                }
            }, (err, result) => {

                if (!err)
                    this.oldCollect = elasticsearch.fetch(result);
            });

        return true;
    }

    async _processing(item)
    {
        if (typeof this.oldCollect[ item['external_id'] ] == 'object' && JSON.stringify(item) === JSON.stringify(this.oldCollect[ item['external_id'] ]))
            return false;

        return item;
    }
}

module.exports = Filter;