(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['knockout'], factory);
    } else if (typeof exports === 'object') {
        var ko = require('knockout');
        factory(ko);
    } else {
        factory(root.ko);
    }

}(this, function(ko) {

    var bindingPrefix = '*';
    var regularBindingAttributeName = 'data-bind';

    // Converts object literal described in a string into
    // a regular literal object
    function parseBindingsString(bindingValue) {
     
        var result = { };
        
        // if the value doesn't start with '{' then it is
        // a primitive value that we shouldn't parse       
        if (bindingValue.charAt(0) !== '{'){
            return bindingValue;
        }
      
        // convert string with bindings to the array by KO
        var array = ko.expressionRewriting.parseObjectLiteral(bindingValue);
    
        for (var i = 0; i < array.length; i++) {
            result[array[i].key] = parseBindingsString(array[i].value);
        } 
    
        return result;
    }

    // Converts bindings string described inside the data-bind
    // attribute into a literal object     
    function convertBindingsStringToObject(bindings) {
        if (!bindings){
            return {};
        }
                
        if (bindings.charAt(0) !== '{'){
            bindings = '{' + bindings + '}';
        }
        
        return parseBindingsString(bindings);
    }
    
    // Converts object literal to string
    function objectLiteralToString(obj) {
        var result = '';
    
        if (typeof(obj) === "object" && !obj.join) {
            var list = [];
            
            for (var property in obj) {
                list.push("'" + property + "': " + objectLiteralToString(obj[property]));
            };
            
            result += "{" + list.join(",") + "}";
        } else {
            result += obj;
        }
    
        return result;
    }   
    
    // Retrieves an array of attributes that satisfy
    // the special binding syntax
    function getBindingAttributesArray(node){

        var result = [];
        
        for (var i = 0; i < node.attributes.length; i++) {
            var attribute = node.attributes[i];
            
            if (attribute.name.substring(0, bindingPrefix.length) !== bindingPrefix) {
                continue;
            }
            
            result.push(attribute);
        }
  
        return result;        
    }
    
    // Appends an attribute hierarchical value into 
    // a literal object that represents all the bindings 
    function appendBindingsFromAttribute(existingBindings, attr) {
        
        var pathItems = attr.name
            .substring(bindingPrefix.length)
            .split('.');
            
        var currentBinding = existingBindings;
        
        for (var i = 0; i < pathItems.length; i++) {

            var pathItem = pathItems[i];
            
            if (pathItem.indexOf('-') != -1){
                pathItem = "'" + pathItem + "'";
            }
            
            var value = currentBinding[pathItem] || {};
            
            if (i == pathItems.length - 1) {
                value = attr.value;
            }
            
            currentBinding[pathItem] = value;               
            currentBinding = currentBinding[pathItem];
        }         
    }
    
    
    // Validates node whether it should be taken into
    // consideration when building the bindings list 
    function validateBindingNode(node){
        
        if (node.nodeType != 1 && node.nodeType != 8) {
            return false;  
        }
        
        if (!node.hasAttributes || !node.hasAttributes()) {
            return false;    
        }

        return true;
    }
    
    // Processes a node if it satisfy the validation condition
    // in order to create the bindings 
    function preprocessNode(node){
        
        if (!validateBindingNode(node)){
            return;
        }
        
        var bindingAttributes = getBindingAttributesArray(node);
        
        if (bindingAttributes.length === 0) {
            return;
        }
        
        var dataBindAttribute = node.getAttribute(regularBindingAttributeName);
        var existingBindings = convertBindingsStringToObject(dataBindAttribute);

        for (var i = 0; i < bindingAttributes.length; i++) {
            appendBindingsFromAttribute(existingBindings, bindingAttributes[i]);        
        } 
            
        node.setAttribute(regularBindingAttributeName, objectLiteralToString(existingBindings));        
    }
    
    // existing implementation of preprocessNode method
    var previousPreprocessNode = ko.bindingProvider.instance.preprocessNode;
    
    ko.bindingProvider.instance.preprocessNode = function(node) {
      
        // if there is a existing implementation of
        // preprocessNode then run it before 
        if (previousPreprocessNode) {
            previousPreprocessNode(node);
        }
        
        preprocessNode(node);
    }; 
}));