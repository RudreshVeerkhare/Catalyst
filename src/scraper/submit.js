const client = require('./client');
const socket = require('./websocket');
const userLoginHandler = require('./userLoginHandler');
const httpSubmitStatus = require('./httpSubmitStatus');

const LOGIN_URL = 'https://codeforces.com/enter';
const HOME_PAGE = 'https://codeforces.com';

const Submit = async (context, problem, progressHandler) => {
    let statusPromise, resultPromise;
    progressHandler.report({
        increment: 10,
        message: "Loading Cookies..."
    });
    client.loadCookies(context);
    const auth = await client.loadAuth(context);
    // setting progress handler to sockets
    socket.setProgressHandler(progressHandler);
    // refreshing csrf token and getting channels
    progressHandler.report({
        increment: 10,
        message: "Getting CSRF token..."
    });
    let data = await client.getChannelsAndCsrf(problem.submitUrl);
    console.log(data);
    try {
        // resultPromise = socket.connectResultSocket(data.channels);
        statusPromise = _submit(auth, context, data, problem, progressHandler);

        await statusPromise;

        socket.closeSockets();
        return true;
    } catch (err) {
        socket.closeSockets();
        throw err;
    }

}


const _submit = async (auth, context, data, problem, progressHandler) => {


    // ========================TRY-SUBMIT================================//

    let res = await attemptSubmit({ ...auth, csrf_token: data.csrf_token }, problem, progressHandler);

    // =======================LOGIN-IF-FAILED============================//
    // todo: check if csrf token need to be refreshed
    console.log(res.config.url, problem.submitUrl);
    if (res.config.url == LOGIN_URL || res.config.url == HOME_PAGE) {
        await login(auth, context, progressHandler);
        progressHandler.report({
            increment: 10,
            message: "Getting CSRF token..."
        });
        data = await client.getChannelsAndCsrf(problem.submitUrl);
        res = await attemptSubmit({ ...auth, csrf_token: data.csrf_token }, problem, progressHandler);
    }

    // =============================AFTER-SUBMIT==================================//
    const subId = afterSubmit(progressHandler, res);

    // const statusPromise = socket.connectStatusSocket(data.s_channels, subId);
    const httpStatusPromise = httpSubmitStatus.getUpdate(progressHandler, subId);

    await httpStatusPromise;
}

const attemptSubmit = async (auth, problem, progressHandler) => {

    progressHandler.report({
        increment: 10,
        message: "Submitting to Codeforces..."
    });
    let [res, success] = await client.submit(problem, auth);
    if (!success) {
        progressHandler.report({
            increment: 100,
            message: res.message
        });
        console.log("Submit Failed due to Network issue", res);
        throw new Error("Submit Failed due to Network issue");
    }

    return res;
}

const afterSubmit = (progressHandler, res) => {
    // checking for submission submission
    const [submitErrText, isSubmitErr] = client.isSubmitError(res);
    if (isSubmitErr) {
        // socket.closeConnection();
        progressHandler.report({
            increment: 100,
            message: submitErrText
        });
        throw new Error(submitErrText);
    }
    const submissionId = client.getSubmissionId(res);
    console.log(`Submission Id =>> ${submissionId}`);

    return submissionId;
}

const login = async (auth, context, progressHandler) => {
    progressHandler.report({
        message: "Getting Credentials.."
    });
    const credentials = await userLoginHandler.getCredentials(context);

    progressHandler.report({
        message: "Logging in Codeforces..."
    });
    console.log('wating logging in')
    let [res, success] = await client.login(credentials, auth);
    console.log('got result', success);
    if (!success) {
        throw new Error("Login Failed, Check Your Internet connection");
    }

    // checking if login succes
    const [loginErrText, isLoginErr] = client.isLoginError(res);
    console.log('got result', success);

    if (isLoginErr) {
        console.log(loginErrText);
        throw new Error(`${loginErrText} (use "Update Login Details" command)`);
    }

    progressHandler.report({
        message: "Login Successful..."
    });
}

module.exports = Submit;