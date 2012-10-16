var _ = require('lodash');

module.exports = function(permissions) {
    
    var _cache = {}; // Build the permissions list
    
    _.each(permissions, function(value, key) {    
        _cache[key] = buildPermissionsFor(key);
    });


    /**
      Unions two sets of permissions together
     **/
    function union(permissions, other) {
        
        permissions = permissions || {};
        other = other || {};
                
        return {
            read: _.union(permissions.read || [], other.read || []),
            write: _.union(permissions.write || [], other.write || [])
        }        
    }

    /**
      Returns permissions for a given role (from the original permissions)
     **/
    function buildPermissionsFor(role) {
        var current = permissions[role] || {};
            
        if (current.includes) {
            if (Array.isArray(current.includes)) {
                current.includes.forEach(function(include) {
                    current = union(current, buildPermissionsFor(include));
                });
            } else {
               current = union(current, buildPermissionsFor(current.includes));
            }
        }
        
        return current;
    }
    
    /**
      Returns the cached permissions for a given role
     **/
    function permissionsFor(role) {
        return _cache[role] || {read: [], write: []};
    }
    
    /**
      Return a copy of the obj with only the allowed read properties for the
      role on it
     **/
    function restrict(obj, role) {
        return _.pick(obj, permissionsFor(role).read || []);
    }
    
    /**
      Returns a copy of obj with the properties of data permitted by role mixed in
     **/
    function mix(obj, data, role) {
        var permitted = _.pick(data, permissionsFor(role).write || []);
        return _.extend(obj, permitted);        
    }
        

    return {                
        permissionsFor: permissionsFor,
        restrictFor: restrict,
        restrict: restrict,
        mix: mix
    };
   
}