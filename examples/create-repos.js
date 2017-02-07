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

    const options = {
        description: 'octotest',
        files: [
            {
                name: '.gitignore',
                commitMessage: 'gitignore commit',
                content: '.idea'
            },
            {
                name: '.eslint',
                commitMessage: 'eslint commit',
                content: 'no spaces'
            }
        ],
        params: {
            private: true,
        }
    };

    deleteOrgRepo('rolling-scopes-school', 'octorepo')
    //createOrgRepo('rolling-scopes-school', 'octorepo', options)
        .then(data => logger.info('Successfully created!'));
});

