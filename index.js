(function () {
  var store = {};
  init();

  function init() {
    fileSaverPolyfill();
    setStore();
    renderForm();
  }

  function setStore() {
    store.form = {};
    store.isEncoded = false;
  }

  function renderForm() {
    var app = dqs("#app");
    if (!app) {
      console.log("No app element found.");
      return;
    }
    var fragment = document.createDocumentFragment();
    var titleInputElem = document.createElement("input");
    titleInputElem.type = "text";
    titleInputElem.id = "title";
    titleInputElem.addEventListener("input", handleInputChange);
    var titleLabelElem = document.createElement("label");
    titleLabelElem.innerText = "Title: ";
    titleLabelElem.appendChild(titleInputElem);

    var descriptionInputElem = document.createElement("textarea");
    descriptionInputElem.type = "text";
    descriptionInputElem.id = "description";
    descriptionInputElem.addEventListener("input", handleInputChange);
    var descriptionLabelElem = document.createElement("label");
    descriptionLabelElem.innerText = "Description: ";
    descriptionLabelElem.appendChild(descriptionInputElem);

    var encodedInputElem = document.createElement("input");
    encodedInputElem.type = "checkbox";
    encodedInputElem.id = "encoded";
    encodedInputElem.addEventListener("input", handleEncodedChange);
    var encodedLabelElem = document.createElement("label");
    encodedLabelElem.innerText = "Encoded: ";
    encodedLabelElem.title = "Check this box to produce or consume Base64 encoded format. " +
      "Useful when you want to hide contents of the file from laymen."
    encodedLabelElem.appendChild(encodedInputElem);

    var saveButton = document.createElement("button");
    saveButton.addEventListener("click", handleSave);
    saveButton.innerText = "Save";

    var loadButton = document.createElement("button");
    loadButton.addEventListener("click", handleLoad);
    loadButton.innerText = "Load";

    fragment.appendChild(titleLabelElem);
    fragment.appendChild(descriptionLabelElem);
    fragment.appendChild(encodedLabelElem);
    fragment.appendChild(saveButton);
    fragment.appendChild(loadButton);
    app.appendChild(fragment);
  }

  function handleInputChange(event) {
    store.form[event.target.id] = event.target.value;
    console.log(store.form);
  }

  function handleEncodedChange(event) {
    store.isEncoded = event.target.checked;
    console.log(store);
  }

  function handleSave() {
    var fileName = "savedForm.json";
    var data = store.isEncoded ? utf8_to_b64(JSON.stringify({form: store.form})) :
      JSON.stringify({form: store.form});
    var fileToSave = new Blob([data], {
      type: 'application/json'
    });
    // Save the file
    saveAs(fileToSave, fileName);
  }

  function handleLoad() {
    console.log("I should load...");
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = function (e) {
      // getting a hold of the file reference
      var file = e.target.files[0];
      // setting up the reader
      var reader = new FileReader();
      reader.readAsText(file);
      // here we tell the reader what to do when it's done reading...
      reader.onload = function (readerEvent) {
        var content = readerEvent.target.result; // this is the content!
        try {
          store.isEncoded ? handleFileLoaded(JSON.parse(b64_to_utf8(content.toString()))) :
            handleFileLoaded(JSON.parse(content.toString()));
        } catch (err) {
          console.log("Error reading from file, possibly wrong format");
        }
      }
    }
    input.click();
  }

  function handleFileLoaded(file) {
    try {
      store.form = file.form;
      updateFormElements();
    } catch (err) {
      console.log("Incorrect loaded data format");
    }
  }

  function updateFormElements() {
    dqs("#title").value = store.form.title;
    dqs("#description").value = store.form.description;
    dqs("#encoded").checked = store.isEncoded;
  }

  function fileSaverPolyfill() {
    (function (a, b) {
      if ("function" == typeof define && define.amd) define([], b); else if ("undefined" != typeof exports) b(); else {
        b(), a.FileSaver = {exports: {}}.exports
      }
    })(this, function () {
      "use strict";

      function b(a, b) {
        return "undefined" == typeof b ? b = {autoBom: !1} : "object" != typeof b && (console.warn("Deprecated: Expected third argument to be a object"), b = {autoBom: !b}), b.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type) ? new Blob(["\uFEFF", a], {type: a.type}) : a
      }

      function c(a, b, c) {
        var d = new XMLHttpRequest;
        d.open("GET", a), d.responseType = "blob", d.onload = function () {
          g(d.response, b, c)
        }, d.onerror = function () {
          console.error("could not download file")
        }, d.send()
      }

      function d(a) {
        var b = new XMLHttpRequest;
        b.open("HEAD", a, !1);
        try {
          b.send()
        } catch (a) {
        }
        return 200 <= b.status && 299 >= b.status
      }

      function e(a) {
        try {
          a.dispatchEvent(new MouseEvent("click"))
        } catch (c) {
          var b = document.createEvent("MouseEvents");
          b.initMouseEvent("click", !0, !0, window, 0, 0, 0, 80, 20, !1, !1, !1, !1, 0, null), a.dispatchEvent(b)
        }
      }

      var f = "object" == typeof window && window.window === window ? window : "object" == typeof self && self.self === self ? self : "object" == typeof global && global.global === global ? global : void 0,
        a = /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent),
        g = f.saveAs || ("object" != typeof window || window !== f ? function () {
        } : "download" in HTMLAnchorElement.prototype && !a ? function (b, g, h) {
          var i = f.URL || f.webkitURL, j = document.createElement("a");
          g = g || b.name || "download", j.download = g, j.rel = "noopener", "string" == typeof b ? (j.href = b, j.origin === location.origin ? e(j) : d(j.href) ? c(b, g, h) : e(j, j.target = "_blank")) : (j.href = i.createObjectURL(b), setTimeout(function () {
            i.revokeObjectURL(j.href)
          }, 4E4), setTimeout(function () {
            e(j)
          }, 0))
        } : "msSaveOrOpenBlob" in navigator ? function (f, g, h) {
          if (g = g || f.name || "download", "string" != typeof f) navigator.msSaveOrOpenBlob(b(f, h), g); else if (d(f)) c(f, g, h); else {
            var i = document.createElement("a");
            i.href = f, i.target = "_blank", setTimeout(function () {
              e(i)
            })
          }
        } : function (b, d, e, g) {
          if (g = g || open("", "_blank"), g && (g.document.title = g.document.body.innerText = "downloading..."), "string" == typeof b) return c(b, d, e);
          var h = "application/octet-stream" === b.type, i = /constructor/i.test(f.HTMLElement) || f.safari,
            j = /CriOS\/[\d]+/.test(navigator.userAgent);
          if ((j || h && i || a) && "undefined" != typeof FileReader) {
            var k = new FileReader;
            k.onloadend = function () {
              var a = k.result;
              a = j ? a : a.replace(/^data:[^;]*;/, "data:attachment/file;"), g ? g.location.href = a : location = a, g = null
            }, k.readAsDataURL(b)
          } else {
            var l = f.URL || f.webkitURL, m = l.createObjectURL(b);
            g ? g.location = m : location.href = m, g = null, setTimeout(function () {
              l.revokeObjectURL(m)
            }, 4E4)
          }
        });
      f.saveAs = g.saveAs = g, "undefined" != typeof module && (module.exports = g)
    });
  }

  function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }

  function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
  }

  function dqs(selector) {
    return document.querySelector(selector);
  }
})();