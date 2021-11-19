const core = require('@actions/core');
const github = require('@actions/github');
const lmsVersionHelper = require('./lms-version-helper');

try {
    const version = await lmsVersionHelper.tryGetActiveDevelopmentRelease()
    console.log(version + ' tryGetActiveDevelopmentRelease');
    core.setOutput("lmsVersion", version);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    //console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}