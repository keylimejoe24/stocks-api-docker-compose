const { connect, disconnect } = require('../config/db.config');
const { Scrape } = require('../model/scrape.model');
const logger = require('../logger/api.logger');

class ScrapeRepository {

    constructor() {
        connect();
    }

    async list() {
        const tasks = await Scrape.find({});
        return tasks;
    }
    async deleteAll() {
        const tasks = await Scrape.deleteMany({});
        return tasks;
    }
    async listByID(id) {
        const tasks = await Scrape.find({ id:id });
        return tasks;
    }
    async listDistinctId() {
        const ids = await Scrape.find().distinct('id', function(error, ids) {
            if(error){
                logger.error('Error::' + error);
            }
            return ids
        });

        return ids.map(id => {
            const scrapes = Scrape.find({ id: id })
            return {
                "id":id,
                "createdAt": scrapes[0].createdAt
            }
        })
       
    }
   
    async listByIDandSymbol(id,symbol) {
        const tasks = await Scrape.find({ id:id,symbol:symbol });
        return tasks;
    }

    async create(task) {
        let data = {};
        try {
            data = await Scrape.create(task);
        } catch(err) {
            logger.error('Error::' + err);
        }
        return data;
    }

    async update(task) {
        let data = {};
        try {
            data = await Scrape.updateOne(task);
        } catch(err) {
            logger.error('Error::' + err);
        }
        return data;
    }

    // async deleteTask(taskId) {
    //     let data = {};
    //     try {
    //         data = await Task.deleteOne({_id : taskId});
    //     } catch(err) {
    //         logger.error('Error::' + err);
    //     }
    //     return {status: `${data.deletedCount > 0 ? true : false}`};
    // }

}

module.exports = new ScrapeRepository();