'use strict';
const express = require('express');
const mongoose = require('mongoose');

/**
 * @param {express.Express} app 
 * @param {mongoose.Model} model
 */
module.exports = function (app, model) {

  const projects = []

  const fields = [
    'issue_title',
    'issue_text',
    'created_on',
    'updated_on',
    'created_by',
    'open', 
    'assigned_to',
    'status_text'
  ]

  app.route('/api/issues/:project')
    
    .get(function (req, res){
      let project = req.params.project;
      let query = { ...req.query, project }
      
      model.find(query, fields.join(' '), function (err, docs) {
        if (err) console.error(err)
        
        return res.json(docs)
      })

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

      const newIssue = new model()
      newIssue.project = project
      newIssue.issue_title = issue.issue_title
      newIssue.issue_text = issue.issue_text
      newIssue.created_by = issue.created_by
      newIssue.assigned_to = issue.assigned_to
      newIssue.status_text = issue.status_text
      newIssue.created_on = new Date()
      newIssue.updated_on = new Date()
      newIssue.open = true
      
      newIssue.save().then(issueCreated => {
        const _issue = {
          ...issueCreated._doc, 
          project: undefined, 
          __v: undefined
        }
       
        return res.status(201).json(_issue)
      }).catch(err => {
        console.error(err)
      }) 
    })
    
    .put(function (req, res){
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

      model.findById(_id,  function(err, doc) {
        if (err || !doc) {
          return res.json({
            error: 'could not update',
            _id
          })
        }

        doc.updated_on = new Date()

        for(let field in testBody) {
          if (typeof(doc[field]) !== undefined
          && field !== '_id') {
            doc[field] = testBody[field]
          }
        }

        doc.save().then(() => {
          const resp = {
            result: 'successfully updated', 
            _id
          }
  
          return res.json(resp)
        })
      })
      
    })
    
    .delete(function (req, res){
      const _id = req.body._id

      if (!_id) {
        return res.json({
          error: 'missing _id'
        })
      }

      model.findById(_id,  function(err, doc) {
        if (err || !doc) {
          return res.json({
            error: 'could not delete',
            _id
          })
        }

        model.deleteOne({ _id }, errx => {
          const resp = {
            result: 'successfully deleted', 
            _id
          }
  
          return res.json(resp)
        })
      })
    });
    
};
