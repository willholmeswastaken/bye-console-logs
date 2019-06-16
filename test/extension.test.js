/* global suite, test */

//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
const ConsoleClear = require('../consoleClear');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');

const testResourcesPath = path.join(__dirname, 'test-resources');

const configure = async () => {
	const doc = await vscode.workspace.openTextDocument(path.join(testResourcesPath, 'existingFile.js'));
	const editor = await vscode.window.showTextDocument(doc);
	const consoleClearer = new ConsoleClear();
	return {
		doc,
		editor,
		consoleClearer
	};
}

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function() {

	setup(() => {
		mkdirp.sync(testResourcesPath);
		fs.writeFileSync(path.join(testResourcesPath, 'existingFile.js'), 'Existing file! \n console.log("hi");');
	})

	teardown(() => {
		if(testResourcesPath !== '/') {
			rimraf.sync(testResourcesPath);
		}
	});

	// Defines a Mocha unit test
	test("Gets the right amount of console logs", async () => {
		const { editor, consoleClearer } = await configure();
		const linesToClear = consoleClearer.getLinesToClear(editor);
		assert.equal(1, linesToClear.length, 'Found the right amount of lines');
	});

	test("Removes the right amount of console logs", async () => {
		// Arrange
		const { editor, consoleClearer } = await configure();
		let linesToClear = consoleClearer.getLinesToClear(editor);

		assert.equal(vscode
			.window
			.activeTextEditor
			.document.
			getText()
			.split('\n')
			.length, 2, 'Found the right amount of lines in the file');

		// Act
		consoleClearer.performClear(editor, linesToClear);
		await vscode
			.window
			.activeTextEditor
			.document
			.save();

		linesToClear = consoleClearer
			.getLinesToClear(vscode
				.window
				.activeTextEditor);

		// Assert
		assert.equal(linesToClear.length, 0, 'No more console logs found');
	});
});
