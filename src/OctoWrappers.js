const octonode = require('octonode');
const { credentials, scopes } = require('../configs');
const { setInitialState, getData } = require('./UserData');


const auth = octonode.auth.config(credentials);
const client = octonode.client(credentials);
const ghme = client.me();

function promisify(resolve, reject, err) {
    if (err) {
        return reject(err);
    }

    return resolve();
}

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
 *
 *  todo: refactor to common logic
 *
 * **/
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

function createOrgRepo(orgName, repoName, config = {}) {
    const {
        description = '',
        params,
        files,
    } = config;
    const repoPath = `${orgName}/${repoName}`;

    return new Promise((resolve, reject) => {
        client.org(orgName).repo({
            'name': repoName,
            'description': description || '',
        }, (err) => {
            return promisify(resolve, reject, err);
        });
    }).then(() => {
        if (params) {
            return updateRepo(repoPath, params);
        }
    }).then(() => {
        /**
         * WARNING:
         *
         * THIS IS PIECE OF SHIT!
         * WIP!
         *
         * PLEASE CLOSE YOUR EYES HERE
         *
         */
        if (files) {
            return addFile(repoPath, files[0].name, files[0].commitMessage, files[0].content)
                .then(() => {
                    return addFile(repoPath, files[1].name, files[1].commitMessage, files[1].content);
                });
        }
        /**
         *
         * OPEN HERE
         *
         */
    });
}

function deleteOrgRepo(orgName, repoName) {
    return new Promise((resolve, reject) => {
        client.repo(`${orgName}/${repoName}`).destroy((err) => {
            return promisify(resolve, reject, err);
        });
    });
}

function deleteMyRepo(name) {
    const userData = getData();

    return new Promise((resolve, reject) => {
        client.repo(`${userData.login}/${name}`).destroy((err) => {
            return promisify(resolve, reject, err);
        });
    });
}

function updateRepo(name, config) {
    return new Promise((resolve, reject) => {
        client.repo(name).update(config, (err) => {
            return promisify(resolve, reject, err);
        });
    });
}

function addFile(repoName, fileName, commitMessage, content) {
    return new Promise((resolve, reject) => {
        client.repo(repoName).createContents(fileName, commitMessage, content, (err) => {
            return promisify(resolve, reject, err);
        });
    })
}

function addToOrgTeam(org, teamName, member) {
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

function removeFromOrgTeam(organization, teamName, member) {
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

function addRepoToOrgTeam(org, teamName, repo, permission) {
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
    createMyRepo,
    deleteMyRepo,
    createOrgRepo,
    deleteOrgRepo,
    addToOrgTeam,
    removeFromOrgTeam,
    addRepoToOrgTeam,
};
