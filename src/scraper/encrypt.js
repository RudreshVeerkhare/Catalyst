const vscode = require('vscode');
const keytar = require('keytar');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const debug = require('debug')('encrypt');
/**
 * gets the secret keys from extension context
 * @param {vscode.ExtensionContext} context 
 */
const getSecret = (context) => {
    const folder = context.globalStorageUri.fsPath;
    const secretPath = path.join(folder, 'secret');
    
    if (!fs.existsSync(secretPath)){
        console.log("secret file does't exist");
        return null;
    }

    const [secretKey, iv] = fs.readFileSync(secretPath).toString().split(" ");
    if (!secretKey || !iv){
        console.log('secret file corrupted');
        return null;
    }

    return [secretKey, iv];
}

/**
 * puts the secret keys to extension context
 * @param {vscode.ExtensionContext} context 
 * @param {Array} keys [secretKey, iv]
 */
const putSecret = async (context, keys) => {
    const folder = context.globalStorageUri.fsPath;
    if(!fs.existsSync(folder)){
        fs.mkdirSync(folder);
    }
    debug(folder)

    const secretPath = path.join(folder, 'secret');
    const [secretKey, iv] = keys;
    
    // writing the secret key
    fs.writeFileSync(secretPath, `${secretKey} ${iv}`);
}

/**
 * generate random keys 
 */
const generateKeys = () => {
    const secretKey = crypto.randomBytes(16).toString('hex');
    const iv = crypto.randomBytes(8).toString('hex');

    return [secretKey, iv];
}

/**
 * encrypts the credentials
 * @param {Object} credentials 
 * @param {Array} keys 
 */
const encrypt = (credentials, keys) => {
    const [secretKey, iv] = keys;
    
    let cipherHandle = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encryptedHandle = cipherHandle.update(credentials.handle, 'utf-8', 'hex');
    encryptedHandle += cipherHandle.final('hex');

    let cipherPassword = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
    let encryptedPassword = cipherPassword.update(credentials.password, 'utf-8', 'hex');
    encryptedPassword += cipherPassword.final('hex');

    const encryptedCredentials = {
        handle: encryptedHandle,
        password: encryptedPassword
    }

    return encryptedCredentials;
}

/**
 * decrypts the credentials
 * @param {Object} encryptedCredentials 
 * @param {Array} keys 
 */
const decrypt = (encryptedCredentials, keys) => {
    const [secretKey, iv] = keys;
    
    let decipherHandle = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
    let decryptedHandle = decipherHandle.update(encryptedCredentials.handle, 'hex', 'utf8');
    decryptedHandle += decipherHandle.final('utf8');

    let decipherPassword = crypto.createDecipheriv('aes-256-cbc', secretKey, iv);
    let decryptedPassword = decipherPassword.update(encryptedCredentials.password, 'hex', 'utf8');
    decryptedPassword += decipherPassword.final('utf8');

    const credentials = {
        handle: decryptedHandle,
        password: decryptedPassword
    }

    return credentials;
}

const saveCredentialsToSystem = async (encryptedCredentials) => {
    const service = 'catalyst';
    const handle = keytar.setPassword(service, 'handle', encryptedCredentials.handle);
    const password = keytar.setPassword(service, 'password', encryptedCredentials.password);
    await Promise.all([handle, password]);
}

const getCredentialsFromSystem = async () => {
    const service = 'catalyst';
    const handleProm = keytar.getPassword(service, 'handle');
    const passwordProm = keytar.getPassword(service, 'password');
    const [handle, password] = await Promise.all([handleProm, passwordProm]);
    debug("got credentials from system", [handle, password]);
    if(!handle || !password){
        return null;
    }

    return {handle, password};
}

module.exports = {
    getSecret,
    getCredentialsFromSystem,
    decrypt,
    generateKeys,
    putSecret,
    encrypt,
    saveCredentialsToSystem

}