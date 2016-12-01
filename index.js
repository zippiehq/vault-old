/*
 * Copyright (c) 2016 True Global Ltd. 
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
*/

var vault = null;
var vaultOpts = null;
var vaultReady = null;
var _counter = 0;
var receivers = {} 

function vaultHandleMessage(event) {
    if (event.source == vault)
    {
        if ('ready' in event.data)
        {
            exports.message({ 'init' : vaultOpts }).then(function(result) {
                 vaultReady();
            });
            return;
        }
        if (event.data.callback && receivers[event.data.callback]) {
            let receiver = receivers[event.data.callback]
            delete receivers[event.data.callback]
            receiver(event.data)
        }
    }
}

exports.message = function (message) {
     return new Promise(function(resolve, reject) {
         let id = "callback-" + _counter++

         receivers[id] = resolve;
         message.callback = id;
         // XXX this should be to our known origin for when it claims it's ready
         vault.postMessage(message, '*');
     });
};

exports.init = function (opts) {
    opts = opts || { "useOrigin" : true };
    return new Promise(
        function (resolve, reject) {
           window.addEventListener('message', vaultHandleMessage);
           var iframe = document.createElement('iframe');
           iframe.style.display = "none";
           if (opts.testing)
            iframe.src = "../vault/index.html";
           else          
            iframe.src = "https://vault.zipperglobal.com/"; // vault URL
           document.body.appendChild(iframe);
           vault = iframe.contentWindow;
           vaultOpts = opts;
           vaultReady = resolve;
       });
};
