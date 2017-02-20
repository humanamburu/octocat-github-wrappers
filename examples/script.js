const logger = require('../src/Logger');
const {
    login,
    addFile,
    addRepoForTeam,
    createOrgRepo,
} = require('./../src/OctoWrappers');

login().then((data) => {
    logger.info('-----------------------------');
    logger.info(` Hello ${data.username}!`);
    logger.info('-----------------------------');

    const organization = 'rolling-scopes-school';
    const options = {
        description: 'Test repo with collaborator',
        auto_init: true,
        gitignore_template: 'Node',
        private: true,
        collaborator: {
            name: 'humanamburu',
            permission: 'push',
        }
    };
    const repoName = 'humanamburu-frontend-course';

    createOrgRepo(organization, repoName, options)
        .then(() => {
            return addRepoForTeam(organization, 'core', repoName, 'push').then(() => {
                return addFile(repoName, '.eslint', 'eslint', '.idea \n node_modules', organization);
            });
        }).then(() => {
            logger.warn('DONE!');
        })
        .catch((e) => logger.error(JSON.stringify(e)));
});
