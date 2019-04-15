const logger = require('../src/Logger');
const {
    login,
    addFile,
    addRepoForTeam,
    createOrgRepo,
} = require('./../src/OctoWrappers');
const data = require('../students.json');
const students = data.students.map(item => item.replace('https://github.com/', ''));

const gitignore = '.idea\nnode_modules\n*.bundle.js\n*.log\n';
const editorconfig = 'root = true\n\n[*]\nend_of_line = lf\ninsert_final_newline = true\n[*.js]\n\ncharset = utf-8\nindent_style = space\nindent_size = 4\n';
const organization = 'rolling-scopes-school';

login().then((data) => {
    logger.info('-----------------------------');
    logger.info(` Hello ${data.username}!`);
    logger.info('-----------------------------');

    return createRepo(students.pop());
    
});

async function createRepo(user) {
    if (!user) {
        return;
    }

    const repoName = `${user}-2019Q1`;
    const options = {
        auto_init: true,
        gitignore_template: false,
        private: true,
        collaborator: {
            name: user,
            permission: 'push',
        }
    };

    try {
        await createOrgRepo(organization, repoName, options);
        await addRepoForTeam(organization, 'Mentors', repoName, 'push');
        await addRepoForTeam(organization, 'Trainers', repoName, 'push');
        await addFile(repoName, '.gitignore', 'feat: base .gitiginore', gitignore, organization);
        await addFile(repoName, '.editorconfig', 'feat: base .editorconfig', editorconfig, organization);

        logger.warn(user, ' added');
    } catch (e) {
        logger.error(user, JSON.stringify(e));
    }

    return createRepo(students.pop());
}