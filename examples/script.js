const logger = require('../src/Logger');
const {
    login,
    addFile,
    addRepoForTeam,
    createOrgRepo,
} = require('./../src/OctoWrappers');
const { students } = require('./new_students.json');

const gitignore = '.idea\nnode_modules\n*.bundle.js\n*.log\n';
const editorconfig = 'root = true\n\n[*]\nend_of_line = lf\ninsert_final_newline = true\n[*.js]\n\ncharset = utf-8\nindent_style = space\nindent_size = 4\n';
const organization = 'rolling-scopes-school';

login().then((data) => {
    logger.info('-----------------------------');
    logger.info(` Hello ${data.username}!`);
    logger.info('-----------------------------');


    createRepo(students.pop());
});

function createRepo(user) {
    if (!user) {
        return;
    }

    const repoName = `${user}-front-end-course`;
    const options = {
        auto_init: true,
        gitignore_template: false,
        private: true,
        collaborator: {
            name: user,
            permission: 'push',
        }
    };

    createOrgRepo(organization, repoName, options)
        .then(() => {
            return addRepoForTeam(organization, 'Mentors', repoName, 'push');
        })
        .then(() => {
            return addRepoForTeam(organization, 'Trainers', repoName, 'push');
        })
        .then(() => {
            return addFile(repoName, '.gitignore', 'feature: base .gitiginore', gitignore, organization);
        })
        .then(() => {
            return addFile(repoName, '.editorconfig', 'feature: base .editorconfig', editorconfig, organization)
        })
        .then(() => {
            logger.warn(user, ' DONE!');
            createRepo(students.pop());
        })
        .catch((e) => {
            logger.error(user, JSON.stringify(e));
            createRepo(students.pop());
        });

}