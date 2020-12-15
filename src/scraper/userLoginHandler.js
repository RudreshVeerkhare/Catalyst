const encrypt = require('./encrypt');
const vscode = require('vscode');
const debug = require('debug')('userLogin');

/**
 * @param {vscode.ExtensionContext} context 
 */
const getCredentials = async (context) => {
    const keys = encrypt.getSecret(context);
    if(!keys){
        const creds = await getLoginDataFromUser();
        return creds;
    }
    const encryptedCreds = await encrypt.getCredentialsFromSystem();
    if(!encryptedCreds){
        const creds = await getLoginDataFromUser();
        return creds;
    }

    const creds = encrypt.decrypt(encryptedCreds, keys);
    return creds;
}

/**
 * @param {vscode.ExtensionContext} context 
 */
const getLoginDataFromUser = async (context) => {
    // get user handle from user
    let handle, password;
    try{
        handle = await vscode.window.showInputBox({
            ignoreFocusOut: true, 
            prompt: "Enter email/handle for Codeforces login"
        });

        password = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            prompt: "Enter password for Codeforces login"
        });
        if (!handle || handle == "" || !password || password == "") throw new Error();
    } catch(err){
        debug(err);
        throw new Error("Invalid input");
    }

    // generate new keys
    const keys = encrypt.generateKeys();

    // save keys to globalState
    await encrypt.putSecret(context, keys);

    // encrypt password and handle
    const encryptedCreds = encrypt.encrypt({
        handle,
        password
    }, keys);

    // put this encrypted password into system
    await encrypt.saveCredentialsToSystem(encryptedCreds);

    return {handle, password};
}

module.exports = {
    getCredentials,
    getLoginDataFromUser
}