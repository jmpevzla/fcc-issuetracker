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
      
      issue._id = Math.trunc((Math.random() * 10000))
      issue.created_on = new Date()
      issue.updated_on = new Date()
      issue.open = true

      projects[project].push(issue)
      
      return res.status(201).json(issue)
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
