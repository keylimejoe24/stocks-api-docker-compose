class Utils {

    constructor() { }
   
    async sleep (milliseconds){
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
      }

}

module.exports = new Utils();