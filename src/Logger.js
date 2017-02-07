const colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

function log(type, ...msg) {
    console.log(msg.join('')[type]);
}

module.exports = {
    info: log.bind(null, 'info'),
    data: log.bind(null, 'data'),
    warn: log.bind(null, 'warn'),
    help: log.bind(null, 'help'),
    error: log.bind(null, 'error'),
    prompt: log.bind(null, 'prompt'),
};