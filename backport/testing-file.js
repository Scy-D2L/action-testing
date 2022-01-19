//This file is never called anywhere, just adding it to test something
const { Octokit } = require('@octokit/rest');

const release = `v${process.argv[2]}`;
const [owner, repo] = process.env['GITHUB_REPOSITORY'].split('/');

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN
});

async function createRelease() {

	console.log(`Creating release "${release}"...`)
	console.log('Some Change Happened Here :D');

	await octokit.repos.createRelease({
		owner: owner,
		repo: repo,
		tag_name: release,
		name: release
	});
	console.log('Success!');

}

createRelease().then(() => {
	process.exit(0);
}).catch((err) => {
	console.error(err);
	process.exit(1);
});
