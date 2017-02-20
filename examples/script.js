const logger = require('../src/Logger');
const {
    login,
    createOrgRepo,
    deleteOrgRepo,
    addToOrgTeam,
} = require('./../src/OctoWrappers');
const { students } = require('./new_students.json');

login().then((data) => {
    logger.info('-----------------------------');
    logger.info(` Hello ${data.username}!`);
    logger.info('-----------------------------');


    invite(students.pop())
});

function invite(member) {
    if (!member) {
        return;
    }

    logger.info(member);
    addToOrgTeam('rolling-scopes-school', 'Students', member)
        .then(() => {
            logger.info('done');
            invite(students.pop());
        })
        .catch((e) => logger.error(e));
}

