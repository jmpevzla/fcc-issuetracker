const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

function createForTests() {
  const createData = {
    issue_title: "Fix error in creating data",
    issue_text: "When we create data it has an error.",
    created_by: "Jose", 
    assigned_to: "Jose",
    status_text: "In QA"
  }

  return new Promise(resolve => {
    chai
    .request(server)
    .post('/api/issues/example')
    .send(createData)
    .end(function (err, res) {
      resolve(res.body._id)
    })
  })
}

function viewForTests(id, callback) {
  chai
    .request(server)
    .get(`/api/issues/example?_id=${id}`)
    .end(function (err, res) {
      callback(res.body[0])
    })
}

suite('Functional Tests', function() {
  
  test('Create an issue with every field: POST request to /api/issues/{project}', 
    function(done) {

      const sendData = {
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_by: "Jose", 
        assigned_to: "Jose",
        status_text: "In QA"
      }

      chai
      .request(server)
      .post('/api/issues/example')
      .send(sendData)
      .end(function (err, res) {
        assert.equal(res.status, 201, 'Response status should be 201')

        const resJson = res.body
        assert.hasAnyKeys(resJson, ['_id', 'created_on', 'updated_on'], 
          'Response should contains _id, created_on and updated_on')
        
        delete resJson._id
        delete resJson.created_on
        delete resJson.updated_on
        
        const resExpected = {
          issue_title: "Fix error in posting data",
          issue_text: "When we post data it has an error.",
          created_by: "Jose", 
          assigned_to: "Jose",
          open: true,
          status_text: "In QA"
        }
        
        assert.deepEqual(resJson, resExpected, `Response should contains ${JSON.stringify(resExpected)}`)
        
        done()
      })

  })

  test('Create an issue with only required fields: POST request to /api/issues/{project}', 
    function(done) {

      const sendData = {
        issue_title: "Fix a Printer Error",
        issue_text: "When we send text to print it has an error.",
        created_by: "Jose Perez"
      }

      chai
      .request(server)
      .post('/api/issues/example')
      .send(sendData)
      .end(function (err, res) {
        assert.equal(res.status, 201, 'Response status should be 201')

        const resJson = res.body
        assert.hasAnyKeys(resJson, ['_id', 'created_on', 'updated_on'], 
          'Response should contains _id, created_on and updated_on')
        
        delete resJson._id
        delete resJson.created_on
        delete resJson.updated_on
        
        const resExpected = {
          issue_title: "Fix a Printer Error",
          issue_text: "When we send text to print it has an error.",
          created_by: "Jose Perez", 
          open: true,
          assigned_to: '',
          status_text: ''
        }

        assert.deepEqual(resJson, resExpected, `Response should contains ${JSON.stringify(resExpected)}`)
        
        done()
      })

  })

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', 
    function(done) {

      const data = {
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_by: "Jose", 
        assigned_to: "Jose",
        status_text: "In QA"
      }
      
      async function send(sendData) {
        return new Promise((resolve) => {
          chai
          .request(server)
          .post('/api/issues/example')
          .send(sendData)
          .end(function (err, res) {
            assert.equal(res.status, 200, 'Response status should be 200')
  
            const resJson = res.body
            const resExpected = { error: 'required field(s) missing' } 
  
            assert.deepEqual(resJson, resExpected, `Response should be ${JSON.stringify(resExpected)}`)
            
            resolve()
          })
        })
      }

      async function check() {
        const reqFields = ['issue_title', 'issue_text', 'created_by']

        for (let field of reqFields) {
          const xdata = {...data}
          delete xdata[field]
  
          await send(xdata)
        }
      }
      
      check().then(done)
  })

  test('View issues on a project: GET request to /api/issues/{project}',
    function(done) {
      
      chai
      .request(server)
      .get('/api/issues/example')
      .end(function (err, res) {
        assert.equal(res.status, 200, 'Response status should be 200')

        const resJson = res.body
        assert.isArray(resJson, 'Response should be a Array')
        const resExpected = 1

        assert.isAtLeast(resJson.length, resExpected, `Response length should be ${JSON.stringify(resExpected)}`)

        for (let issue of resJson) {
          assert.hasAllKeys(issue, [
            '_id',
            'issue_title',
            'issue_text',
            'created_on',
            'updated_on',
            'created_by',
            'open', 
            'assigned_to',
            'status_text'
          ])
        }
        
        done()
      }) 
  })

  test('View issues on a project with one filter: GET request to /api/issues/{project}',
    function(done) {
      
      const issue_title = 'Fix error in posting data'
      chai
      .request(server)
      .get(`/api/issues/example?issue_title=${issue_title}`)
      .end(function (err, res) {
        assert.equal(res.status, 200, 'Response status should be 200')

        const resJson = res.body
        assert.isArray(resJson, 'Response should be a Array')
        const resExpected = 1

        assert.isAtLeast(resJson.length, resExpected, `Response length should be ${JSON.stringify(resExpected)}`)

        let issue = resJson[0]
        assert.equal(issue.issue_title, issue_title, `Response.issue_title should be ${issue_title}`)  
        
        done()
      }) 
  })

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}',
    function(done) {
      
      const issue_title = 'Fix error in posting data'
      const issue_text = 'When we post data it has an error.'
      const open = true

      chai
      .request(server)
      .get(`/api/issues/example?issue_title=${issue_title}&issue_text=${issue_text}&open=true`)
      .end(function (err, res) {
        assert.equal(res.status, 200, 'Response status should be 200')

        const resJson = res.body
        assert.isArray(resJson, 'Response should be a Array')
        const resExpected = 1

        assert.isAtLeast(resJson.length, resExpected, `Response length should be ${JSON.stringify(resExpected)}`)

        let issue = resJson[0]
        assert.equal(issue.issue_title, issue_title, `Response.issue_title should be ${issue_title}`)  
        assert.equal(issue.issue_text, issue_text, `Response.issue_text should be ${issue_text}`)  
        assert.equal(issue.open, true, `Response.open should be ${String(open)}`)  
        
        done()
      }) 
  })

  test('Update one field on an issue: PUT request to /api/issues/{project}',
    function(done) {

      async function doTest() {
        const _id = await createForTests()
        const issue_title = 'Fix error in updating data'
        const updateData = {
          _id,
          issue_title
        }

        chai
          .request(server)
          .put('/api/issues/example')
          .send(updateData)
          .end(function (err, res) {
            assert.equal(res.status, 200, 'Response status should be 200')

            const resExpected = {
              result: 'successfully updated', 
              _id 
            }

            assert.deepEqual(res.body, resExpected, `Response should be ${JSON.stringify(resExpected)}`)
            
            viewForTests(_id, (updated) => {
              assert.equal(updated.issue_title, issue_title, `Response issue_title should be "${issue_title}"`)
              done()
            })
          })
      }

      doTest()
  })

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}',
    function(done) {

      async function doTest() {
        const _id = await createForTests()
        
        const updateData = {
          _id,
          issue_title: "Fix error in updating data",
          issue_text: "When we update it has an error.",
          created_by: "Jose Perez", 
          assigned_to: "Jose Perez",
          status_text: "In Prod",
          open: false
        }
        
        chai
          .request(server)
          .put('/api/issues/example')
          .send(updateData)
          .end(function (err, res) {
            assert.equal(res.status, 200, 'Response status should be 200')

            const resExpected = {
              result: 'successfully updated', 
              _id 
            }

            assert.deepEqual(res.body, resExpected, `Response should be ${JSON.stringify(resExpected)}`)
            
            viewForTests(_id, (updated) => {
              delete updated.created_on
              delete updated.updated_on

              assert.deepEqual(updated, updateData, `Response should be "${JSON.stringify(updated)}"`)
              done()
            })
          })
      }

      doTest()
  })

  test('Update an issue with missing _id: PUT request to /api/issues/{project}',
    function(done) {

      async function doTest() {
        const updateData = {
          issue_title: "Fix error in updating data"
        }
        
        chai
          .request(server)
          .put('/api/issues/example')
          .send(updateData)
          .end(function (err, res) {
            assert.equal(res.status, 200, 'Response status should be 200')

            const resExpected = {
              error: 'missing _id'
            }

            assert.deepEqual(res.body, resExpected, `Response should be ${JSON.stringify(resExpected)}`)
            done()
          })
      }

      doTest()
  })

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}',
    function(done) {

      async function doTest() {
        const _id = "123456789101" 
        const updateData = {
          _id 
        }
        
        chai
          .request(server)
          .put('/api/issues/example')
          .send(updateData)
          .end(function (err, res) {
            assert.equal(res.status, 200, 'Response status should be 200')

            const resExpected = {
              error: 'no update field(s) sent', 
              _id
            }

            assert.deepEqual(res.body, resExpected, `Response should be ${JSON.stringify(resExpected)}`)
            done()
          })
      }

      doTest()
  })

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}',
    function(done) {

    async function doTest() {
      const _id = "123456789101" 
      const updateData = {
        _id,
        issue_title: 'Test issue'
      }
      
      chai
        .request(server)
        .put('/api/issues/example')
        .send(updateData)
        .end(function (err, res) {
          assert.equal(res.status, 200, 'Response status should be 200')

          const resExpected = {
            error: 'could not update', 
            _id
          }

          assert.deepEqual(res.body, resExpected, `Response should be ${JSON.stringify(resExpected)}`)
          done()
        })
    }

    doTest()
  })

  test('Delete an issue: DELETE request to /api/issues/{project}',
    function(done) {

    async function doTest() {
      const _id = await createForTests()
      
      const deleteData = {
        _id
      }
      
      chai
        .request(server)
        .delete('/api/issues/example')
        .send(deleteData)
        .end(function (err, res) {
          assert.equal(res.status, 200, 'Response status should be 200')

          const resExpected = {
            result: 'successfully deleted', 
            _id
          }

          assert.deepEqual(res.body, resExpected, `Response should be ${JSON.stringify(resExpected)}`)
          
          viewForTests(_id, (deleted) => {
            assert.isUndefined(deleted, 'response view should be undefined')
            done()
          })
        })
    }

    doTest()
  })

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}',
    function(done) {

    async function doTest() {
      const _id = '-1'
      const deleteData = {
        _id
      }
      
      chai
        .request(server)
        .delete('/api/issues/example')
        .send(deleteData)
        .end(function (err, res) {
          assert.equal(res.status, 200, 'Response status should be 200')

          const resExpected = {
            error: 'could not delete', 
            _id
          }

          assert.deepEqual(res.body, resExpected, `Response should be ${JSON.stringify(resExpected)}`)
          done()
        })
    }

    doTest()
  })

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}',
    function(done) {

    async function doTest() {
      const deleteData = {}
      
      chai
        .request(server)
        .delete('/api/issues/example')
        .send(deleteData)
        .end(function (err, res) {
          assert.equal(res.status, 200, 'Response status should be 200')

          const resExpected = {
            error: 'missing _id'
          }

          assert.deepEqual(res.body, resExpected, `Response should be ${JSON.stringify(resExpected)}`)
          done()
        })
    }

    doTest()
  })

});
