var _ = require('lodash'),
    should = require('chai').should(),
    MangoModel = require('mangomodel'),
    MangoModelSecurity = require('../');

describe('MangoModel Security', function() {
   
    var Taco = MangoModel.create('tacos');
    Taco.methods(MangoModelSecurity({
        all: {
            read: ['name', 'price'],
            write: [],
        },
        manager: {
            includes: 'all',
            read: ['_id'],
            write: ['_id', 'name', 'price']
        },
        chef: {
            includes: 'all',
            read: ['secret_ingredient']
        },
        owner: {
            includes: ['manager', 'chef'],
            write: ['secret_ingredient']
        }        
    }));
    
    var record = {
        _id: '1234567890',
        name: 'Taco Surprise',
        price: 899,
        secret_ingredient: 'Spicy Chicken Seasoning'
    };
   
    it('should be able to get correct permissions for a basic role', function(done) {
        
        var permissions = Taco.permissionsFor('all'),
            expected = {
                read: ['name', 'price'],
                write: []
            };
            
        permissionsMatch(permissions, expected);
        done();
                
    });
    
    it('should be able to get correct permissions for a composite role', function(done) {
        
        var permissions = Taco.permissionsFor('chef'),
            expected = {
                read: ['name', 'price', 'secret_ingredient'], 
                write: []
            };
            
            
        permissionsMatch(permissions, expected);
        done();
    });
    
    it('should be able to get correct permissions for an multiple composite role', function(done) {
        
        var permissions = Taco.permissionsFor('owner'),
            expected = {
                read: ['name', 'price', 'secret_ingredient', '_id'],
                write: ['name', 'price', 'secret_ingredient', '_id']
            };
            
        permissionsMatch(permissions, expected);
        done();
    });
    
    it('should be able to restrict object properties to permitted fields', function(done) {
        
        var result = Taco.restrictFor(record, 'all');
        
        result.should.include.keys('name', 'price');
        result.should.not.include.keys('_id', 'secret_ingredient');
        
        result = Taco.restrictFor(record, 'chef');
        result.should.include.keys('name', 'price', 'secret_ingredient');
        result.should.not.include.keys('_id');
        done();
    });
    
    it('should be able to update permitted properties on an object', function(done) {
        
        var data = { name: 'Taco Special', secret_ingredient: 'Tomato Salsa'},
            result = null;
        
        // Test updating by everyone    
        result = Taco.mix(_.clone(record), data, 'all');        
        result.should.have.property('name', record.name);
        result.should.have.property('secret_ingredient', record.secret_ingredient);
        
        // Test updating by manager (update name only)
        result = Taco.mix(_.clone(record), data, 'manager'); 
        result.should.have.property('name', data.name);
        result.should.have.property('secret_ingredient', record.secret_ingredient);               
        
        // Test updating by owner (update both)
        result = Taco.mix(_.clone(record), data, 'owner'); 
        result.should.have.property('name', data.name);
        result.should.have.property('secret_ingredient', data.secret_ingredient);
        
        done();
        
    });
       
});

function permissionsMatch(actual, expected) {
    
    actual = actual || {};
    expected = expected || {};
    
    var read = _.difference(actual.read, expected.read),
        write = _.difference(actual.write, expected.write);
        
    read.length.should.equal(0);
    actual.read.length.should.equal(expected.read.length || 0);
    write.length.should.equal(0);
    actual.write.length.should.equal(expected.write.length || 0);
    
}