const core = require('@actions/core');
const github = require('@actions/github');
const lmsVersionHelper = require('./lms-version-helper');

async function run() {
    try {
        const version = await lmsVersionHelper.tryGetActiveDevelopmentRelease()
        console.log(version + ' tryGetActiveDevelopmentRelease');
        core.setOutput("lms-version", version);
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();