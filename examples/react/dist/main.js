// Generated by LiveScript 1.3.1
var $, React, W;
$ = require('jquery');
React = require('react');
W = require('./Stroker/view').W;
W = React.createFactory(W);
$.getJSON('../../json/4e00.json', function(data){
  console.log(data);
  return React.render(W({
    data: data
  }), document.getElementById('app'));
});