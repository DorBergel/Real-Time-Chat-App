function logInfoMsg (msg) {
    console.log(`[${arguments.callee.caller.name}]\tINFO - ${msg}`);
}
function logErrorMsgWithStack (msg) {
    const error = new Error();
    const stack = error.stack.split('\n')[2].trim();
    console.log(`[${arguments.callee.caller.name}]\tERROR - ${msg}\n\tat ${stack}`);
}
function logErrorMsg (msg) {
    //console.log(`[${arguments.callee.caller.name}]\tERROR - ${msg}`);
    const error = new Error();
    const stack = error.stack.split('\n')[2].trim();
    console.log(`[${arguments.callee.caller.name}]\tERROR - ${msg}\n\tat ${stack}`);
}

function logDebugMsg (msg) {
    console.log(`[${arguments.callee.caller.name}]\tDEBUG - ${msg}`);
}

module.exports = {logInfoMsg, logErrorMsg, logDebugMsg};