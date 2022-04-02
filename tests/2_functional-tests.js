const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  // const sendData = {
  //   issue_title: "Fix error in posting data",
  //   issue_text: "When we post data it has an error.",
  //   //created_on: new Date(2022, 3, 1, 21),
  //   //updated_on: new Date(2022, 3, 1, 21),
  //   created_by: "Jose", 
  //   assigned_to: "Jose",
  //   //open: true,
  //   status_text: "In QA"
  // }

  // const respData = {
  //   issue_title: "Fix error in posting data",
  //   issue_text: "When we post data it has an error.",
  //   // created_on: "2022-04-02T01:00:00.000Z",
  //   // updated_on: "2022-04-02T01:00:00.000Z",
  //   created_by: "Jose", 
  //   assigned_to: "Jose",
  //   open: true,
  //   status_text: "In QA"  
  // }

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

        const resJson = JSON.parse(res.text)
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

        const resJson = JSON.parse(res.text)
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
  
            const resJson = JSON.parse(res.text)
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

        const resJson = JSON.parse(res.text)
        assert.isArray(resJson, 'Response should be a Array')
        const resExpected = 2

        assert.equal(resJson.length, resExpected, `Response length should be ${JSON.stringify(resExpected)}`)
      
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

        const resJson = JSON.parse(res.text)
        assert.isArray(resJson, 'Response should be a Array')
        const resExpected = 1

        assert.equal(resJson.length, resExpected, `Response length should be ${JSON.stringify(resExpected)}`)
      
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

        const resJson = JSON.parse(res.text)
        assert.isArray(resJson, 'Response should be a Array')
        const resExpected = 1

        assert.equal(resJson.length, resExpected, `Response length should be ${JSON.stringify(resExpected)}`)
      
        let issue = resJson[0]
        assert.equal(issue.issue_title, issue_title, `Response.issue_title should be ${issue_title}`)  
        assert.equal(issue.issue_text, issue_text, `Response.issue_text should be ${issue_text}`)  
        assert.equal(issue.open, true, `Response.open should be ${String(open)}`)  
        
        done()
      }) 
  })

});
