'use strict';
const express = require('express')

/**
 * @param {express.Express} app 
 */
module.exports = function (app) {

  const projects = []

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let query = req.query

      let issues = projects[project]
      if (query) {
        issues = issues.filter((value) => {
          for(let key in query) {
            if (query[key] != String(value[key])) {
              return false
            }
          }
          
          return true
        })
      }
      

      return res.json(issues)
    })
    
    .post(function (req, res){
      let project = req.params.project;
      let issue = req.body
      
      function sendError() {
        res.json({ error: 'required field(s) missing' })
      }

      if (!issue.issue_title) return sendError()
      if (!issue.issue_text) return sendError()
      if (!issue.created_by) return sendError()

      if (!issue.assigned_to) issue.assigned_to = ''
      if (!issue.status_text) issue.status_text = ''

      projects[project] = projects[project] || []
      
      issue._id = String(Math.trunc((Math.random() * 10000)))
      issue.created_on = new Date()
      issue.updated_on = new Date()
      issue.open = true

      projects[project].push(issue)
      
      return res.status(201).json(issue)
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
      const _id = req.body._id

      if (!_id) {
        return res.json({
          error: 'missing _id'
        })
      }

      const testBody = {...req.body}
      delete testBody.created_on
      delete testBody.updated_on

      if (Object.keys(testBody).length === 1) {
        return res.json({
          error: 'no update field(s) sent', 
          _id: testBody._id
        })
      }

      const issue = projects[project].find((value) => {
        return _id == value._id
      })

      if (!issue) {
        return res.json({
          error: 'could not update',
          _id
        })
      }
    
      issue.updated_on = new Date()
      
      for(let key in req.body) {
        if (typeof(issue[key]) !== undefined
          && key !== 'created_on' 
          && key !== 'updated_on') {
          
            issue[key] = req.body[key]
        }
      }

      const resp = {
        result: 'successfully updated', 
        _id
      }

      return res.json(resp)
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      const _id = req.body._id

      if (!_id) {
        return res.json({
          error: 'missing _id'
        })
      }

      const issueIndex = projects[project].findIndex((value) => {
        return _id == value._id
      })

      if (issueIndex === -1) {
        return res.json({
          _id,
          error: 'could not delete'
        })
      }

      projects[project].splice(issueIndex, 1)

      return res.json({
        result: 'successfully deleted', 
        _id
      })
    });
    
};
