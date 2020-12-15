const vscode = require('vscode');

const channel = vscode.window.createOutputChannel('catalyst');

const append = (data) => {
    channel.append(data);
}

const write = (data) => {
    channel.clear();
    channel.append(data);
}

const show = () => {
    channel.show();
}

const hide = () => {
    channel.hide();
}

module.exports = {
    append,
    write,
    hide,
    show
}