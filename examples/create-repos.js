const logger = require('./../src/Logger');
const {
    login,
    createOrgRepo,
    deleteOrgRepo,
} = require('./../src/OctoWrappers');

login().then((data) => {
    logger.info('-----------------------------');
    logger.info(` Hello ${data.username}!`);
    logger.info('-----------------------------');

    deleteOrgRepo('rolling-scopes-school', 'octotest')
        .then(data => logger.info('Successfully deleted!'));
    //createMyRepo('test-repo', 'octotest');
    //deleteMyRepo('test-repo');
});

