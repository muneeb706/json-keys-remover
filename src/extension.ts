// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// Functions which use later
interface tag {
	tag:string;
	has:Array<string>
}
/**
 * Get keys in json data
 */
export function getKeys(obj:any, pre:string, keys:string[]){

	// console.log(obj.tag);
	pre += obj.tag + ".";

	if (Array.isArray(obj.val)) {
		// console.log("array");
		for (let index = 0; index < obj.val.length; index++) {
			const element = obj.val[index];
			getKeys({
				tag:index,
				val:element
			}, pre, keys);
		}
	
	}
	//Hep objenin içindekilere ! koyunuyor.
	//Gidebildiği kadar gidiyor.Her bölündüğünde bölünen her parça için en uca kadar gidiyor.
	//Her ünlem koyduğunda keys a push la
	else if(typeof obj.val === 'object'){
		// console.log("object");
		for (var key of Object.keys(obj.val)) {

			// let addKEy = pre === '' ? `['object'][${key}]` : pre+'.'+ `['object'][${key}]`;
			// console.log(addKEy);
			keys.push(pre+`[${key}]`)
			getKeys({
				tag:`[${key}]`,
				val:obj.val[key]
			}, pre, keys);
		}
	}
} 
/**
 * Delete selected keys in json data
 */
export function deletePropByString(obj:Object, propString:string) {
				
	// if(typeof obj !== "object" || Array.isArray(obj)){return;}

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
	if(stringJSONData.trim() === ""){throw new Error("Empty JSON File");}
	let dataJsonArray = ""
	try {
		dataJsonArray = JSON.parse(stringJSONData);
	} catch (error) {
		// console.error(error)
		throw new Error("Incorrect JSON format");
	}

	let keys: string[] = [];
	getKeys(
		{
			tag:"root",
			val:dataJsonArray
		}
		,'',keys);

	if(keys.length === 0){throw new Error("No found keys");}

	return {
		parsedJSON: dataJsonArray,
		keys: keys
	};
	
}

/**
 * Extract selected keys from json data
 */
export function removeKeysinJSONData(parsedJSON:any, selectedItems: string[], tags:Array<tag>){

	if(selectedItems.length === 0){throw new Error("The selected list is empty");}

	for (const key of selectedItems) {
		tags.filter(x => x.tag === key).forEach(x => {
			for (const iterator2 of x.has) {
				deletePropByString(parsedJSON, iterator2);
			}
		});
	}
}

/**
 * Separate the tags
 */
export function separateTheTags(keys:string[]){
	let showingTag: Array<tag> = [];
	keys.forEach(x => {
		var matches = x.match(/\[([^\]]*)\]/g)?.join('.').replace(/[\[\]']+/g,'');
		if(matches === undefined){return};
		let seacrh = showingTag.findIndex(y => y.tag === matches);
		if(seacrh === -1){
			showingTag.push({
				tag:matches,
				has:[x.replace("root.",'').replace(/[\[\]']+/g,'')]
			});
		}
		else if(seacrh !== -1)
		{
			showingTag[seacrh].has.push(x.replace("root.",'').replace(/[\[\]']+/g,''));
		}
	})
	return showingTag;
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
			console.log(data)
			vscode.window.showInformationMessage('JSON file parsed');
	
			// Create option for quickPick
			
			let showingTag = separateTheTags(data.keys);
			
			const options = Array.from(showingTag, x => {
				return({label:x.tag});
			});

			// Create quickPick
			const quickPick = vscode.window.createQuickPick();
			quickPick.items = options;
			quickPick.canSelectMany = true;
			quickPick.ignoreFocusOut = true;

			// QuickPick event
			quickPick.onDidAccept(() =>{

				// Hide quickPick
				quickPick.hide();


				removeKeysinJSONData(data.parsedJSON, quickPick.selectedItems.map(t => t.label), showingTag);

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
