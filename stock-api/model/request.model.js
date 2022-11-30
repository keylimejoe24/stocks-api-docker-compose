const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const reuestSchema = new mongoose.Schema({
    url:Schema.Types.Mixed,
    time:Schema.Types.Mixed,
},
    { timestamps: { createDate: 'created_at', updatedDate: 'updated_at' } });

const Scrape = mongoose.model('scrape', reuestSchema);

module.exports = {
    Scrape
}
