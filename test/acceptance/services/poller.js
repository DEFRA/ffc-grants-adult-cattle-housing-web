const pollingLimit = 30;
const pollingIntervalSeconds = 1;

async function pollForSuccess(predicate) {
    for (let i = 0; i < pollingLimit; i++) {
        if (await predicate()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, pollingIntervalSeconds * 1000));
    }
    
    return false;
}
  
module.exports = { pollForSuccess }
  