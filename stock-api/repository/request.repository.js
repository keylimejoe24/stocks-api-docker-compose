const { connect, disconnect } = require('../config/db.config');
const { Request } = require('../model/request.model');
const logger = require('../logger/api.logger');

class ScrapeRepository {

    constructor() {
        connect();
    }

    async list() {
        const tasks = await Scrape.find({});
        console.log('tasks:::', tasks);
        return tasks;
    }
    async deleteAll() {
        const tasks = await Scrape.deleteMany({});
        console.log('tasks:::', tasks);
        return tasks;
    }
    async listByID(id) {
        const tasks = await Scrape.find({ id:id });
        console.log('tasks:::', tasks);
        return tasks;
    }

    async create(task) {
        let data = {};
        try {
            data = await Request.create(task);
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