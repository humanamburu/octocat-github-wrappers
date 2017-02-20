const logger = require('../src/Logger');
const {
    login,
    addRepoToOrgTeam,
} = require('./../src/OctoWrappers');
const { students } = require('./new_students.json');

login().then((data) => {
    logger.info('-----------------------------');
    logger.info(` Hello ${data.username}!`);
    logger.info('-----------------------------');


    addRepoToOrgTeam('rolling-scopes-school', 'core', 'finite-state-machine', 'push')
        .then(() => {
            logger.info('done');
        })
        .catch((e) => logger.error(JSON.stringify(e)));
});
