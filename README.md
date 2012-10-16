MangoModel-Security
=======

MangoModel-Security provides some simple security utility methods for the [MangoModel](https://github.com/coen-hyde/mangomodel) MongoDB wrapper. 

### Installing

To install, use NPM:
```
 npm install mangomodel-security
````


### Using

To add the MongoModel-Security functionality to a MangoModel model, do the following:

````js

var MangoModel = require('mangomodel'),
    MangoModelSecurity = require('mangomodel-security'),
    ExampleModel = MangoModel.create('example');
    
ExampleModel.methods(MangoModelSecurity({
    // permission go here.. ie
    
    user: {
        read: ['name', 'description'],
        write: ['name']
    },
    
    manager: {
        includes: 'user', // include all the permissions of user
        read: ['secret_stuff'],
        write: ['description', 'secret_stuff']
    }
    
}));

````

Once this has been done, you can call the utility methods on the MangoModel object. Ie:

````js

var record = {name: 'John Doe', description: 'A regular guy', secret_stuff: 'Likes brussel sprouts'};

// Return a copy of the record with fields a user should see
ExampleModel.restrict(record, 'user'); // Return name and description

// Get a copy of the record with only fields permissible by a user updated
ExampleModel.mix(record, { name: 'John Dean', description: 'Better than regular'}); // Only updates name

````