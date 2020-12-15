const client = require('./client');
const vscode = require('vscode');
const socket = require('./websocket');

const Submit = async (problem, credentials, progressHandler) => {

    progressHandler.report({
        increment: 10,
        message: "Logging in Codeforces..."
    });
    const auth = {
        ftaa: client.getFtaa(),
        bfaa: client.getBfaa(),
        csrf_token: await client.getCsrfToken(),
        tta: client.getTta()
    }

    let [res, success] = await client.login(credentials, auth);
    if(!success) {
        throw new Error("Login Failed, Check Your Internet connection");
    }

    // checking if login succes
    const [loginErrText, isLoginErr] = client.isLoginError(res);
    if(isLoginErr){
        progressHandler.report({
            increment: 10,
            message: `${loginErrText} (use "Update Login Details" command)`
        });
        return false;
    }
    progressHandler.report({
        increment: 10,
        message: "Login Successful.."
    });
    // refreshing csrf token and getting channels
    progressHandler.report({
        increment: 10,
        message: "Submitting to Codeforces.."
    });
    const data = await client.getChannelsAndCsrf(problem.submitUrl);
    auth.csrf_token = data.csrf_token;
    // starting websockets 
    const promise = socket.connect(data.channels, progressHandler);

    [res, success] = await client.submit(problem, auth);
    if(!success) throw new Error('Submit Failed, Check your internet connection');
    
    // checking for submission submission
    const [submitErrText, isSubmitErr] = client.isSubmitError(res);
    if(isSubmitErr){
        progressHandler.report({
            increment: 10,
            message: submitErrText
        });
        return false;
    }

    // waits till result arrive
    await promise;
    return true;
}

module.exports = Submit;