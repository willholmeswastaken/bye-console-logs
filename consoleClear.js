const vscode = require("vscode");

class ConsoleClear {    
    async confirmClear() {
        const editor = vscode
            .window
            .activeTextEditor;

        const linesToClear = this.getLinesToClear(editor);

        const lineText = linesToClear.length > 1
            ? `${linesToClear.length} console logs`
            : `${linesToClear.length} console log`;

        const intentToClear = await vscode
            .window
            .showQuickPick(['Yes', 'No'],
                { placeHolder: `We have found ${lineText}, would you like to clear them?`});
        
        if(intentToClear === 'Yes') {
            this.performClear(editor, linesToClear);
            vscode
            .window
            .showInformationMessage(`${lineText} cleared!`)
        }
    }

    getLinesToClear(editor) {
        if(!editor) {
            vscode
                .window
                .showErrorMessage("There is no open text editor to clear!");
            return;
        }

        const text = editor
            .document
            .getText();

        const regex = /(console.log\(\)|console.log\(.+\))/;

        let endOfFile = false;
        let iteratedLine = 0;
        const documentLines = [];
        const linesToClear = [];

        while(!endOfFile) {
            try {
                const line = editor
                    .document
                    .lineAt(iteratedLine);
                iteratedLine++;
                documentLines.push(line);
            } catch {
                endOfFile = true;
            }
        }

        for(let i = 0; i < documentLines.length; i++) {
            const line = documentLines[i];
            if(regex.test(line.text)) {
                linesToClear.push(line);
            }
        }
        return linesToClear;
    }

    performClear(editor, linesToClear) {
        editor.edit(editBuilder => {
            linesToClear.map(line => {
                editBuilder.delete(line.range);
            });
        });
    }
}

module.exports = ConsoleClear;