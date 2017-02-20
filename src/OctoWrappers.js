const octonode = require('octonode');
const { credentials, scopes } = require('../configs');
const { setInitialState, getData } = require('./UserData');


const auth = octonode.auth.config(credentials);
const client = octonode.client(credentials);
const ghme = client.me();

/**
 * Helper for promisification
 * @param resolve
 * @param reject
 * @param err
 * @returns {*}
 */
function promisify(resolve, reject, err) {
    if (err) {
        return reject(err);
    }

    return resolve();
}
/**
 *
 * @returns {Promise}
 */
function logout() {
    const userData = getData();
    const { id, login } = userData;

    return new Promise((resolve, reject) => {
        if (id) {
            auth.revoke(id, (err) => {
                if (err) {
                    return reject({ err, id, login });
                }

                setInitialState();
                return resolve({ id, login });
            });
        }

        resolve({ login });
    });
}
/**
 *
 * @returns {Promise}
 */
function login() {
    const userData = getData();

    return new Promise((resolve, reject) => {
        auth.login(scopes, (err, id, token) => {
            userData.id = id;
            userData.token = token;

            ghme.info((err, data) => {
                if (err) {
                    return reject(err);
                }

                userData.username = data.name;
                userData.login = data.login;

                return resolve({ username: userData.username, login: userData.login });
            });
        });
    });
}
/**
 * Creates repo for current user
 * @param name
 * @param description
 * @returns {Promise}
 */
function createMyRepo(name, description) {
    return new Promise((resolve, reject) => {
        ghme.repo({
            'name': name,
            'description': description || '',
        }, (err) => {
            return promisify(resolve, reject, err);
        });
    });
}
/**
 * Creates the org Repo with params
 *
 * const options = {
 +        description,
          auto_init,
          gitignore_template,
          private,
          collaborator
 +    };
 * @param orgName
 * @param repoName
 * @param config
 * @returns {Promise}
 */
function createOrgRepo(orgName, repoName, config = {}) {
    const {
        description = '',
        collaborator,
        auto_init = true,
        gitignore_template,
        private = true,
    } = config;
    const organization = client.org(orgName);

    return new Promise((resolve, reject) => {
        organization.repo({
            'name': repoName,
            description,
            auto_init,
            gitignore_template,
            private,
        }, (err) => {
            return promisify(resolve, reject, err);
        });
    }).then(() => {
        if (collaborator) {
            const cName = collaborator.name;
            const cPermissions = collaborator.permission;

            return organization.repo(repoName).addCollaborator(cName, { permission: cPermissions }, (err) => {
                if (err) {
                    return Promise.reject();
                }

                return Promise.resolve();
            });
        }
    });
}
/**
 *
 * @param orgName
 * @param repoName
 * @returns {Promise}
 */
function deleteOrgRepo(orgName, repoName) {
    return new Promise((resolve, reject) => {
        client.repo(`${orgName}/${repoName}`).destroy((err) => {
            return promisify(resolve, reject, err);
        });
    });
}
/**
 *
 * @param name
 * @returns {Promise}
 */
function deleteMyRepo(name) {
    const userData = getData();

    return new Promise((resolve, reject) => {
        client.repo(`${userData.login}/${name}`).destroy((err) => {
            return promisify(resolve, reject, err);
        });
    });
}
/**
 * Edit the repository
 * {
 *      name	             string	Required. The name of the repository
        description	         string	A short description of the repository
        homepage	         string	A URL with more information about the repository
        private	             boolean	Either true to make the repository private, or false to make it public. Creating private repositories requires a paid GitHub account. Default: false
        has_issues	         boolean	Either true to enable issues for this repository, false to disable them. Default: true
        has_wiki	         boolean	Either true to enable the wiki for this repository, false to disable it. Default: true
        default_branch	     String	Updates the default branch for this repository.
 * }
 * @param name
 * @param config
 * @returns {Promise}
 */
function updateRepo(name, config) {
    return new Promise((resolve, reject) => {
        client.repo(name).update(config, (err) => {
            return promisify(resolve, reject, err);
        });
    });
}
/**
 * Adds single file to the repository
 * @param repoName
 * @param fileName
 * @param commitMessage
 * @param content
 * @param [organization]
 * @returns {Promise}
 */
function addFile(repoName, fileName, commitMessage, content, organization) {
    const path = organization ? `${organization}/${repoName}` : repoName;

    return new Promise((resolve, reject) => {
        client.repo(path).createContents(fileName, commitMessage, content, (err) => {
            return promisify(resolve, reject, err);
        });
    })
}
/**
 * Adds user to the team at the organization
 * @param org
 * @param teamName
 * @param member
 * @returns {Promise}
 */
function addToTeam(org, teamName, member) {
    return new Promise((resolve, reject) => {
        client.org(org).teams((err, data) => {
            if (err) {
                return reject(err);
            }

            const team = data.find(item => item.name === teamName);

            if (!team) {
                return reject({
                    err: new Error('Team not found'),
                    data
                });
            }

            client.team(team.id).addMembership(member, (err) => {
                return promisify(resolve, reject, err);
            })

        });
    });
}
/**
 *
 * @param organization
 * @param teamName
 * @param member
 * @returns {Promise}
 */
function removeFromTeam(organization, teamName, member) {
    return new Promise((resolve, reject) => {
        client.org(organization).teams((err, data) => {
            if (err) {
                return reject(err);
            }

            const team = data.find(item => item.name === teamName);

            if (!team) {
                return reject({
                    err: new Error('Team not found'),
                    data
                });
            }

            client.team(team.id).removeUser(member, (err) => {
                return promisify(resolve, reject, err);
            })

        });


    });
}
/**
 * Adds or updates team permissions for repository
 * @param org
 * @param teamName
 * @param repo
 * @param permission
 * @returns {Promise}
 */
function addRepoForTeam(org, teamName, repo, permission) {
    return new Promise((resolve, reject) => {
        client.org(org).teams((err, data) => {
            if (err) {
                return reject(err);
            }

            const team = data.find(item => item.name === teamName);

            if (!team) {
                return reject({
                    err: new Error('Team not found'),
                    data
                });
            }
            client.put(`/teams/${team.id}/repos/${org}/${repo}`, { permission }, (err) => {
                return promisify(resolve, reject, err);
            });
        });
    });
}

module.exports = {
    auth,
    ghme,
    client,

    //main API
    login,
    logout,
    addFile,
    addToTeam,
    createMyRepo,
    deleteMyRepo,
    createOrgRepo,
    deleteOrgRepo,
    addRepoForTeam,
    removeFromTeam,
};
