const scrapeService  = require('../service/scrape.service');
const logger = require('../logger/api.logger');
const scrapeRepository = require('../repository/scrape.repository');

class ScrapeController {

    async run(tickers,id) {
        logger.info('Controller: run')
        logger.info(id)
        return await scrapeService.run(tickers,id);
    }
    async runAlgorithms(id) {
        logger.info(`Running Algorithms on scrape id ${id}`)
        return await scrapeService.runAlgorithms(id);
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