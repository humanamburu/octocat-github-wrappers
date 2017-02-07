const logger = require('./src/Logger');
const {
    login,
    logout,
    createMyRepo,
    deleteMyRepo,
} = require('./src/OctoWrappers');

login().then((data) => {
    logger.info('-----------------------------');
    logger.info(` Hello ${data.username}!`);
    logger.info('-----------------------------');

    //createMyRepo('test-repo', 'octotest');
    deleteMyRepo('test-repo');
    logout();
});