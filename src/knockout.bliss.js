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

    function parseExistingBindings(val){
     
      var result = { };
      
      if (val.charAt(0) !== '{'){
        return val;
      }
      
      var array = ko.expressionRewriting.parseObjectLiteral(val);
    
      for (var i = 0; i < array.length; i++) {
        result[array[i].key] = parseExistingBindings(array[i].value);
      } 
    
      return result;
    }
    
    function objectLiteralToText(obj) {
        var result = '';
    
        if (typeof(obj) === "object" && !obj.join) {
            var list = [];
            for (var property in obj) {
                list.push("'" + property + "': " + objectLiteralToText(obj[property]));
            };
            
            result += "{" + list.join(",") + "}";
        } else {
          result += obj;
        }
    
        return result;
    }
    
    var previousPreprocessNode = ko.bindingProvider.instance.preprocessNode;
    
    ko.bindingProvider.instance.preprocessNode = function(node) {
      
      if (previousPreprocessNode) {
          previousPreprocessNode(node);
      }
      
      if (node.nodeType != 1 && node.nodeType != 8){
        return;  
      }
    
      if (!node.hasAttributes || !node.hasAttributes()) {
        return;    
      }

      var bindingAttributes = [];

      for (var i = 0; i < node.attributes.length; i++) {
        var attribute = node.attributes[i];
        
        if (attribute.name.substring(0, bindingPrefix.length) !== bindingPrefix) {
          continue;
        }
        
        bindingAttributes.push(attribute);
      }
      
      if (bindingAttributes.length === 0) {
          return;
      }
      
      var existingBindings = {};
      var dataBindAttribute = node.getAttribute(regularBindingAttributeName);
      
      if (dataBindAttribute) {
          
        if (dataBindAttribute.charAt(0) !== '{'){
          dataBindAttribute = '{' + dataBindAttribute + '}';
        }
        
        existingBindings = parseExistingBindings(dataBindAttribute);
      }
    
      for (var k = 0; k < bindingAttributes.length; k++) {
    
        var attr = bindingAttributes[k];
        
        var pathItems = attr.name
            .substring(bindingPrefix.length)
            .split('.');
            
        var currentBinding = existingBindings;
        
        for (var p = 0; p < pathItems.length; p++) {

          var pathItem = pathItems[p];
          
          if (pathItem.indexOf('-') != -1){
            pathItem = "'" + pathItem + "'";
          }
          
          var value = currentBinding[pathItem] || {};
          
          if (p == pathItems.length - 1) {
            value = attr.value;
          }
          
          currentBinding[pathItem] = value;               
          currentBinding = currentBinding[pathItem];
        } 
      }
      
      node.setAttribute(regularBindingAttributeName, objectLiteralToText(existingBindings));
    }; 
}));