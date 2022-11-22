class Collects {

    constructor()
    {
        this.collects = {};
    }

    createCollect(controller)
    {

        if (typeof this.collects[controller] != 'undefined')
            return this.collects[controller];

        try {

            this.collects[controller] =  new (require('./collects/' + controller + '.js'))();
            this.collects[controller].init();

            return this.collects[controller];
        } catch(e) {
            return this.collects[controller] = false;
        }
    }

    getCollects()
    {

        let _collects = [];

            for (let collect in this.collects)
                if (this.collects[collect]) _collects.push(this.collects[collect]);

        return _collects;
    }
}

module.exports = new Collects();