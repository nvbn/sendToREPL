const vscode = require('vscode');
let terminal;

function activate(context) {
    const config = vscode.workspace.getConfiguration('sendToREPL');
    const terminalName = 'SendToREPL terminal';

    const createTerminal = () => {
        terminal = vscode.window.createTerminal(terminalName);
        terminal.show();
    };

    createTerminal();

    const getCode = (textEditor) => {
        if (!textEditor.selection) {
            return;
        } else if (
            textEditor.selection.start.line === textEditor.selection.end.line
            && textEditor.selection.start.character === textEditor.selection.end.character
        ) {
            return textEditor.document.lineAt(textEditor.selection.start.line).text;
        } else {
            return textEditor.document.getText(textEditor.selection);
        }
    };

    const prepareCode = (code, languageId) => {
        const singleLineLanguages = config.get('singleLineLanguages').split(' ');
        
        if (singleLineLanguages.indexOf(languageId) !== -1) {
            return code.replace(/[\n\r]/g, ' ');
        } else {
            return code;
        }
    };

    const command = vscode.commands.registerTextEditorCommand('extension.sendToREPL', (textEditor) => {
        let code = getCode(textEditor);
        
        if (code) {
            code = prepareCode(code, textEditor.document.languageId);
            terminal.sendText(code, code[code.length - 1] !== '\n');
        }
    });

    context.subscriptions.push(command);

    vscode.window.onDidCloseTerminal((event) => {
        if (terminal && event.name === terminalName) {
            createTerminal();
        }
    });
}

exports.activate = activate;

function deactivate() {
    if (terminal) {
        terminal.dispose();
    }

}
exports.deactivate = deactivate;
