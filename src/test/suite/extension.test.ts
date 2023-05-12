import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as extension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');


	/** 
	 * Function test
	 */

	// Check function getKeys
	test('getKeys "regular" check', () => {
		let obj = {
			'key1':'val',
			'key2':'val2',
			'key3':{
				'key1':'val12'
			},
			'key4':'val4'

		};
		const expectResponse = ['key1', 'key2', 'key3', 'key3.key1', 'key4']
		let keys: string[] = [];
		extension.getKeys(obj,'',keys);
		assert.deepStrictEqual(keys, expectResponse);
	});
	test('getKeys "paramater type" check', () => {

		let keys: string[] = [];

		// check number
		let objNumber = 30;
		assert.throws(() => extension.getKeys(objNumber,'',keys), Error, "Incorrect parameter");

		// check string
		let objString = "30";
		assert.throws(() => extension.getKeys(objString,'',keys), Error, "Incorrect parameter");

		// check array
		let objArray = [{
			'key1':'val',
			'key2':'val2',
			'key3':{
				'key1':'val12'
			},
			'key4':'val4'

		}];
		assert.throws(() => extension.getKeys(objArray,'',keys), Error, "Incorrect parameter");

	});

	// Check funciton deletePropByString
	test('deletePropByString "regular" check', () => {
		//
		let obj = {
			'key1':'val',
			'key2':'val2',
			'key3':{
				'key1':'val12'
			},
			'key4':'val4'

		};
		const expectResponse = {
			'key1':'val',
			'key2':'val2',
			'key3':{
				'key1':'val12'
			}
		};
		extension.deletePropByString(obj, 'key4');
		assert.deepStrictEqual(obj, expectResponse);

		//
		let obj2 = {
			'key1':'val',
			'key2':'val2',
			'key3':{
				'key1':'val12'
			},
			'key4':'val4'

		};
		const expectResponse2 = {
			'key1':'val',
			'key2':'val2',
			'key3':{},
			'key4':'val4'
		};
		extension.deletePropByString(obj2, 'key3.key1');
		assert.deepStrictEqual(obj2, expectResponse2);
	});
	test('deletePropByString "paramater type" check', () => {
		// check number
		let objNumber = 30;
		assert.throws(() => extension.deletePropByString(objNumber, 'key4'), Error, "Incorrect parameter");

		// check string
		let objString = "30";
		assert.throws(() => extension.deletePropByString(objString, 'key4'), Error, "Incorrect parameter");

		// check array
		let objArray = [{
			'key1':'val',
			'key2':'val2',
			'key3':{
				'key1':'val12'
			},
			'key4':'val4'

		}];
		assert.throws(() => extension.deletePropByString(objArray, 'key4'), Error, "Incorrect parameter");

	});

	// Check funciton initJSONdata
	test('initJSONdata "regular" check', () => {
		//
		let obj =  `
		[
			{
			  "key1": "val",
			  "key2": "val2",
			  "key3": {
			  "key1": "val12"
			  },
			  "key4": "val4"
			}
		]
		`;
		const expectResponse = {
			'parsedJSON':[
				{
					'key1':'val',
					'key2':'val2',
					'key3':{
						'key1':'val12'
					},
					'key4':'val4'
				}
			],
			'keys': ['key1', 'key2', 'key3', 'key3.key1', 'key4']
		};
		assert.deepStrictEqual(extension.initJSONdata(obj), expectResponse);

	});
	test('initJSONdata "incorrect json format" check', () => {
		//
		let obj =  `
		[
			{
			  "key1": "val",
			  "key2": "val2",
			  "key3": {
			  "key1": "val12"
			  },
			  "key4": "val4"
			}
		
		`;
		assert.throws(() => extension.initJSONdata(obj), Error, "Incorrect JSON format");

	});

	// Check funciton removeKeysinJSONData
	test('removeKeysinJSONData "regular" check', () => {
		//
		let obj = [{
			'key1':'val',
			'key2':'val2',
			'key3':{
				'key1':'val12'
			},
			'key4':'val4'

		},{
			'key1':'val',
			'key2':'val2',
			'key3':{
				'key1':'val12'
			},
			'key4':'val4'

		}];
		const expectResponse = [
			{
				'key2':'val2',
				'key3':{
					'key1':'val12'
				},
				'key4':'val4'
			},
			{
				'key2':'val2',
				'key3':{
					'key1':'val12'
				},
				'key4':'val4'
	
			}
		];
		extension.removeKeysinJSONData(obj, ['key1']);
		assert.deepStrictEqual(obj, expectResponse);

	});



});
