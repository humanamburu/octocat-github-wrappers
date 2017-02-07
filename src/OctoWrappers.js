const octonode = require('octonode');
const { credentials, scopes } = require('../configs');
const { setInitialState, getData } = require('./UserData');


const auth = octonode.auth.config(credentials);
const client = octonode.client(credentials);
const ghme = client.me();

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

function createMyRepo(name, description) {
    return new Promise((resolve, reject) => {
        ghme.repo({
            'name': name,
            'description': description || '',
        }, (err) => {
            if (err) {
                return reject(err);
            }

            return resolve();
        });
    });
}

function deleteMyRepo(name) {
    const userData = getData();

    return new Promise((resolve, reject) => {
        client.repo(`${userData.login}/${name}`).destroy((err) => {
            if (err) {
                return reject(err);
            }

            return resolve();
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
};
