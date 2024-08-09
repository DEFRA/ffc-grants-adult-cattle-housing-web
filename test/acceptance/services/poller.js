class poller {
    static pollingLimit = 30;
    static pollingIntervalSeconds = 1;
    
    static async pollForSuccess(predicate) {
        for (let i = 0; i < this.pollingLimit; i++) {
            if (await predicate()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, this.pollingIntervalSeconds * 1000));
        }
        
        return false;
    }
  }

  
module.exports = poller;
  