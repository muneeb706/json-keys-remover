// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Functions which use later

/**
 * Get keys in json data
 */
export function getKeys(obj:Object, pre:string, keys:string[]){

	if(typeof obj !== "object" || Array.isArray(obj)){throw new Error("Incorrect parameter");}

	for(let key in obj){
		let addKEy = pre === '' ? key : pre+'.'+ key;
		keys.indexOf(addKEy) === -1 ? keys.push(addKEy) : null;
		if(typeof obj[key as keyof typeof obj] === "object"){
			getKeys(obj[key as keyof typeof obj], pre === '' ? key : pre+'.'+ key, keys);
		}
	}
} 

/**
 * Delete selected keys in json data
 */
export function deletePropByString(obj:Object, propString:string) {
				
	if(typeof obj !== "object" || Array.isArray(obj)){throw new Error("Incorrect parameter");}

	var prop, props = propString.split('.');

	for (var i = 0, iLen = props.length - 1; i < iLen; i++) {
		prop = props[i];
		
		var candidate = obj[prop as keyof typeof obj];
		if (candidate !== undefined) {
			obj = candidate;
		} else {
			break;
		}
	}
	if(!obj.hasOwnProperty(props[i])) { return; }
	delete obj[props[i] as keyof typeof obj];
}

/**
 * Parse json data and extract keys
 */
export function initJSONdata(stringJSONData:string) {
	// Variables
	try {
		let dataJsonArray = JSON.parse(stringJSONData);
		let keys: string[] = [];

		// get keys all object from array in json
		for (const dataJson of dataJsonArray) {
			getKeys(dataJson,'',keys);
		}

		return {
			parsedJSON: dataJsonArray,
			keys: keys
		};
	} catch (error) {
		throw new Error("Incorrect JSON format");
	}
	
}

/**
 * Extract selected keys from json data
 */
export function removeKeysinJSONData(parsedJSON:Array<Object>, selectedItems: string[]){

	if(selectedItems.length === 0){throw new Error("The selected list is empty");}

	// For selected keys in quickPick
	for (const key of selectedItems) {
		// For data in json
		for (const iterator1 of parsedJSON) {
			if(typeof iterator1 !== "object" || Array.isArray(iterator1)){throw new Error("Incorrect parameter");}

			deletePropByString(iterator1, key);
		}
	}
}



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// This line of code will only be executed once when your extension is activated
	console.log('"json-keys-remover" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable2 = vscode.commands.registerCommand('json-keys-remover.removeKeys', async () => {

		// The code you place here will be executed every time your command is executed
		try {

			// Const variable
			const editor = vscode.window.activeTextEditor;

			/* Checks
				*is active editor 
				*is active editor document is json
			*/
			if (!editor || editor.document.languageId !== 'json') {
				const selection = await vscode.window.showErrorMessage('Active file is not a json file', 'Try Again');

				if (selection !== undefined) {
					vscode.commands.executeCommand('json-keys-remover.removeKeys');
				}
				return; // no editor or no json file
			}

		
			const data = initJSONdata(editor.document.getText());
			vscode.window.showInformationMessage('JSON file parsed');
	
			// Create option for quickPick
			const options = data.keys.map(label => ({label}));

			// Create quickPick
			const quickPick = vscode.window.createQuickPick();
			quickPick.items = options;
			quickPick.canSelectMany = true;
			quickPick.ignoreFocusOut = true;

			// QuickPick event
			quickPick.onDidAccept(() =>{

				// Hide quickPick
				quickPick.hide();

				removeKeysinJSONData(data.parsedJSON, quickPick.selectedItems.map(t => t.label));

				// Modify active json document
				editor.edit(editBuilder => {
					// Delete all data
					editBuilder.delete(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(editor.document.lineCount-1, editor.document.lineAt(editor.document.lineCount-1).range.end.character)));

					// Write new json data to file
					editBuilder.insert(new vscode.Position(0, 0), JSON.stringify(data.parsedJSON, null, '\t'));
					vscode.window.showInformationMessage('Selected key(s) deleted from json');
				});
			});

			// Show quickPick
			quickPick.show();
		} catch (error) {
			console.error(error);
			const selection = await vscode.window.showErrorMessage((error as Error).message, 'Try Again');

			if (selection !== undefined) {
				vscode.commands.executeCommand('json-keys-remover.removeKeys');
			}
		}
		

	});
	context.subscriptions.push(disposable2);

	
}

// This method is called when your extension is deactivated
export function deactivate() {}
