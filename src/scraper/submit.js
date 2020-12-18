const client = require('./client');
const socket = require('./websocket');
const userLoginHandler = require('./userLoginHandler');

const LOGIN_URL = 'https://codeforces.com/enter';

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

    try {
        resultPromise = socket.connectResultSocket(data.channels);
        statusPromise = _submit(auth, context, data, problem, progressHandler);

        await Promise.race([resultPromise, statusPromise]);
        
        socket.closeSockets();
        return true;
    } catch(err) {
        socket.closeSockets();
        throw err;
    }
    
}


const _submit = async (auth, context, data, problem, progressHandler) => {


    // ========================TRY-SUBMIT================================//

    let res = await attemptSubmit({...auth, csrf_token: data.csrf_token}, problem, progressHandler);

    // =======================LOGIN-IF-FAILED============================//
    // todo: check if csrf token need to be refreshed
    if(res.config.url == LOGIN_URL){
        await login(auth, context, progressHandler);
        res = await attemptSubmit({...auth, csrf_token: data.csrf_token}, problem, progressHandler);
    }

    // =============================AFTER-SUBMIT==================================//
    const subId = afterSubmit(progressHandler, res);

    const statusPromise = await socket.connectStatusSocket(data.s_channels, subId);
}

const attemptSubmit = async (auth, problem, progressHandler) => {
    
    progressHandler.report({
        increment: 10,
        message: "Submitting to Codeforces..."
    });
    let [res, success] = await client.submit(problem, auth);
    if(!success){
        progressHandler.report({
            increment: 100,
            message: res.message
        });
        throw new Error("Submit Failed due to Network issue");
    }

    return res;
}

const afterSubmit =  (progressHandler, res) => {
    // checking for submission submission
    const [submitErrText, isSubmitErr] = client.isSubmitError(res);
    if(isSubmitErr){
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

    let [res, success] = await client.login(credentials, auth);
    if(!success) {
        throw new Error("Login Failed, Check Your Internet connection");
    }

    // checking if login succes
    const [loginErrText, isLoginErr] = client.isLoginError(res);
    if(isLoginErr)
        throw new Error(`${loginErrText} (use "Update Login Details" command)`);


    progressHandler.report({
        message: "Login Successful..."
    });
}

module.exports = Submit;