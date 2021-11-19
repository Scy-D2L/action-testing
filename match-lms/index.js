const core = require('@actions/core');
const github = require('@actions/github');
const lmsVersionHelper = require('./lms-version-helper');

try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = core.getInput('who-to-greet');
    console.log(`Hello ${nameToGreet}!`);
    core.setOutput("lmsVersion", lmsVersionHelper.tryGetActiveDevelopmentRelease())
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}