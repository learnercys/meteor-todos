Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
  // This code only runs on te client
  Template.body.helpers({
    tasks: function () {
      // Show newest tasks at the top
      if ( Session.get('hideCompleted') ) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}})
      }
    },
    hideCompleted: function () {
      return Session.get('hideCompleted');
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    'submit .new-tasks': function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;

      // Insert a task into the collection
      Meteor.call('addTask', text);

      // Clear form
      event.target.text.value = '';
    },
    'change .hide-completed input': function(event) {
      Session.set('hideCompleted', event.target.checked);
    }
  });

  Template.task.events({
    'click .toggle-checked': function() {
      // Set the checked property to the opposite of its current value
      Meteor.call('setChecked', this_id, !this.checked);
    },
    'click .delete': function () {
      Meteor.call('deleteTask', this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });
}

Meteor.methods({
  addTask: function(text) {
    // Make sure te user is logged in before inserting a task
    if( !Meteor.userId() ) {
      throw new Meteor.Error('not-authorized');
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function(taskId, setChecked) {
    Tasks.update(taskId, {$set: {checked: setChecked}});
  }
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
