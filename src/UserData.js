const initialState = {
    userID: '',
    userToken: '',
    username: '',
    login: '',
};

let data = Object.assign({}, initialState);

function setInitialState(obj) {
    data = obj || initialState;
}

function getData() {
    return data;
}

module.exports = {
    setInitialState,
    getData,
};