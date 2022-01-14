import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	
	var history: string[] = [];
	var position: number = -1;

	function historyPush(content: string) {
		history.push(content);
		while (history.length > 10) {
			history.shift();
		}
		position = history.length - 1;
	}

	context.subscriptions.push(vscode.commands.registerCommand('clipcycle.copy', () => {
		vscode.commands.executeCommand("editor.action.clipboardCopyAction").then(() => {
			vscode.env.clipboard.readText().then(content => {
				historyPush(content);
			});	
		});	
	}));

	context.subscriptions.push(vscode.commands.registerCommand('clipcycle.cut', () => {
		vscode.commands.executeCommand("editor.action.clipboardCutAction").then(() => {
			vscode.env.clipboard.readText().then(content => {
				historyPush(content);
			});	
		});	
	}));

	context.subscriptions.push(vscode.commands.registerCommand('clipcycle.cyclePaste', async () => {
		let editor = vscode.window.activeTextEditor;
		if (history.length > 0 && editor) {
			position = position >= 0 && position < history.length ? position : history.length - 1;
			var last = history[position];
			if (last) {	
				await vscode.env.clipboard.writeText(last);
				
				var oldSelections = editor.selections.map(s => new vscode.Selection(s.anchor, s.end));

				await vscode.commands.executeCommand("editor.action.clipboardPasteAction");

				editor.selections = editor.selections.map((s, i) => new vscode.Selection(
					oldSelections[i].anchor.line,
					oldSelections[i].anchor.character,
					s.anchor.line,
					s.anchor.character));
			}
			position--;
		}
		else {
			vscode.commands.executeCommand("editor.action.clipboardPasteAction");
		}
	}));

}

export function deactivate() {}
