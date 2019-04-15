const logger = require('../src/Logger');
const {
    login,
    addToTeam,
} = require('./../src/OctoWrappers');

const { users } = require('../users');

login().then((data) => {
    logger.info('-----------------------------');
    logger.info(` Hello ${data.username}!`);
    logger.info('-----------------------------');


    return addUsers(users);
});

const org = 'rolling-scopes-school';

async function addUsers(users) {
    for (let i = 0; i < users.length; i++) {
        const user = users[i].replace('https://github.com/', '');
        try {
            await addToTeam(org, 'Mentors', user);
            console.log(user, ' added');
        } catch (e) {
            console.error(user, e.message);
        }
    }
}