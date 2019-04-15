const logger = require('../src/Logger');
const {
    login,
    getOrgRepos,
    deleteOrgRepo,
} = require('./../src/OctoWrappers');

login().then((data) => {
    logger.info('-----------------------------');
    logger.info(` Hello ${data.username}!`);
    logger.info('-----------------------------');


    cleanup();
});
const org = 'rolling-scopes-school';

async function cleanup() {
    const repos = await getOrgRepos(org, {
        per_page: 100,
        page: 6,
    });

    console.log(repos.map(r => r.name));
    const toDelete = repos.filter((repo) => repo.name.match(/-ST2018/));

    for (let i = 0; i < toDelete.length; i++) {
        const repoName = toDelete[i].name;
        try {
            await deleteOrgRepo(org, repoName);
            console.log(repoName, ' deleted');
        } catch (e) {
            console.error(repoName, e.message);
        }
    }
}