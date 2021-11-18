import 'lms-version-helper.js'
/* eslint no-console: "off" */

'use strict';

const chalk = require('chalk'),
	{ Octokit } = require('@octokit/rest');

//  https://github.com/octokit/rest.js
//  https://octokit.github.io/rest.js/
const gh = new Octokit({
	auth: `token ${process.env.GITHUB_TOKEN}`
});

const owner = 'Brightspace';
const repo = 'brightspace-integration';
const versionChecker = /^20\.[0-9]{2}\.(1|2|3|4|5|6|7|8|9|10|11|12)$/;
const skipReleaseFlag = '[skip release]';


async function tryFindMaxVersion(release) {

	const releaseRe = new RegExp('^v' + release.replace('.', '\\.') + '-([0-9]+)$');

	const options = gh.repos.listReleases.endpoint.merge({
		'owner': owner,
		'repo': repo,
		'per_page': 100
	});
	let releases;
	try {
		releases = await gh.paginate(
			options,
			response => response.data.map(release => release.tag_name)
		);
	} catch (e) {
		console.error(chalk.red(e));
		process.exitCode = 1;
		return null;
	}

	let maxVersion = 0;
	for (let i = 0; i < releases.length; i++) {
		const match = releaseRe.exec(releases[i]);
		if (match) {
			const version = parseInt(match[1]);
			if (version > maxVersion) {
				maxVersion = version;
			}
		}
	}

	console.log(`Maximum existing build for release "${release}" is "${maxVersion}".`);
	return maxVersion;

}

async function createRelease(newTag) {
	console.log(chalk.green(`Creating release "${newTag}..."`));
	try {
		await gh.repos.createRelease({
			'owner': owner,
			'repo': repo,
			'tag_name': newTag,
			'name': newTag,
			'target_commitish': process.env.TRAVIS_COMMIT
		});
	} catch (e) {
		console.error(chalk.red(e));
		process.exitCode = 1;
	}
}

async function main() {

	console.log('Attempting to automatically tag BSI release...');
	console.group();

	const skipRelease = (process.env.TRAVIS_COMMIT_MESSAGE.toLowerCase().indexOf(skipReleaseFlag) > -1);
	if (skipRelease) {
		console.log(`"${skipReleaseFlag}" present in commit message, aborting auto-tag.`);
		console.groupEnd();
		return;
	}

	const isTaggedCommit = (process.env.TRAVIS_TAG !== '');
	if (isTaggedCommit) {
		console.log('Tagged commit, aborting auto-tag.');
		console.groupEnd();
		return;
	}

	const isPullRequest = (process.env.TRAVIS_PULL_REQUEST !== 'false');
	if (isPullRequest) {
		console.log('Pull request, aborting auto-tag.');
		console.groupEnd();
		return;
	}

	const isFork = (process.env.TRAVIS_SECURE_ENV_VARS === 'false');
	if (isFork) {
		console.log('Cannot publish from forks, aborting auto-tag.');
		console.groupEnd();
		return;
	}

	const branchName = process.env.TRAVIS_BRANCH;
	const isMaster = (branchName === 'master');

	let release;
	if (isMaster) {
		console.log('Master branch detected.');
		release = await tryGetActiveDevelopmentRelease();
		if (release === null) {
			console.log('Aborting auto-tag.');
			console.groupEnd();
			return;
		}
	} else {
		console.log(`Branch detected: "${branchName}".`);
		if (!versionChecker.test(branchName)) {
			console.log(`Branch name "${branchName}" not a valid version, aborting auto-tag.`);
			console.groupEnd();
			return;
		}
		release = branchName;
	}

	let maxVersion = await tryFindMaxVersion(release);
	if (maxVersion === null) {
		console.log('Aborting auto-tag.');
		console.groupEnd();
		return;
	}

	const newTag = `v${release}-${++maxVersion}`;
	createRelease(newTag);
	console.groupEnd();

}

main();
