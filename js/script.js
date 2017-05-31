var newtime = (new Date()).getTime();
var historydata = false;
var agentsdata = false;
(function(funcName, baseObj) {
  funcName = funcName || 'docReady';
  baseObj = baseObj || window;
  var readyList = [];
  var readyFired = false;
  var readyEventHandlersInstalled = false;
  function ready() {
    if (!readyFired) {
      readyFired = true;
      for (var i = 0; i < readyList.length; i++) {
        readyList[i].fn.call(window, readyList[i].ctx);
      }
      readyList = [];
    }
  }
  function readyStateChange() {
    if (document.readyState === 'complete') {
      ready();
    }
  }
  baseObj[funcName] = function(callback, context) {
    if (typeof callback !== 'function') {
      throw new TypeError('callback for docReady(fn) must be a function');
    }
    if (readyFired) {
      setTimeout(function() {callback(context);}, 1);
      return;
    } else {
      readyList.push({fn: callback, ctx: context});
    }
    if (document.readyState === 'complete') {
      setTimeout(ready, 1);
    } else if (!readyEventHandlersInstalled) {
      if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', ready, false);
        window.addEventListener('load', ready, false);
      } else {
        document.attachEvent('onreadystatechange', readyStateChange);
        window.attachEvent('onload', ready);
      }
      readyEventHandlersInstalled = true;
    }
  }
})('docReady', window);
docReady(function(){
  mixpanel.register({
    "newvisit": newtime
  });
  mixpanel.track('newvisit: ' + newtime);
  document.getElementById('app').removeAttribute('class');
  function dataloading(){
    if (historydata && agentsdata) {
      if (historydata === true || agentsdata === true) {
        alert('data loading failed, please refresh');
        location.reload();
      } else {
        document.getElementById('loading').classList.add('none');
      }
    } else {
      setTimeout(function(){
        dataloading();
      },500);
    }
  }
  dataloading();
  document.getElementById('taginput').addEventListener('paste',function(e){
    var clipboardData, pastedData, inputData, tempData, tempTags = [], currentTags = [], out = '';
    clipboardData = e.clipboardData || window.clipboardData;
    pastedData = clipboardData.getData('Text');
    inputData = document.getElementById('taginput').value + pastedData;
    tempData = inputData.split(',');
    for (var i = 0; i < tempData.length - 1; i++) {
      if(tempTags.indexOf(tempData[i].trim()) === -1) tempTags.push(tempData[i].trim());
    }
    Array.prototype.slice.call(document.getElementsByTagName('dynamictags')[0].children).forEach(function(data){
      currentTags.push(data.innerText);
    });
    Array.prototype.slice.call(document.querySelector('taginput').parentNode.querySelector('resources').children).forEach(function(data){
      currentTags.push(data.innerText);
    });
    tempTags.forEach(function(data){
      if (currentTags.indexOf(data) === -1) {
        out += '<res>' + data + '</res>';
        mixpanel.track('New Tag Added: ' + data);
      }
    });
    document.getElementsByTagName('dynamictags')[0].innerHTML = document.getElementsByTagName('dynamictags')[0].innerHTML + out;
    setTimeout(function(){
      document.getElementById('taginput').value = tempData[tempData.length - 1].trim();
    },0);
  }, false);
  setInterval(function(){
    if (!document.getElementsByTagName('taginput')[0].classList.contains('none')) {
      var inputData = document.getElementById('taginput').value;
      if (inputData.indexOf(',') !== -1){
        var tempData, tempTags = [], currentTags = [], out = '';
        tempData = inputData.split(',');
        for (var i = 0; i < tempData.length - 1; i++) {
          if(tempTags.indexOf(tempData[i].trim()) === -1) tempTags.push(tempData[i].trim());
        }
        Array.prototype.slice.call(document.getElementsByTagName('dynamictags')[0].children).forEach(function(data){
          currentTags.push(data.innerText);
        });
        Array.prototype.slice.call(document.querySelector('taginput').parentNode.querySelector('resources').children).forEach(function(data){
          currentTags.push(data.innerText);
        });
        tempTags.forEach(function(data){
          if (currentTags.indexOf(data) === -1) {
            out += '<res>' + data + '</res>';
            mixpanel.track('New Tag Added: ' + data);
          }
        });
        document.getElementsByTagName('dynamictags')[0].innerHTML = document.getElementsByTagName('dynamictags')[0].innerHTML + out;
        setTimeout(function(){
          document.getElementById('taginput').value = tempData[tempData.length - 1].trim();
        },0);
      }
    }
  },250);
});
var xhrhistory = new XMLHttpRequest();
xhrhistory.addEventListener('load',function(){
  if (xhrhistory.status == 200 && xhrhistory.getResponseHeader('Content-Type').indexOf('application') !== -1) {
    historydata = JSON.parse(xhrhistory.responseText);
    populatehistory(historydata);
  } else {
    historydata = true;
  }
});
xhrhistory.open('GET', '/data/history.json');
xhrhistory.send();
function populatehistory(data) {
  var out = '';
  for(var i = 0; i < data.length; i++) {
    out += '<div>' + data[i] + '</div>';
  }
  document.getElementsByTagName('history')[0].innerHTML = out;
}
var xhragents = new XMLHttpRequest();
xhragents.addEventListener('load',function(){
  if (xhragents.status == 200 && xhragents.getResponseHeader('Content-Type').indexOf('application') !== -1) {
    agentsdata = JSON.parse(xhragents.responseText);
    populateagents(agentsdata);
  } else {
    agentsdata = true;
  }
});
xhragents.open('GET', '/data/agents.json');
xhragents.send();
function populateagents(data) {
  var out = '';
  for(var i = 0; i < data.length; i++) {
    out += '<item class="' + data[i].tag + ' ' + data[i].status + '"><thumb><img></img></thumb><div><info><url>' + data[i].url + '</url><divider></divider><status>' + data[i].status + '</status><divider></divider><ip>' + data[i].ip + '</ip><divider></divider><path>' + data[i].path + '</path></info><control><add>Specify Resources</add><divider></divider><resources>Resources:';
    data[i].res.forEach(function(item,index){
      out += '<res>' + item + '</res>'
    });
    out += '</resources><deny>Deny</deny></control></div></item>'
  }
  document.getElementById('left').innerHTML = out;
}
document.addEventListener('click', function(e){
  if (e.target.localName == 'tag' && e.target.className.indexOf('selected') == -1){
    mixpanel.track("Sub-menu Selected " + e.target.childNodes[0].data);
    Array.prototype.slice.call(document.getElementsByTagName('tag')).forEach(function(item,index){
      item.removeAttribute('class');
    });
    e.target.classList.add('selected');
    document.getElementById('left').removeAttribute('class');
    console.log(e.target.childNodes[0].data.charAt(0).toLowerCase() + e.target.childNodes[0].data.slice(1));
    document.getElementById('left').classList.add(e.target.childNodes[0].data.charAt(0).toLowerCase() + e.target.childNodes[0].data.slice(1));
  }else if (e.target.localName == 'res'){
    mixpanel.track("Res Removed " + e.target.childNodes[0].data);
    e.target.remove();
  }else if (e.target.localName == 'add'){
    mixpanel.track("Adding res...");
    document.getElementById('taginput').value = '';
    document.querySelector('taginput dynamictags').innerHTML = '';
    document.getElementsByTagName('taginput')[0].classList.add('none');
    e.target.parentNode.parentNode.appendChild(document.getElementsByTagName('taginput')[0]);
    document.getElementsByTagName('taginput')[0].removeAttribute('class');
  }else if (e.target.localName == 'taginput'){
    mixpanel.track("Input Box Clicked");
    e.target.childNodes[3].focus();
  }else {
    mixpanel.track("Other Click Action: " + e.target.localName + '.' + e.target.className);
  }
});
document.addEventListener('keyup',function(e){
  if (e.keyCode == 188) {
    mixpanel.track("Comma Pressed");
  } else if (e.keyCode == 13) {
    mixpanel.track("Enter Key Pressed");
    var inputData, tempData, tempTags = [], currentTags = [], out = '';
    inputData = document.getElementById('taginput').value;
    tempData = inputData.split(',');
    if (inputData.trim() !== ''){
      for (var i = 0; i < tempData.length; i++) {
        if(tempTags.indexOf(tempData[i].trim()) === -1) tempTags.push(tempData[i].trim());
      }
    } else {
      for (var i = 0; i < tempData.length - 1; i++) {
        if(tempTags.indexOf(tempData[i].trim()) === -1) tempTags.push(tempData[i].trim());
      }
    }
    Array.prototype.slice.call(document.getElementsByTagName('dynamictags')[0].children).forEach(function(data){
      currentTags.push(data.innerText);
    });
    Array.prototype.slice.call(document.querySelector('taginput').parentNode.querySelector('resources').children).forEach(function(data){
      currentTags.push(data.innerText);
    });
    tempTags.forEach(function(data){
      if (currentTags.indexOf(data) === -1) {
        out += '<res>' + data + '</res>';
        mixpanel.track('New Tag Added: ' + data);
      }
    });
    document.getElementsByTagName('dynamictags')[0].innerHTML = document.getElementsByTagName('dynamictags')[0].innerHTML + out;
    document.querySelector('taginput').parentNode.querySelector('resources').innerHTML = document.querySelector('taginput').parentNode.querySelector('resources').innerHTML + document.querySelector('taginput dynamictags').innerHTML;
    document.querySelector('taginput').classList.add('none');
  }
}, false);
(function(e,a){if(!a.__SV){var b=window;try{var c,l,i,j=b.location,g=j.hash;c=function(a,b){return(l=a.match(RegExp(b+"=([^&]*)")))?l[1]:null};g&&c(g,"state")&&(i=JSON.parse(decodeURIComponent(c(g,"state"))),"mpeditor"===i.action&&(b.sessionStorage.setItem("_mpcehash",g),history.replaceState(i.desiredHash||"",e.title,j.pathname+j.search)))}catch(m){}var k,h;window.mixpanel=a;a._i=[];a.init=function(b,c,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,
0)))}}var d=a;"undefined"!==typeof f?d=a[f]=[]:f="mixpanel";d.people=d.people||[];d.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};d.people.toString=function(){return d.toString(1)+".people (stub)"};k="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");
for(h=0;h<k.length;h++)e(d,k[h]);a._i.push([b,c,f])};a.__SV=1.2;b=e.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";c=e.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}})(document,window.mixpanel||[]);
mixpanel.init("5f527a7b5eeb40483a869f95a514426a");