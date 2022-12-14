const scrapeService  = require('../service/scrape.service');
const logger = require('../logger/api.logger');
const scrapeRepository = require('../repository/scrape.repository');

class ScrapeController {

    async run(tickers,id,socketIO) {
        logger.info('Controller: run')
        logger.info(tickers)
        logger.info(id)
        return await scrapeService.run(tickers,id,socketIO);
    }
    async runAlgorithms(id) {
        logger.info(`Running Algorithms on scrape id ${id}`)
        return await scrapeService.runAlgorithms(id);
    }
    async getScrapeIds() {
        logger.info(`Returning Scrape ID's`)
        return await scrapeRepository.listDistinctId();
    }
    async getTickerStats(id,symbol) {
        return await scrapeRepository.listByIDandSymbol(id,symbol);
    }
    async deleteAll() {
        return await scrapeRepository.deleteAll();
    }

    // async createTask(task) {
    //     logger.info('Controller: createTask', task);
    //     return await scrapeService.createTask(task);
    // }

    // async updateTask(task) {
    //     logger.info('Controller: updateTask', task);
    //     return await scrapeService.updateTask(task);
    // }

    // async deleteTask(taskId) {
    //     logger.info('Controller: deleteTask', taskId);
    //     return await scrapeService.deleteTask(taskId);
    // }
}
module.exports = new ScrapeController();