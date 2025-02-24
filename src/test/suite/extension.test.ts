import * as assert from 'assert'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'
import * as extension from '../../extension'

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.')

  /**
   * Function tests
   */

  // Check function getKeys
  test('getKeys "regular" check', () => {
    const obj = {
      key1: 'val',
      key2: 'val2',
      key3: {
        key1: 'val12',
      },
      key4: 'val4',
    }
    const expectResponse = [
      'root.[key1]',
      'root.[key2]',
      'root.[key3]',
      'root.[key3].[key1]',
      'root.[key4]',
    ]
    var keys: string[] = []
    extension.getKeys(
      {
        tag: 'root',
        val: obj,
      },
      '',
      keys
    )
    console.log(expectResponse)
    console.log(keys)
    assert.deepStrictEqual(keys, expectResponse)
  })

  // Check funciton initJSONdata
  test('initJSONdata "regular" check', () => {
    //
    let obj = `
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
		`
    const expectResponse = {
      parsedJSON: [
        {
          key1: 'val',
          key2: 'val2',
          key3: {
            key1: 'val12',
          },
          key4: 'val4',
        },
      ],
      keys: [
        'root.0.[key1]',
        'root.0.[key2]',
        'root.0.[key3]',
        'root.0.[key3].[key1]',
        'root.0.[key4]',
      ],
    }
    const result = extension.initJSONdata(obj)
    assert.deepStrictEqual(result, expectResponse)

    let obj2 = `
			{
				"key1": "val",
				"key2": "val2",
				"key3": {
				"key1": "val12"
				},
				"key4": "val4"
			}
		`
    const expectResponse2 = {
      parsedJSON: {
        key1: 'val',
        key2: 'val2',
        key3: {
          key1: 'val12',
        },
        key4: 'val4',
      },
      keys: [
        'root.[key1]',
        'root.[key2]',
        'root.[key3]',
        'root.[key3].[key1]',
        'root.[key4]',
      ],
    }
    const result2 = extension.initJSONdata(obj2)
    assert.deepStrictEqual(result2, expectResponse2)

    let obj5 = `
		[
			30,
			{
			   "key1":"val"
			},
			20
		 ]
		`
    const expectResponse5 = {
      parsedJSON: [
        30,
        {
          key1: 'val',
        },
        20,
      ],
      keys: ['root.1.[key1]'],
    }
    const result5 = extension.initJSONdata(obj5)
    assert.deepStrictEqual(result5, expectResponse5)

    let obj6 = `
		[
			30,
			{
			   "key1":[
					{
						"key12":"sdas"
					},
					{
						"key13":"sdas"
					}
			   ]
			},
			20,
			{
			   "key4":"dfs"
			}
		 ]
		`
    const expectResponse6 = {
      parsedJSON: [
        30,
        {
          key1: [
            {
              key12: 'sdas',
            },
            {
              key13: 'sdas',
            },
          ],
        },
        20,
        {
          key4: 'dfs',
        },
      ],
      keys: [
        'root.1.[key1]',
        'root.1.[key1].0.[key12]',
        'root.1.[key1].1.[key13]',
        'root.3.[key4]',
      ],
    }
    const result6 = extension.initJSONdata(obj6)
    assert.deepStrictEqual(result6, expectResponse6)
  })
  test('initJSONdata "No found keys" check', () => {
    let obj3 = `
			[30,30]
		`
    assert.throws(() => extension.initJSONdata(obj3), Error('No found keys'))

    let obj4 = `
			"test"
		`
    assert.throws(() => extension.initJSONdata(obj4), Error('No found keys'))

    let obj5 = `
			"30"
		`
    assert.throws(() => extension.initJSONdata(obj5), Error('No found keys'))
  })
  test('initJSONdata "Empty JSON File" check', () => {
    let obj3 = `
		`
    assert.throws(() => extension.initJSONdata(obj3), Error('Empty JSON File'))
  })
  test('initJSONdata "incorrect json format" check', () => {
    //
    let obj = `
		[
			{
			  "key1": "val",
			  "key2": "val2",
			  "key3": {
			  "key1": "val12"
			  },
			  "key4": "val4"
			}
		
		`
    assert.throws(
      () => extension.initJSONdata(obj),
      Error('Incorrect JSON format')
    )
  })

  // Check funciton removeKeysinJSONData
  test('removeKeysinJSONData "regular" check', () => {
    //
    let obj = `[
			{
			   "key1":"val",
			   "key2":"val2",
			   "key3":{
				  "key1":"val12"
			   },
			   "key4":"val4"
			},
			{
			   "key1":"val",
			   "key2":"val2",
			   "key3":{
				  "key1":"val12"
			   },
			   "key4":"val4"
			}
		 ]
		`
    const expectResponse = [
      {
        key2: 'val2',
        key3: {
          key1: 'val12',
        },
        key4: 'val4',
      },
      {
        key2: 'val2',
        key3: {
          key1: 'val12',
        },
        key4: 'val4',
      },
    ]

    const data = extension.initJSONdata(obj)
    const separate = extension.separateTheTags(data.keys)
    extension.removeKeysinJSONData(data.parsedJSON, ['key1'], separate)
    assert.deepStrictEqual(data.parsedJSON, expectResponse)

    let obj2 = `{
			"key1":"val",
			"key2":"val2",
			"key3":{
			   "key1":"val12"
			},
			"key4":"val4",
      "key5":null
		 }`
    const expectResponse2 = {
      key2: 'val2',
      key3: {
        key1: 'val12',
      },
      key4: 'val4',
    }
    const data2 = extension.initJSONdata(obj2)
    const separate2 = extension.separateTheTags(data2.keys)
    extension.removeKeysinJSONData(data2.parsedJSON, ['key1', 'key5'], separate2)
    assert.deepStrictEqual(data2.parsedJSON, expectResponse2)

    //
    let obj3 = `[
			{
			   "typebla":"asdf"
			},
			[
			   [
				  {
					 "key1":"val",
					 "key2":"val2",
					 "key3":{
						"key1":"val12"
					 },
					 "key4":"val4"
				  }
			   ]
			]
		 ]
		`
    const expectResponse3 = [
      {},
      [
        [
          {
            key1: 'val',
            key2: 'val2',
            key3: {
              key1: 'val12',
            },
            key4: 'val4',
          },
        ],
      ],
    ]
    const data3 = extension.initJSONdata(obj3)
    const separate3 = extension.separateTheTags(data3.keys)
    extension.removeKeysinJSONData(data3.parsedJSON, ['typebla'], separate3)
    assert.deepStrictEqual(data3.parsedJSON, expectResponse3)
  })
  test('removeKeysinJSONData "selected list empty" check', () => {
    let obj = `[
			{
			   "key1":"val",
			   "key2":"val2",
			   "key3":{
				  "key1":"val12"
			   },
			   "key4":"val4"
			},
			{
			   "key1":"val",
			   "key2":"val2",
			   "key3":{
				  "key1":"val12"
			   },
			   "key4":"val4"
			}
		 ]
		`

    const data = extension.initJSONdata(obj)
    const separate = extension.separateTheTags(data.keys)
    assert.throws(
      () => extension.removeKeysinJSONData(data.parsedJSON, [], separate),
      Error('The selected list is empty')
    )
  })
})
