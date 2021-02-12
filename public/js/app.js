/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser */ "./node_modules/process/browser.js");


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/App.vue?vue&type=script&lang=js&":
/*!*****************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/App.vue?vue&type=script&lang=js& ***!
  \*****************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var vue_plyr__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue-plyr */ "./node_modules/vue-plyr/dist/vue-plyr.esm.js");
/* harmony import */ var vue_cookies__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vue-cookies */ "./node_modules/vue-cookies/vue-cookies.js");
/* harmony import */ var vue_cookies__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(vue_cookies__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _CurrentTrack_vue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CurrentTrack.vue */ "./resources/js/views/CurrentTrack.vue");
/* harmony import */ var _PreviousTracks_vue__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./PreviousTracks.vue */ "./resources/js/views/PreviousTracks.vue");
/* harmony import */ var _SettingsPiano_vue__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./SettingsPiano.vue */ "./resources/js/views/SettingsPiano.vue");
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//






/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  name: 'App',
  components: {
    CurrentTrack: _CurrentTrack_vue__WEBPACK_IMPORTED_MODULE_3__.default,
    PreviousTracks: _PreviousTracks_vue__WEBPACK_IMPORTED_MODULE_4__.default,
    SettingsPiano: _SettingsPiano_vue__WEBPACK_IMPORTED_MODULE_5__.default
  },
  data: function data() {
    return {
      nextTracks: [],
      previousTracks: [],
      currentSeconds: 0,
      currentTick: 0,
      currentTrack: {},
      currentTrackRetrieved: false,
      errors: [],
      axiosTokenSources: [],
      startedRadio: false,
      showWaveForm: true,
      collapsedInfoBox: false,
      flippedInfoBox: false,
      settingsComponent: settingsComponent,
      settings: {}
    };
  },
  created: function created() {},
  mounted: function mounted() {
    var _this = this;

    this.$refs.plyr.player.on('pause', function () {
      return _this.pause();
    });
    this.$refs.plyr.player.on('play', function () {
      return _this.play();
    });
    this.$refs.plyr.player.on('ready', function () {
      return _this.play();
    });
    this.$refs.plyr.player.on('ended', function () {
      return _this.ended();
    });
    this.$refs.plyr.player.on('timeupdate', function () {
      return _this.timeupdate();
    });
  },
  methods: {
    startRadio: function startRadio() {
      this.startedRadio = 1;
      this.getNextTrack();
    },
    toggleSettings: function toggleSettings() {
      this.flippedInfoBox = !this.flippedInfoBox;
    },
    getSetting: function getSetting(setting, defaultValue) {
      var _this$$cookies$get;

      var value = (_this$$cookies$get = this.$cookies.get('setting_' + setting)) !== null && _this$$cookies$get !== void 0 ? _this$$cookies$get : defaultValue;
      return value;
    },
    updateSetting: function updateSetting(event) {
      this.$cookies.set('setting_' + event.target.name, event.target.value);
      this.settings[event.target.name] = event.target.name;
    },
    updateYoutubePlayer: function updateYoutubePlayer() {
      if (this.currentTrack.youtube_id !== null) {
        this.$refs.plyr.player.source = {
          type: 'video',
          sources: [{
            src: this.currentTrack.youtube_id,
            provider: 'youtube'
          }]
        };
        console.log(this.currentTrack);
        this.play();
      }
    },
    getNextTrack: function getNextTrack() {
      var _this2 = this;

      var CancelToken = (axios__WEBPACK_IMPORTED_MODULE_0___default().CancelToken);
      var source = CancelToken.source();
      var vm = this;
      this.axiosTokenSources.push(source);

      if (this.nextTracks.length > 0) {
        console.log('Manipulating array.');
        this.previousTracks.push(this.currentTrack);
        this.currentTrack = this.nextTracks.shift();
        this.previousTracks.pop();
        this.updateYoutubePlayer();
        return;
      }

      axios__WEBPACK_IMPORTED_MODULE_0___default()({
        method: 'get',
        url: '/api/v1/track',
        data: {
          settings: this.settings
        }
      }).then(function (response) {
        // handle success
        console.log(response.data);
        _this2.currentSeconds = response.data.current_seconds;
        _this2.currentTrack = response.data.current_track;
        response.data.previous_tracks.forEach(function (track) {
          _this2.previousTracks.push(track);
        });
        response.data.next_tracks.forEach(function (track) {
          _this2.nextTracks.push(track);
        });

        _this2.updateYoutubePlayer();
      })["catch"](function (e) {
        // handle error
        if (!axios__WEBPACK_IMPORTED_MODULE_0___default().isCancel(e)) {
          _this2.errors.push('Error while retrieving tracks. Message: ${e.message}');
        }
      }).then(function () {// always executed
        // stop waiting
        // this.$wait.end('loading.tracks')
      });
    },
    timeupdate: function timeupdate() {
      var currentTimeRounded = Math.round(this.$refs.plyr.player.currentTime);

      if (this.currentTick != currentTimeRounded) {
        var _this$currentTrack$yo, _this$currentTrack$yo2, _this$currentTrack$yo3, _this$currentTrack$yo4;

        this.currentTick = currentTimeRounded;
        console.log('Current tick: ' + this.currentTick);
        this.play(); // Check if we need to stop the track.

        var stopTick = (_this$currentTrack$yo = this.currentTrack.youtube_duration_ms) !== null && _this$currentTrack$yo !== void 0 ? _this$currentTrack$yo : 0;
        var endMs = (_this$currentTrack$yo2 = this.currentTrack.youtube_end_ms) !== null && _this$currentTrack$yo2 !== void 0 ? _this$currentTrack$yo2 : this.currentTrack.youtube_duration_ms;
        var startMs = (_this$currentTrack$yo3 = this.currentTrack.youtube_start_ms) !== null && _this$currentTrack$yo3 !== void 0 ? _this$currentTrack$yo3 : 0;
        var extraMs = (_this$currentTrack$yo4 = this.currentTrack.youtube_post_ms) !== null && _this$currentTrack$yo4 !== void 0 ? _this$currentTrack$yo4 : 0;
        var destinationTick = (endMs - startMs + extraMs) / 1000;
        console.log('Destination tick: ' + destinationTick);

        if (this.currentTick >= destinationTick) {
          console.log('Getting next track');
          this.getNextTrack();
        }
      }
    },
    play: function play() {
      if (this.startedRadio == 1 && this.$refs.plyr.player.paused == true) {
        console.log('Playing');
        this.$refs.plyr.player.play(); // Determine where we need to jump to.

        this.$refs.plyr.player.currentTime = this.currentSeconds - this.currentTrack.secs_start; // Display the waveform.

        this.showWaveForm = 1;
        console.log('Track', this.currentTrack);
      }
    },
    pause: function pause() {// TODO: Check every 1 second if we're paused, and then auto-play.
    },
    clear: function clear() {
      this.tracks = [];
      this.cancel();
    },
    cancel: function cancel() {
      this.axiosTokenSources.forEach(function (source) {
        source.cancel();
      });
    },
    loaded: function loaded(img) {
      // this.$wait.end(`loading.photo-${img.id}`)
      this.photoGraphicFiles.push(img); // all photo image files (for counter)

      img.loaded = true;
    },
    ended: function ended() {
      this.getNextTrack();
    }
  }
});

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/CurrentTrack.vue?vue&type=script&lang=js&":
/*!**************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/CurrentTrack.vue?vue&type=script&lang=js& ***!
  \**************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  data: function data() {
    return {
      showWaveForm: 1
    };
  },
  props: {
    track: '',
    artist: '',
    image: '',
    url: ''
  }
});

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/SettingsPiano.vue?vue&type=script&lang=js&":
/*!***************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/SettingsPiano.vue?vue&type=script&lang=js& ***!
  \***************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  name: 'SettingsPiano',
  props: {
    settings: {
      type: Object,
      required: true,
      "default": function _default() {
        return {
          mood: 0,
          style: 0,
          sacred: 1,
          christmas: 1,
          classical: 1
        };
      }
    }
  },
  data: function data() {
    return {
      mood: this.$parent.getSetting('mood', 0),
      style: this.$parent.getSetting('style', 0),
      sacred: this.$parent.getSetting('sacred', 1),
      christmas: this.$parent.getSetting('christmas', 1),
      classical: this.$parent.getSetting('classical', 1)
    };
  },
  computed: {
    settingValue: function settingValue(setting) {
      return settings[setting];
    }
  },
  created: function created() {
    console.log(this.settings);
  }
});

/***/ }),

/***/ "./resources/js/app.js":
/*!*****************************!*\
  !*** ./resources/js/app.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! vue */ "./node_modules/vue/dist/vue.esm.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var vue_axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue-axios */ "./node_modules/vue-axios/dist/vue-axios.es5.js");
/* harmony import */ var vue_axios__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(vue_axios__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var vue_plyr__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! vue-plyr */ "./node_modules/vue-plyr/dist/vue-plyr.esm.js");
/* harmony import */ var vue_cookies__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! vue-cookies */ "./node_modules/vue-cookies/vue-cookies.js");
/* harmony import */ var vue_cookies__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(vue_cookies__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _views_App__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./views/App */ "./resources/js/views/App.vue");





vue__WEBPACK_IMPORTED_MODULE_4__.default.use((vue_axios__WEBPACK_IMPORTED_MODULE_1___default()), (axios__WEBPACK_IMPORTED_MODULE_0___default())).use((vue_cookies__WEBPACK_IMPORTED_MODULE_3___default())).use(vue_plyr__WEBPACK_IMPORTED_MODULE_2__.default, {
  plyr: {
    clickToPlay: false,
    debug: true,
    keyboard: {
      focused: false
    },
    fullscreen: {
      enabled: false
    },
    storage: {
      key: 'radio'
    }
  }
});


var app = new vue__WEBPACK_IMPORTED_MODULE_4__.default({
  el: '#app',
  components: {
    App: _views_App__WEBPACK_IMPORTED_MODULE_5__.default
  },
  data: {}
});

/***/ }),

/***/ "./resources/sass/app.scss":
/*!*********************************!*\
  !*** ./resources/sass/app.scss ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/sass/settings_piano.scss":
/*!********************************************!*\
  !*** ./resources/sass/settings_piano.scss ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/vue-axios/dist/vue-axios.es5.js":
/*!******************************************************!*\
  !*** ./node_modules/vue-axios/dist/vue-axios.es5.js ***!
  \******************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser */ "./node_modules/process/browser.js");
var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,r){for(var t=0;t<r.length;t++){var n=r[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function _createClass(e,r,t){return r&&_defineProperties(e.prototype,r),t&&_defineProperties(e,t),e}function _slicedToArray(e,r){return _arrayWithHoles(e)||_iterableToArrayLimit(e,r)||_unsupportedIterableToArray(e,r)||_nonIterableRest()}function _arrayWithHoles(e){if(Array.isArray(e))return e}function _iterableToArrayLimit(e,r){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var t=[],n=!0,o=!1,a=void 0;try{for(var c,i=e[Symbol.iterator]();!(n=(c=i.next()).done)&&(t.push(c.value),!r||t.length!==r);n=!0);}catch(e){o=!0,a=e}finally{try{n||null==i.return||i.return()}finally{if(o)throw a}}return t}}function _unsupportedIterableToArray(e,r){if(e){if("string"==typeof e)return _arrayLikeToArray(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);return"Object"===t&&e.constructor&&(t=e.constructor.name),"Map"===t||"Set"===t?Array.from(e):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?_arrayLikeToArray(e,r):void 0}}function _arrayLikeToArray(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _createForOfIteratorHelper(e,r){var t;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(t=_unsupportedIterableToArray(e))||r&&e&&"number"==typeof e.length){t&&(e=t);var n=0;return{s:r=function(){},n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,c=!1;return{s:function(){t=e[Symbol.iterator]()},n:function(){var e=t.next();return a=e.done,e},e:function(e){c=!0,o=e},f:function(){try{a||null==t.return||t.return()}finally{if(c)throw o}}}}function createCommonjsModule(e,r,t){return e(t={path:r,exports:{},require:function(e,r){return commonjsRequire(e,null==r?t.path:r)}},t.exports),t.exports}function commonjsRequire(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}var SEMVER_SPEC_VERSION="2.0.0",MAX_LENGTH=256,MAX_SAFE_INTEGER=Number.MAX_SAFE_INTEGER||9007199254740991,MAX_SAFE_COMPONENT_LENGTH=16,constants={SEMVER_SPEC_VERSION:SEMVER_SPEC_VERSION,MAX_LENGTH:MAX_LENGTH,MAX_SAFE_INTEGER:MAX_SAFE_INTEGER,MAX_SAFE_COMPONENT_LENGTH:MAX_SAFE_COMPONENT_LENGTH},debug="object"===("undefined"==typeof process?"undefined":_typeof(process))&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG)?function(){for(var e,r=arguments.length,t=new Array(r),n=0;n<r;n++)t[n]=arguments[n];return(e=console).error.apply(e,["SEMVER"].concat(t))}:function(){},debug_1=debug,re_1=createCommonjsModule(function(e,r){var t=constants.MAX_SAFE_COMPONENT_LENGTH,o=(r=e.exports={}).re=[],a=r.src=[],c=r.t={},i=0;(e=function(e,r,t){var n=i++;debug_1(n,r),c[e]=n,a[n]=r,o[n]=new RegExp(r,t?"g":void 0)})("NUMERICIDENTIFIER","0|[1-9]\\d*"),e("NUMERICIDENTIFIERLOOSE","[0-9]+"),e("NONNUMERICIDENTIFIER","\\d*[a-zA-Z-][a-zA-Z0-9-]*"),e("MAINVERSION","(".concat(a[c.NUMERICIDENTIFIER],")\\.")+"(".concat(a[c.NUMERICIDENTIFIER],")\\.")+"(".concat(a[c.NUMERICIDENTIFIER],")")),e("MAINVERSIONLOOSE","(".concat(a[c.NUMERICIDENTIFIERLOOSE],")\\.")+"(".concat(a[c.NUMERICIDENTIFIERLOOSE],")\\.")+"(".concat(a[c.NUMERICIDENTIFIERLOOSE],")")),e("PRERELEASEIDENTIFIER","(?:".concat(a[c.NUMERICIDENTIFIER],"|").concat(a[c.NONNUMERICIDENTIFIER],")")),e("PRERELEASEIDENTIFIERLOOSE","(?:".concat(a[c.NUMERICIDENTIFIERLOOSE],"|").concat(a[c.NONNUMERICIDENTIFIER],")")),e("PRERELEASE","(?:-(".concat(a[c.PRERELEASEIDENTIFIER],"(?:\\.").concat(a[c.PRERELEASEIDENTIFIER],")*))")),e("PRERELEASELOOSE","(?:-?(".concat(a[c.PRERELEASEIDENTIFIERLOOSE],"(?:\\.").concat(a[c.PRERELEASEIDENTIFIERLOOSE],")*))")),e("BUILDIDENTIFIER","[0-9A-Za-z-]+"),e("BUILD","(?:\\+(".concat(a[c.BUILDIDENTIFIER],"(?:\\.").concat(a[c.BUILDIDENTIFIER],")*))")),e("FULLPLAIN","v?".concat(a[c.MAINVERSION]).concat(a[c.PRERELEASE],"?").concat(a[c.BUILD],"?")),e("FULL","^".concat(a[c.FULLPLAIN],"$")),e("LOOSEPLAIN","[v=\\s]*".concat(a[c.MAINVERSIONLOOSE]).concat(a[c.PRERELEASELOOSE],"?").concat(a[c.BUILD],"?")),e("LOOSE","^".concat(a[c.LOOSEPLAIN],"$")),e("GTLT","((?:<|>)?=?)"),e("XRANGEIDENTIFIERLOOSE","".concat(a[c.NUMERICIDENTIFIERLOOSE],"|x|X|\\*")),e("XRANGEIDENTIFIER","".concat(a[c.NUMERICIDENTIFIER],"|x|X|\\*")),e("XRANGEPLAIN","[v=\\s]*(".concat(a[c.XRANGEIDENTIFIER],")")+"(?:\\.(".concat(a[c.XRANGEIDENTIFIER],")")+"(?:\\.(".concat(a[c.XRANGEIDENTIFIER],")")+"(?:".concat(a[c.PRERELEASE],")?").concat(a[c.BUILD],"?")+")?)?"),e("XRANGEPLAINLOOSE","[v=\\s]*(".concat(a[c.XRANGEIDENTIFIERLOOSE],")")+"(?:\\.(".concat(a[c.XRANGEIDENTIFIERLOOSE],")")+"(?:\\.(".concat(a[c.XRANGEIDENTIFIERLOOSE],")")+"(?:".concat(a[c.PRERELEASELOOSE],")?").concat(a[c.BUILD],"?")+")?)?"),e("XRANGE","^".concat(a[c.GTLT],"\\s*").concat(a[c.XRANGEPLAIN],"$")),e("XRANGELOOSE","^".concat(a[c.GTLT],"\\s*").concat(a[c.XRANGEPLAINLOOSE],"$")),e("COERCE","".concat("(^|[^\\d])(\\d{1,").concat(t,"})")+"(?:\\.(\\d{1,".concat(t,"}))?")+"(?:\\.(\\d{1,".concat(t,"}))?")+"(?:$|[^\\d])"),e("COERCERTL",a[c.COERCE],!0),e("LONETILDE","(?:~>?)"),e("TILDETRIM","(\\s*)".concat(a[c.LONETILDE],"\\s+"),!0),r.tildeTrimReplace="$1~",e("TILDE","^".concat(a[c.LONETILDE]).concat(a[c.XRANGEPLAIN],"$")),e("TILDELOOSE","^".concat(a[c.LONETILDE]).concat(a[c.XRANGEPLAINLOOSE],"$")),e("LONECARET","(?:\\^)"),e("CARETTRIM","(\\s*)".concat(a[c.LONECARET],"\\s+"),!0),r.caretTrimReplace="$1^",e("CARET","^".concat(a[c.LONECARET]).concat(a[c.XRANGEPLAIN],"$")),e("CARETLOOSE","^".concat(a[c.LONECARET]).concat(a[c.XRANGEPLAINLOOSE],"$")),e("COMPARATORLOOSE","^".concat(a[c.GTLT],"\\s*(").concat(a[c.LOOSEPLAIN],")$|^$")),e("COMPARATOR","^".concat(a[c.GTLT],"\\s*(").concat(a[c.FULLPLAIN],")$|^$")),e("COMPARATORTRIM","(\\s*)".concat(a[c.GTLT],"\\s*(").concat(a[c.LOOSEPLAIN],"|").concat(a[c.XRANGEPLAIN],")"),!0),r.comparatorTrimReplace="$1$2$3",e("HYPHENRANGE","^\\s*(".concat(a[c.XRANGEPLAIN],")")+"\\s+-\\s+"+"(".concat(a[c.XRANGEPLAIN],")")+"\\s*$"),e("HYPHENRANGELOOSE","^\\s*(".concat(a[c.XRANGEPLAINLOOSE],")")+"\\s+-\\s+"+"(".concat(a[c.XRANGEPLAINLOOSE],")")+"\\s*$"),e("STAR","(<|>)?=?\\s*\\*"),e("GTE0","^\\s*>=\\s*0.0.0\\s*$"),e("GTE0PRE","^\\s*>=\\s*0.0.0-0\\s*$")}),numeric=/^[0-9]+$/,compareIdentifiers=function(e,r){var t=numeric.test(e),n=numeric.test(r);return t&&n&&(e=+e,r=+r),e===r?0:t&&!n||(!n||t)&&e<r?-1:1},rcompareIdentifiers=function(e,r){return compareIdentifiers(r,e)},identifiers={compareIdentifiers:compareIdentifiers,rcompareIdentifiers:rcompareIdentifiers},MAX_LENGTH$1=constants.MAX_LENGTH,MAX_SAFE_INTEGER$1=constants.MAX_SAFE_INTEGER,re=re_1.re,t=re_1.t,compareIdentifiers$1=identifiers.compareIdentifiers,SemVer=function(){function o(e,r){if(_classCallCheck(this,o),r&&"object"===_typeof(r)||(r={loose:!!r,includePrerelease:!1}),e instanceof o){if(e.loose===!!r.loose&&e.includePrerelease===!!r.includePrerelease)return e;e=e.version}else if("string"!=typeof e)throw new TypeError("Invalid Version: ".concat(e));if(e.length>MAX_LENGTH$1)throw new TypeError("version is longer than ".concat(MAX_LENGTH$1," characters"));if(debug_1("SemVer",e,r),this.options=r,this.loose=!!r.loose,this.includePrerelease=!!r.includePrerelease,!(r=e.trim().match(r.loose?re[t.LOOSE]:re[t.FULL])))throw new TypeError("Invalid Version: ".concat(e));if(this.raw=e,this.major=+r[1],this.minor=+r[2],this.patch=+r[3],this.major>MAX_SAFE_INTEGER$1||this.major<0)throw new TypeError("Invalid major version");if(this.minor>MAX_SAFE_INTEGER$1||this.minor<0)throw new TypeError("Invalid minor version");if(this.patch>MAX_SAFE_INTEGER$1||this.patch<0)throw new TypeError("Invalid patch version");r[4]?this.prerelease=r[4].split(".").map(function(e){if(/^[0-9]+$/.test(e)){var r=+e;if(0<=r&&r<MAX_SAFE_INTEGER$1)return r}return e}):this.prerelease=[],this.build=r[5]?r[5].split("."):[],this.format()}return _createClass(o,[{key:"format",value:function(){return this.version="".concat(this.major,".").concat(this.minor,".").concat(this.patch),this.prerelease.length&&(this.version+="-".concat(this.prerelease.join("."))),this.version}},{key:"toString",value:function(){return this.version}},{key:"compare",value:function(e){if(debug_1("SemVer.compare",this.version,this.options,e),!(e instanceof o)){if("string"==typeof e&&e===this.version)return 0;e=new o(e,this.options)}return e.version===this.version?0:this.compareMain(e)||this.comparePre(e)}},{key:"compareMain",value:function(e){return e instanceof o||(e=new o(e,this.options)),compareIdentifiers$1(this.major,e.major)||compareIdentifiers$1(this.minor,e.minor)||compareIdentifiers$1(this.patch,e.patch)}},{key:"comparePre",value:function(e){if(e instanceof o||(e=new o(e,this.options)),this.prerelease.length&&!e.prerelease.length)return-1;if(!this.prerelease.length&&e.prerelease.length)return 1;if(!this.prerelease.length&&!e.prerelease.length)return 0;var r=0;do{var t=this.prerelease[r],n=e.prerelease[r];if(debug_1("prerelease compare",r,t,n),void 0===t&&void 0===n)return 0;if(void 0===n)return 1;if(void 0===t)return-1;if(t!==n)return compareIdentifiers$1(t,n)}while(++r)}},{key:"compareBuild",value:function(e){e instanceof o||(e=new o(e,this.options));var r=0;do{var t=this.build[r],n=e.build[r];if(debug_1("prerelease compare",r,t,n),void 0===t&&void 0===n)return 0;if(void 0===n)return 1;if(void 0===t)return-1;if(t!==n)return compareIdentifiers$1(t,n)}while(++r)}},{key:"inc",value:function(e,r){switch(e){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",r);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",r);break;case"prepatch":this.prerelease.length=0,this.inc("patch",r),this.inc("pre",r);break;case"prerelease":0===this.prerelease.length&&this.inc("patch",r),this.inc("pre",r);break;case"major":0===this.minor&&0===this.patch&&0!==this.prerelease.length||this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":0===this.patch&&0!==this.prerelease.length||this.minor++,this.patch=0,this.prerelease=[];break;case"patch":0===this.prerelease.length&&this.patch++,this.prerelease=[];break;case"pre":if(0===this.prerelease.length)this.prerelease=[0];else{for(var t=this.prerelease.length;0<=--t;)"number"==typeof this.prerelease[t]&&(this.prerelease[t]++,t=-2);-1===t&&this.prerelease.push(0)}r&&(this.prerelease[0]!==r||isNaN(this.prerelease[1]))&&(this.prerelease=[r,0]);break;default:throw new Error("invalid increment argument: ".concat(e))}return this.format(),this.raw=this.version,this}}]),o}(),semver=SemVer,MAX_LENGTH$2=constants.MAX_LENGTH,re$1=re_1.re,t$1=re_1.t,parse=function(e,r){if(r&&"object"===_typeof(r)||(r={loose:!!r,includePrerelease:!1}),e instanceof semver)return e;if("string"!=typeof e)return null;if(e.length>MAX_LENGTH$2)return null;if(!(r.loose?re$1[t$1.LOOSE]:re$1[t$1.FULL]).test(e))return null;try{return new semver(e,r)}catch(e){return null}},parse_1=parse,valid=function(e,r){return(r=parse_1(e,r))?r.version:null},valid_1=valid,clean=function(e,r){return(r=parse_1(e.trim().replace(/^[=v]+/,""),r))?r.version:null},clean_1=clean,inc=function(e,r,t,n){"string"==typeof t&&(n=t,t=void 0);try{return new semver(e,t).inc(r,n).version}catch(e){return null}},inc_1=inc,compare=function(e,r,t){return new semver(e,t).compare(new semver(r,t))},compare_1=compare,eq=function(e,r,t){return 0===compare_1(e,r,t)},eq_1=eq,diff=function(e,r){if(eq_1(e,r))return null;var t,n=parse_1(e),o=parse_1(r),a=(r=n.prerelease.length||o.prerelease.length)?"pre":"",r=r?"prerelease":"";for(t in n)if(("major"===t||"minor"===t||"patch"===t)&&n[t]!==o[t])return a+t;return r},diff_1=diff,major=function(e,r){return new semver(e,r).major},major_1=major,minor=function(e,r){return new semver(e,r).minor},minor_1=minor,patch=function(e,r){return new semver(e,r).patch},patch_1=patch,prerelease=function(e,r){return(r=parse_1(e,r))&&r.prerelease.length?r.prerelease:null},prerelease_1=prerelease,rcompare=function(e,r,t){return compare_1(r,e,t)},rcompare_1=rcompare,compareLoose=function(e,r){return compare_1(e,r,!0)},compareLoose_1=compareLoose,compareBuild=function(e,r,t){return e=new semver(e,t),t=new semver(r,t),e.compare(t)||e.compareBuild(t)},compareBuild_1=compareBuild,sort=function(e,t){return e.sort(function(e,r){return compareBuild_1(e,r,t)})},sort_1=sort,rsort=function(e,t){return e.sort(function(e,r){return compareBuild_1(r,e,t)})},rsort_1=rsort,gt=function(e,r,t){return 0<compare_1(e,r,t)},gt_1=gt,lt=function(e,r,t){return compare_1(e,r,t)<0},lt_1=lt,neq=function(e,r,t){return 0!==compare_1(e,r,t)},neq_1=neq,gte=function(e,r,t){return 0<=compare_1(e,r,t)},gte_1=gte,lte=function(e,r,t){return compare_1(e,r,t)<=0},lte_1=lte,cmp=function(e,r,t,n){switch(r){case"===":return"object"===_typeof(e)&&(e=e.version),"object"===_typeof(t)&&(t=t.version),e===t;case"!==":return"object"===_typeof(e)&&(e=e.version),"object"===_typeof(t)&&(t=t.version),e!==t;case"":case"=":case"==":return eq_1(e,t,n);case"!=":return neq_1(e,t,n);case">":return gt_1(e,t,n);case">=":return gte_1(e,t,n);case"<":return lt_1(e,t,n);case"<=":return lte_1(e,t,n);default:throw new TypeError("Invalid operator: ".concat(r))}},cmp_1=cmp,re$2=re_1.re,t$2=re_1.t,coerce=function(e,r){if(e instanceof semver)return e;if("number"==typeof e&&(e=String(e)),"string"!=typeof e)return null;var t,n=null;if((r=r||{}).rtl){for(;(t=re$2[t$2.COERCERTL].exec(e))&&(!n||n.index+n[0].length!==e.length);)n&&t.index+t[0].length===n.index+n[0].length||(n=t),re$2[t$2.COERCERTL].lastIndex=t.index+t[1].length+t[2].length;re$2[t$2.COERCERTL].lastIndex=-1}else n=e.match(re$2[t$2.COERCE]);return null===n?null:parse_1("".concat(n[2],".").concat(n[3]||"0",".").concat(n[4]||"0"),r)},coerce_1=coerce,Range=function(){function n(e,r){var t=this;if(_classCallCheck(this,n),r&&"object"===_typeof(r)||(r={loose:!!r,includePrerelease:!1}),e instanceof n)return e.loose===!!r.loose&&e.includePrerelease===!!r.includePrerelease?e:new n(e.raw,r);if(e instanceof comparator)return this.raw=e.value,this.set=[[e]],this.format(),this;if(this.options=r,this.loose=!!r.loose,this.includePrerelease=!!r.includePrerelease,this.raw=e,this.set=e.split(/\s*\|\|\s*/).map(function(e){return t.parseRange(e.trim())}).filter(function(e){return e.length}),!this.set.length)throw new TypeError("Invalid SemVer Range: ".concat(e));this.format()}return _createClass(n,[{key:"format",value:function(){return this.range=this.set.map(function(e){return e.join(" ").trim()}).join("||").trim(),this.range}},{key:"toString",value:function(){return this.range}},{key:"parseRange",value:function(e){var r=this,t=this.options.loose;e=e.trim();var n=t?re$3[t$3.HYPHENRANGELOOSE]:re$3[t$3.HYPHENRANGE];e=e.replace(n,hyphenReplace(this.options.includePrerelease)),debug_1("hyphen replace",e),e=e.replace(re$3[t$3.COMPARATORTRIM],comparatorTrimReplace),debug_1("comparator trim",e,re$3[t$3.COMPARATORTRIM]),e=(e=(e=e.replace(re$3[t$3.TILDETRIM],tildeTrimReplace)).replace(re$3[t$3.CARETTRIM],caretTrimReplace)).split(/\s+/).join(" ");var o=t?re$3[t$3.COMPARATORLOOSE]:re$3[t$3.COMPARATOR];return e.split(" ").map(function(e){return parseComparator(e,r.options)}).join(" ").split(/\s+/).map(function(e){return replaceGTE0(e,r.options)}).filter(this.options.loose?function(e){return!!e.match(o)}:function(){return!0}).map(function(e){return new comparator(e,r.options)})}},{key:"intersects",value:function(e,t){if(!(e instanceof n))throw new TypeError("a Range is required");return this.set.some(function(r){return isSatisfiable(r,t)&&e.set.some(function(e){return isSatisfiable(e,t)&&r.every(function(r){return e.every(function(e){return r.intersects(e,t)})})})})}},{key:"test",value:function(e){if(!e)return!1;if("string"==typeof e)try{e=new semver(e,this.options)}catch(e){return!1}for(var r=0;r<this.set.length;r++)if(testSet(this.set[r],e,this.options))return!0;return!1}}]),n}(),range=Range,re$3=re_1.re,t$3=re_1.t,comparatorTrimReplace=re_1.comparatorTrimReplace,tildeTrimReplace=re_1.tildeTrimReplace,caretTrimReplace=re_1.caretTrimReplace,isSatisfiable=function(e,r){for(var t=!0,n=e.slice(),o=n.pop();t&&n.length;)t=n.every(function(e){return o.intersects(e,r)}),o=n.pop();return t},parseComparator=function(e,r){return debug_1("comp",e,r),e=replaceCarets(e,r),debug_1("caret",e),e=replaceTildes(e,r),debug_1("tildes",e),e=replaceXRanges(e,r),debug_1("xrange",e),e=replaceStars(e,r),debug_1("stars",e),e},isX=function(e){return!e||"x"===e.toLowerCase()||"*"===e},replaceTildes=function(e,r){return e.trim().split(/\s+/).map(function(e){return replaceTilde(e,r)}).join(" ")},replaceTilde=function(a,e){return e=e.loose?re$3[t$3.TILDELOOSE]:re$3[t$3.TILDE],a.replace(e,function(e,r,t,n,o){return debug_1("tilde",a,e,r,t,n,o),t=isX(r)?"":isX(t)?">=".concat(r,".0.0 <").concat(+r+1,".0.0-0"):isX(n)?">=".concat(r,".").concat(t,".0 <").concat(r,".").concat(+t+1,".0-0"):o?(debug_1("replaceTilde pr",o),">=".concat(r,".").concat(t,".").concat(n,"-").concat(o," <").concat(r,".").concat(+t+1,".0-0")):">=".concat(r,".").concat(t,".").concat(n," <").concat(r,".").concat(+t+1,".0-0"),debug_1("tilde return",t),t})},replaceCarets=function(e,r){return e.trim().split(/\s+/).map(function(e){return replaceCaret(e,r)}).join(" ")},replaceCaret=function(a,e){debug_1("caret",a,e);var r=e.loose?re$3[t$3.CARETLOOSE]:re$3[t$3.CARET],c=e.includePrerelease?"-0":"";return a.replace(r,function(e,r,t,n,o){return debug_1("caret",a,e,r,t,n,o),r=isX(r)?"":isX(t)?">=".concat(r,".0.0").concat(c," <").concat(+r+1,".0.0-0"):isX(n)?"0"===r?">=".concat(r,".").concat(t,".0").concat(c," <").concat(r,".").concat(+t+1,".0-0"):">=".concat(r,".").concat(t,".0").concat(c," <").concat(+r+1,".0.0-0"):o?(debug_1("replaceCaret pr",o),"0"===r?"0"===t?">=".concat(r,".").concat(t,".").concat(n,"-").concat(o," <").concat(r,".").concat(t,".").concat(+n+1,"-0"):">=".concat(r,".").concat(t,".").concat(n,"-").concat(o," <").concat(r,".").concat(+t+1,".0-0"):">=".concat(r,".").concat(t,".").concat(n,"-").concat(o," <").concat(+r+1,".0.0-0")):(debug_1("no pr"),"0"===r?"0"===t?">=".concat(r,".").concat(t,".").concat(n).concat(c," <").concat(r,".").concat(t,".").concat(+n+1,"-0"):">=".concat(r,".").concat(t,".").concat(n).concat(c," <").concat(r,".").concat(+t+1,".0-0"):">=".concat(r,".").concat(t,".").concat(n," <").concat(+r+1,".0.0-0")),debug_1("caret return",r),r})},replaceXRanges=function(e,r){return debug_1("replaceXRanges",e,r),e.split(/\s+/).map(function(e){return replaceXRange(e,r)}).join(" ")},replaceXRange=function(u,l){u=u.trim();var e=l.loose?re$3[t$3.XRANGELOOSE]:re$3[t$3.XRANGE];return u.replace(e,function(e,r,t,n,o,a){debug_1("xRange",u,e,r,t,n,o,a);var c=isX(t),i=c||isX(n),s=i||isX(o);return"="===r&&s&&(r=""),a=l.includePrerelease?"-0":"",c?e=">"===r||"<"===r?"<0.0.0-0":"*":r&&s?(i&&(n=0),o=0,">"===r?(r=">=",o=i?(t=+t+1,n=0):(n=+n+1,0)):"<="===r&&(r="<",i?t=+t+1:n=+n+1),"<"===r&&(a="-0"),e="".concat(r+t,".").concat(n,".").concat(o).concat(a)):i?e=">=".concat(t,".0.0").concat(a," <").concat(+t+1,".0.0-0"):s&&(e=">=".concat(t,".").concat(n,".0").concat(a," <").concat(t,".").concat(+n+1,".0-0")),debug_1("xRange return",e),e})},replaceStars=function(e,r){return debug_1("replaceStars",e,r),e.trim().replace(re$3[t$3.STAR],"")},replaceGTE0=function(e,r){return debug_1("replaceGTE0",e,r),e.trim().replace(re$3[r.includePrerelease?t$3.GTE0PRE:t$3.GTE0],"")},hyphenReplace=function(E){return function(e,r,t,n,o,a,c,i,s,u,l,p,f){return r=isX(t)?"":isX(n)?">=".concat(t,".0.0").concat(E?"-0":""):isX(o)?">=".concat(t,".").concat(n,".0").concat(E?"-0":""):a?">=".concat(r):">=".concat(r).concat(E?"-0":""),i=isX(s)?"":isX(u)?"<".concat(+s+1,".0.0-0"):isX(l)?"<".concat(s,".").concat(+u+1,".0-0"):p?"<=".concat(s,".").concat(u,".").concat(l,"-").concat(p):E?"<".concat(s,".").concat(u,".").concat(+l+1,"-0"):"<=".concat(i),"".concat(r," ").concat(i).trim()}},testSet=function(e,r,t){for(var n=0;n<e.length;n++)if(!e[n].test(r))return!1;if(!r.prerelease.length||t.includePrerelease)return!0;for(var o=0;o<e.length;o++)if(debug_1(e[o].semver),e[o].semver!==comparator.ANY&&0<e[o].semver.prerelease.length){var a=e[o].semver;if(a.major===r.major&&a.minor===r.minor&&a.patch===r.patch)return!0}return!1},ANY=Symbol("SemVer ANY"),Comparator=function(){function i(e,r){if(_classCallCheck(this,i),r&&"object"===_typeof(r)||(r={loose:!!r,includePrerelease:!1}),e instanceof i){if(e.loose===!!r.loose)return e;e=e.value}debug_1("comparator",e,r),this.options=r,this.loose=!!r.loose,this.parse(e),this.semver===ANY?this.value="":this.value=this.operator+this.semver.version,debug_1("comp",this)}return _createClass(i,null,[{key:"ANY",get:function(){return ANY}}]),_createClass(i,[{key:"parse",value:function(e){var r=this.options.loose?re$4[t$4.COMPARATORLOOSE]:re$4[t$4.COMPARATOR];if(!(r=e.match(r)))throw new TypeError("Invalid comparator: ".concat(e));this.operator=void 0!==r[1]?r[1]:"","="===this.operator&&(this.operator=""),r[2]?this.semver=new semver(r[2],this.options.loose):this.semver=ANY}},{key:"toString",value:function(){return this.value}},{key:"test",value:function(e){if(debug_1("Comparator.test",e,this.options.loose),this.semver===ANY||e===ANY)return!0;if("string"==typeof e)try{e=new semver(e,this.options)}catch(e){return!1}return cmp_1(e,this.operator,this.semver,this.options)}},{key:"intersects",value:function(e,r){if(!(e instanceof i))throw new TypeError("a Comparator is required");if(r&&"object"===_typeof(r)||(r={loose:!!r,includePrerelease:!1}),""===this.operator)return""===this.value||new range(e.value,r).test(this.value);if(""===e.operator)return""===e.value||new range(this.value,r).test(e.semver);var t=!(">="!==this.operator&&">"!==this.operator||">="!==e.operator&&">"!==e.operator),n=!("<="!==this.operator&&"<"!==this.operator||"<="!==e.operator&&"<"!==e.operator),o=this.semver.version===e.semver.version,a=!(">="!==this.operator&&"<="!==this.operator||">="!==e.operator&&"<="!==e.operator),c=cmp_1(this.semver,"<",e.semver,r)&&(">="===this.operator||">"===this.operator)&&("<="===e.operator||"<"===e.operator),e=cmp_1(this.semver,">",e.semver,r)&&("<="===this.operator||"<"===this.operator)&&(">="===e.operator||">"===e.operator);return t||n||o&&a||c||e}}]),i}(),comparator=Comparator,re$4=re_1.re,t$4=re_1.t,satisfies=function(e,r,t){try{r=new range(r,t)}catch(e){return!1}return r.test(e)},satisfies_1=satisfies,toComparators=function(e,r){return new range(e,r).set.map(function(e){return e.map(function(e){return e.value}).join(" ").trim().split(" ")})},toComparators_1=toComparators,maxSatisfying=function(e,r,t){var n=null,o=null,a=null;try{a=new range(r,t)}catch(e){return null}return e.forEach(function(e){a.test(e)&&(n&&-1!==o.compare(e)||(o=new semver(n=e,t)))}),n},maxSatisfying_1=maxSatisfying,minSatisfying=function(e,r,t){var n=null,o=null,a=null;try{a=new range(r,t)}catch(e){return null}return e.forEach(function(e){a.test(e)&&(n&&1!==o.compare(e)||(o=new semver(n=e,t)))}),n},minSatisfying_1=minSatisfying,minVersion=function(e,r){e=new range(e,r);var t=new semver("0.0.0");if(e.test(t))return t;if(t=new semver("0.0.0-0"),e.test(t))return t;t=null;for(var n=0;n<e.set.length;++n)e.set[n].forEach(function(e){var r=new semver(e.semver.version);switch(e.operator){case">":0===r.prerelease.length?r.patch++:r.prerelease.push(0),r.raw=r.format();case"":case">=":t&&!gt_1(t,r)||(t=r);break;case"<":case"<=":break;default:throw new Error("Unexpected operation: ".concat(e.operator))}});return t&&e.test(t)?t:null},minVersion_1=minVersion,validRange=function(e,r){try{return new range(e,r).range||"*"}catch(e){return null}},valid$1=validRange,ANY$1=comparator.ANY,outside=function(n,o,e,a){var c,i,s,u,l;switch(n=new semver(n,a),o=new range(o,a),e){case">":c=gt_1,i=lte_1,s=lt_1,u=">",l=">=";break;case"<":c=lt_1,i=gte_1,s=gt_1,u="<",l="<=";break;default:throw new TypeError('Must provide a hilo val of "<" or ">"')}if(satisfies_1(n,o,a))return!1;for(var r=0;r<o.set.length;++r){var t=function(e){var e=o.set[e],r=null,t=null;return e.forEach(function(e){e.semver===ANY$1&&(e=new comparator(">=0.0.0")),r=r||e,t=t||e,c(e.semver,r.semver,a)?r=e:s(e.semver,t.semver,a)&&(t=e)}),r.operator===u||r.operator===l||(!t.operator||t.operator===u)&&i(n,t.semver)||t.operator===l&&s(n,t.semver)?{v:!1}:void 0}(r);if("object"===_typeof(t))return t.v}return!0},outside_1=outside,gtr=function(e,r,t){return outside_1(e,r,">",t)},gtr_1=gtr,ltr=function(e,r,t){return outside_1(e,r,"<",t)},ltr_1=ltr,intersects=function(e,r,t){return e=new range(e,t),r=new range(r,t),e.intersects(r)},intersects_1=intersects,simplify=function(e,r,t){var n=[],o=null,a=null,c=e.sort(function(e,r){return compare_1(e,r,t)}),i=_createForOfIteratorHelper(c);try{for(i.s();!(s=i.n()).done;)var s=s.value,o=satisfies_1(s,r,t)?(a=s,o||s):(a&&n.push([o,a]),a=null)}catch(e){i.e(e)}finally{i.f()}o&&n.push([o,null]);for(var u=[],l=0,p=n;l<p.length;l++){var f=_slicedToArray(p[l],2),E=f[0];E===(f=f[1])?u.push(E):f||E!==c[0]?f?E===c[0]?u.push("<=".concat(f)):u.push("".concat(E," - ").concat(f)):u.push(">=".concat(E)):u.push("*")}var m=u.join(" || "),e="string"==typeof r.raw?r.raw:String(r);return m.length<e.length?m:r},ANY$2=comparator.ANY,subset=function(e,r,t){e=new range(e,t),r=new range(r,t);var n,o=!1,a=_createForOfIteratorHelper(e.set);try{e:for(a.s();!(n=a.n()).done;){var c=n.value,i=_createForOfIteratorHelper(r.set);try{for(i.s();!(s=i.n()).done;){var s=s.value,s=simpleSubset(c,s,t),o=o||null!==s;if(s)continue e}}catch(e){i.e(e)}finally{i.f()}if(o)return!1}}catch(e){a.e(e)}finally{a.f()}return!0},simpleSubset=function(e,r,t){if(1===e.length&&e[0].semver===ANY$2)return 1===r.length&&r[0].semver===ANY$2;var n,o,a,c=new Set,i=_createForOfIteratorHelper(e);try{for(i.s();!(s=i.n()).done;){var s=s.value;">"===s.operator||">="===s.operator?n=higherGT(n,s,t):"<"===s.operator||"<="===s.operator?o=lowerLT(o,s,t):c.add(s.semver)}}catch(e){i.e(e)}finally{i.f()}if(1<c.size)return null;if(n&&o){if(0<(a=compare_1(n.semver,o.semver,t)))return null;if(0===a&&(">="!==n.operator||"<="!==o.operator))return null}var u,l=_createForOfIteratorHelper(c);try{for(l.s();!(u=l.n()).done;){var p=u.value;if(n&&!satisfies_1(p,String(n),t))return null;if(o&&!satisfies_1(p,String(o),t))return null;var f=_createForOfIteratorHelper(r);try{for(f.s();!(E=f.n()).done;){var E=E.value;if(!satisfies_1(p,String(E),t))return!1}}catch(e){f.e(e)}finally{f.f()}return!0}}catch(e){l.e(e)}finally{l.f()}var m=_createForOfIteratorHelper(r);try{for(m.s();!(h=m.n()).done;){var h=h.value,_=_||">"===h.operator||">="===h.operator,v=v||"<"===h.operator||"<="===h.operator;if(n)if(">"===h.operator||">="===h.operator){if(higherGT(n,h,t)===h)return!1}else if(">="===n.operator&&!satisfies_1(n.semver,String(h),t))return!1;if(o)if("<"===h.operator||"<="===h.operator){if(lowerLT(o,h,t)===h)return!1}else if("<="===o.operator&&!satisfies_1(o.semver,String(h),t))return!1;if(!h.operator&&(o||n)&&0!==a)return!1}}catch(e){m.e(e)}finally{m.f()}return!(n&&v&&!o&&0!==a||o&&_&&!n&&0!==a)},higherGT=function(e,r,t){return e&&(0<(t=compare_1(e.semver,r.semver,t))||!(t<0||">"===r.operator&&">="===e.operator))?e:r},lowerLT=function(e,r,t){return e&&((t=compare_1(e.semver,r.semver,t))<0||!(0<t||"<"===r.operator&&"<="===e.operator))?e:r},subset_1=subset,semver$1={re:re_1.re,src:re_1.src,tokens:re_1.t,SEMVER_SPEC_VERSION:constants.SEMVER_SPEC_VERSION,SemVer:semver,compareIdentifiers:identifiers.compareIdentifiers,rcompareIdentifiers:identifiers.rcompareIdentifiers,parse:parse_1,valid:valid_1,clean:clean_1,inc:inc_1,diff:diff_1,major:major_1,minor:minor_1,patch:patch_1,prerelease:prerelease_1,compare:compare_1,rcompare:rcompare_1,compareLoose:compareLoose_1,compareBuild:compareBuild_1,sort:sort_1,rsort:rsort_1,gt:gt_1,lt:lt_1,eq:eq_1,neq:neq_1,gte:gte_1,lte:lte_1,cmp:cmp_1,coerce:coerce_1,Comparator:comparator,Range:range,satisfies:satisfies_1,toComparators:toComparators,maxSatisfying:maxSatisfying,minSatisfying:minSatisfying,minVersion:minVersion,validRange:validRange,outside:outside_1,gtr:gtr,ltr:ltr,intersects:intersects,simplifyRange:simplify,subset:subset};!function(){function t(e,r){t.installed||(r?null!=semver$1.valid(e.version)?(t.installed=!0,semver$1.lt(e.version,"3.0.0")?Object.defineProperties(e.prototype,{axios:{get:function(){return r}},$http:{get:function(){return r}}}):(e.config.globalProperties.axios=r,e.config.globalProperties.$http=r),e.axios=r,e.$http=r):console.error("Unkown vue version"):console.error("You have to install axios"))}"object"==( false?0:_typeof(exports))?module.exports=t: true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function(){return t}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):0}();

/***/ }),

/***/ "./node_modules/vue-cookies/vue-cookies.js":
/*!*************************************************!*\
  !*** ./node_modules/vue-cookies/vue-cookies.js ***!
  \*************************************************/
/***/ ((module) => {

/**
 * Vue Cookies v1.7.4
 * https://github.com/cmp-cc/vue-cookies
 *
 * Copyright 2016, cmp-cc
 * Released under the MIT license
 */

(function () {

  var defaultConfig = {
    expires: '1d',
    path: '; path=/',
    domain: '',
    secure: '',
    sameSite: '; SameSite=Lax'
  };

  var VueCookies = {
    // install of Vue
    install: function (Vue) {
      Vue.prototype.$cookies = this;
      Vue.$cookies = this;
    },
    config: function (expireTimes, path, domain, secure, sameSite) {
      defaultConfig.expires = expireTimes ? expireTimes : '1d';
      defaultConfig.path = path ? '; path=' + path : '; path=/';
      defaultConfig.domain = domain ? '; domain=' + domain : '';
      defaultConfig.secure = secure ? '; Secure' : '';
      defaultConfig.sameSite = sameSite ? '; SameSite=' + sameSite : '; SameSite=Lax';
    },
    get: function (key) {
      var value = decodeURIComponent(document.cookie.replace(new RegExp('(?:(?:^|.*;)\\s*' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=\\s*([^;]*).*$)|^.*$'), '$1')) || null;

      if (value && value.substring(0, 1) === '{' && value.substring(value.length - 1, value.length) === '}') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      return value;
    },
    set: function (key, value, expireTimes, path, domain, secure, sameSite) {
      if (!key) {
        throw new Error('Cookie name is not find in first argument.');
      } else if (/^(?:expires|max\-age|path|domain|secure|SameSite)$/i.test(key)) {
        throw new Error('Cookie key name illegality, Cannot be set to ["expires","max-age","path","domain","secure","SameSite"]\t current key name: ' + key);
      }
      // support json object
      if (value && value.constructor === Object) {
        value = JSON.stringify(value);
      }
      var _expires = '';
      expireTimes = expireTimes == undefined ? defaultConfig.expires : expireTimes;
      if (expireTimes && expireTimes != 0) {
        switch (expireTimes.constructor) {
          case Number:
            if (expireTimes === Infinity || expireTimes === -1) _expires = '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
            else _expires = '; max-age=' + expireTimes;
            break;
          case String:
            if (/^(?:\d+(y|m|d|h|min|s))$/i.test(expireTimes)) {
              // get capture number group
              var _expireTime = expireTimes.replace(/^(\d+)(?:y|m|d|h|min|s)$/i, '$1');
              // get capture type group , to lower case
              switch (expireTimes.replace(/^(?:\d+)(y|m|d|h|min|s)$/i, '$1').toLowerCase()) {
                  // Frequency sorting
                case 'm':
                  _expires = '; max-age=' + +_expireTime * 2592000;
                  break; // 60 * 60 * 24 * 30
                case 'd':
                  _expires = '; max-age=' + +_expireTime * 86400;
                  break; // 60 * 60 * 24
                case 'h':
                  _expires = '; max-age=' + +_expireTime * 3600;
                  break; // 60 * 60
                case 'min':
                  _expires = '; max-age=' + +_expireTime * 60;
                  break; // 60
                case 's':
                  _expires = '; max-age=' + _expireTime;
                  break;
                case 'y':
                  _expires = '; max-age=' + +_expireTime * 31104000;
                  break; // 60 * 60 * 24 * 30 * 12
                default:
                  new Error('unknown exception of "set operation"');
              }
            } else {
              _expires = '; expires=' + expireTimes;
            }
            break;
          case Date:
            _expires = '; expires=' + expireTimes.toUTCString();
            break;
        }
      }
      document.cookie =
          encodeURIComponent(key) + '=' + encodeURIComponent(value) +
          _expires +
          (domain ? '; domain=' + domain : defaultConfig.domain) +
          (path ? '; path=' + path : defaultConfig.path) +
          (secure == undefined ? defaultConfig.secure : secure ? '; Secure' : '') +
          (sameSite == undefined ? defaultConfig.sameSite : (sameSite ? '; SameSite=' + sameSite : ''));
      return this;
    },
    remove: function (key, path, domain) {
      if (!key || !this.isKey(key)) {
        return false;
      }
      document.cookie = encodeURIComponent(key) +
          '=; expires=Thu, 01 Jan 1970 00:00:00 GMT' +
          (domain ? '; domain=' + domain : defaultConfig.domain) +
          (path ? '; path=' + path : defaultConfig.path) +
          '; SameSite=Lax';
      return this;
    },
    isKey: function (key) {
      return (new RegExp('(?:^|;\\s*)' + encodeURIComponent(key).replace(/[\-\.\+\*]/g, '\\$&') + '\\s*\\=')).test(document.cookie);
    },
    keys: function () {
      if (!document.cookie) return [];
      var _keys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:\=[^;]*)?;\s*/);
      for (var _index = 0; _index < _keys.length; _index++) {
        _keys[_index] = decodeURIComponent(_keys[_index]);
      }
      return _keys;
    }
  };

  if (true) {
    module.exports = VueCookies;
  } else {}
  // vue-cookies can exist independently,no dependencies library
  if (typeof window !== 'undefined') {
    window.$cookies = VueCookies;
  }

})();


/***/ }),

/***/ "./resources/js/views/App.vue":
/*!************************************!*\
  !*** ./resources/js/views/App.vue ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _App_vue_vue_type_template_id_91ac6b5c___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./App.vue?vue&type=template&id=91ac6b5c& */ "./resources/js/views/App.vue?vue&type=template&id=91ac6b5c&");
/* harmony import */ var _App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./App.vue?vue&type=script&lang=js& */ "./resources/js/views/App.vue?vue&type=script&lang=js&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__.default,
  _App_vue_vue_type_template_id_91ac6b5c___WEBPACK_IMPORTED_MODULE_0__.render,
  _App_vue_vue_type_template_id_91ac6b5c___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "resources/js/views/App.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./resources/js/views/CurrentTrack.vue":
/*!*********************************************!*\
  !*** ./resources/js/views/CurrentTrack.vue ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _CurrentTrack_vue_vue_type_template_id_7ad7b6f1___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CurrentTrack.vue?vue&type=template&id=7ad7b6f1& */ "./resources/js/views/CurrentTrack.vue?vue&type=template&id=7ad7b6f1&");
/* harmony import */ var _CurrentTrack_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CurrentTrack.vue?vue&type=script&lang=js& */ "./resources/js/views/CurrentTrack.vue?vue&type=script&lang=js&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _CurrentTrack_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__.default,
  _CurrentTrack_vue_vue_type_template_id_7ad7b6f1___WEBPACK_IMPORTED_MODULE_0__.render,
  _CurrentTrack_vue_vue_type_template_id_7ad7b6f1___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "resources/js/views/CurrentTrack.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./resources/js/views/PreviousTracks.vue":
/*!***********************************************!*\
  !*** ./resources/js/views/PreviousTracks.vue ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _PreviousTracks_vue_vue_type_template_id_63467484___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PreviousTracks.vue?vue&type=template&id=63467484& */ "./resources/js/views/PreviousTracks.vue?vue&type=template&id=63467484&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");

var script = {}


/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_1__.default)(
  script,
  _PreviousTracks_vue_vue_type_template_id_63467484___WEBPACK_IMPORTED_MODULE_0__.render,
  _PreviousTracks_vue_vue_type_template_id_63467484___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "resources/js/views/PreviousTracks.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./resources/js/views/SettingsPiano.vue":
/*!**********************************************!*\
  !*** ./resources/js/views/SettingsPiano.vue ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _SettingsPiano_vue_vue_type_template_id_351d4957___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SettingsPiano.vue?vue&type=template&id=351d4957& */ "./resources/js/views/SettingsPiano.vue?vue&type=template&id=351d4957&");
/* harmony import */ var _SettingsPiano_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./SettingsPiano.vue?vue&type=script&lang=js& */ "./resources/js/views/SettingsPiano.vue?vue&type=script&lang=js&");
/* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */
;
var component = (0,_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__.default)(
  _SettingsPiano_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_1__.default,
  _SettingsPiano_vue_vue_type_template_id_351d4957___WEBPACK_IMPORTED_MODULE_0__.render,
  _SettingsPiano_vue_vue_type_template_id_351d4957___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "resources/js/views/SettingsPiano.vue"
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (component.exports);

/***/ }),

/***/ "./resources/js/views/App.vue?vue&type=script&lang=js&":
/*!*************************************************************!*\
  !*** ./resources/js/views/App.vue?vue&type=script&lang=js& ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/App.vue?vue&type=script&lang=js&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./resources/js/views/CurrentTrack.vue?vue&type=script&lang=js&":
/*!**********************************************************************!*\
  !*** ./resources/js/views/CurrentTrack.vue?vue&type=script&lang=js& ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CurrentTrack_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./CurrentTrack.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/CurrentTrack.vue?vue&type=script&lang=js&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_CurrentTrack_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./resources/js/views/SettingsPiano.vue?vue&type=script&lang=js&":
/*!***********************************************************************!*\
  !*** ./resources/js/views/SettingsPiano.vue?vue&type=script&lang=js& ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SettingsPiano_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./SettingsPiano.vue?vue&type=script&lang=js& */ "./node_modules/babel-loader/lib/index.js??clonedRuleSet-5[0].rules[0].use[0]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/SettingsPiano.vue?vue&type=script&lang=js&");
 /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_babel_loader_lib_index_js_clonedRuleSet_5_0_rules_0_use_0_node_modules_vue_loader_lib_index_js_vue_loader_options_SettingsPiano_vue_vue_type_script_lang_js___WEBPACK_IMPORTED_MODULE_0__.default); 

/***/ }),

/***/ "./resources/js/views/App.vue?vue&type=template&id=91ac6b5c&":
/*!*******************************************************************!*\
  !*** ./resources/js/views/App.vue?vue&type=template&id=91ac6b5c& ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_template_id_91ac6b5c___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_template_id_91ac6b5c___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_App_vue_vue_type_template_id_91ac6b5c___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./App.vue?vue&type=template&id=91ac6b5c& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/App.vue?vue&type=template&id=91ac6b5c&");


/***/ }),

/***/ "./resources/js/views/CurrentTrack.vue?vue&type=template&id=7ad7b6f1&":
/*!****************************************************************************!*\
  !*** ./resources/js/views/CurrentTrack.vue?vue&type=template&id=7ad7b6f1& ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_CurrentTrack_vue_vue_type_template_id_7ad7b6f1___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_CurrentTrack_vue_vue_type_template_id_7ad7b6f1___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_CurrentTrack_vue_vue_type_template_id_7ad7b6f1___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./CurrentTrack.vue?vue&type=template&id=7ad7b6f1& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/CurrentTrack.vue?vue&type=template&id=7ad7b6f1&");


/***/ }),

/***/ "./resources/js/views/PreviousTracks.vue?vue&type=template&id=63467484&":
/*!******************************************************************************!*\
  !*** ./resources/js/views/PreviousTracks.vue?vue&type=template&id=63467484& ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_PreviousTracks_vue_vue_type_template_id_63467484___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_PreviousTracks_vue_vue_type_template_id_63467484___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_PreviousTracks_vue_vue_type_template_id_63467484___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./PreviousTracks.vue?vue&type=template&id=63467484& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/PreviousTracks.vue?vue&type=template&id=63467484&");


/***/ }),

/***/ "./resources/js/views/SettingsPiano.vue?vue&type=template&id=351d4957&":
/*!*****************************************************************************!*\
  !*** ./resources/js/views/SettingsPiano.vue?vue&type=template&id=351d4957& ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_SettingsPiano_vue_vue_type_template_id_351d4957___WEBPACK_IMPORTED_MODULE_0__.render),
/* harmony export */   "staticRenderFns": () => (/* reexport safe */ _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_SettingsPiano_vue_vue_type_template_id_351d4957___WEBPACK_IMPORTED_MODULE_0__.staticRenderFns)
/* harmony export */ });
/* harmony import */ var _node_modules_vue_loader_lib_loaders_templateLoader_js_vue_loader_options_node_modules_vue_loader_lib_index_js_vue_loader_options_SettingsPiano_vue_vue_type_template_id_351d4957___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../../node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!../../../node_modules/vue-loader/lib/index.js??vue-loader-options!./SettingsPiano.vue?vue&type=template&id=351d4957& */ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/SettingsPiano.vue?vue&type=template&id=351d4957&");


/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/App.vue?vue&type=template&id=91ac6b5c&":
/*!**********************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/App.vue?vue&type=template&id=91ac6b5c& ***!
  \**********************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "page" }, [
    _c(
      "div",
      {
        class: [
          "radio-play-button",
          { hide: _vm.startedRadio, shrink: _vm.startedRadio }
        ],
        on: { click: _vm.startRadio }
      },
      [
        _c("div", { staticClass: "description" }),
        _vm._v(" "),
        _c("i", { staticClass: "fas fa-play fa-6x" })
      ]
    ),
    _vm._v(" "),
    _c(
      "div",
      {
        class: {
          "show-mostly": Object.keys(_vm.currentTrack).length !== 0,
          hide: _vm.collapsedInfoBox == 1
        },
        attrs: { id: "info" }
      },
      [
        _c(
          "div",
          { staticClass: "flip-card", class: { flipped: _vm.flippedInfoBox } },
          [
            _c("div", { staticClass: "flip-card-inner" }, [
              _c(
                "div",
                { staticClass: "flip-card-back" },
                [
                  _c(_vm.settingsComponent, {
                    tag: "component",
                    attrs: { settings: _vm.settings }
                  })
                ],
                1
              ),
              _vm._v(" "),
              _c("div", { staticClass: "flip-card-front" }, [
                _c("div", { staticClass: "radio-container radio-tracks" }, [
                  _c(
                    "div",
                    { staticClass: "radio-contents" },
                    [
                      _c("div", { staticClass: "radio-options" }, [
                        _c("i", {
                          staticClass: "fas fa-minus collapse",
                          on: {
                            click: function($event) {
                              _vm.collapsedInfoBox = 1
                            }
                          }
                        }),
                        _vm._v(" "),
                        _c("i", {
                          staticClass: "fas fa-cog settings",
                          on: { click: _vm.toggleSettings }
                        })
                      ]),
                      _vm._v(" "),
                      Object.keys(_vm.currentTrack).length !== 0
                        ? _c("CurrentTrack", {
                            attrs: {
                              track: _vm.currentTrack.track_name,
                              artist: _vm.currentTrack.artist_name,
                              image: _vm.currentTrack.artist_image_url,
                              url: ""
                            }
                          })
                        : _vm._e(),
                      _vm._v(" "),
                      _vm.previousTracks.length > 0
                        ? _c("PreviousTracks")
                        : _vm._e()
                    ],
                    1
                  )
                ])
              ])
            ])
          ]
        )
      ]
    ),
    _vm._v(" "),
    _c(
      "div",
      {
        class: [
          "site",
          {
            show: Object.keys(_vm.currentTrack).length !== 0,
            slow: Object.keys(_vm.currentTrack).length !== 0
          }
        ],
        attrs: { id: "player-box" }
      },
      [
        _c(
          "div",
          {
            class: { unblur: _vm.collapsedInfoBox == 1 },
            attrs: { id: "player-container" }
          },
          [
            _c("div", {
              class: { "background-transparent": _vm.collapsedInfoBox == 1 },
              attrs: { id: "blank-overlay" }
            }),
            _vm._v(" "),
            _c(
              "div",
              { attrs: { id: "player-overlay" } },
              [
                _c("vue-plyr", { ref: "plyr" }, [
                  _c("div", {
                    attrs: {
                      "data-plyr-provider": "youtube",
                      "data-plyr-embed-id": "8tPnX7OPo0Q"
                    }
                  })
                ])
              ],
              1
            )
          ]
        )
      ]
    ),
    _vm._v(" "),
    _c("div", { staticClass: "footer" }, [
      _c("div", { class: { hide: _vm.collapsedInfoBox } }, [
        _vm._v("\n      Leave this window open to continue listening\n    ")
      ]),
      _vm._v(" "),
      _c(
        "div",
        {
          class: { show: _vm.collapsedInfoBox },
          attrs: { id: "collapsed-track-playing" },
          on: {
            click: function($event) {
              _vm.collapsedInfoBox = 0
            }
          }
        },
        [
          _c("i", { staticClass: "expand fas fa-angle-up" }),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "track-container" },
            [
              _vm.collapsedInfoBox
                ? _c("CurrentTrack", {
                    attrs: {
                      track: _vm.currentTrack.track_name,
                      artist: _vm.currentTrack.artist_name,
                      image: _vm.currentTrack.artist_image_url,
                      url: ""
                    }
                  })
                : _vm._e()
            ],
            1
          )
        ]
      )
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/CurrentTrack.vue?vue&type=template&id=7ad7b6f1&":
/*!*******************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/CurrentTrack.vue?vue&type=template&id=7ad7b6f1& ***!
  \*******************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "track-playing" } }, [
    _c("div", { staticClass: "track-row track-current" }, [
      _c("img", {
        staticClass: "track-image",
        attrs: { src: _vm.image, alt: "" }
      }),
      _vm._v(" "),
      _c("div", { staticClass: "track-details" }, [
        _c("span", { staticClass: "track-name" }, [_vm._v(_vm._s(_vm.track))]),
        _vm._v(" "),
        _c("span", [_vm._v("by")]),
        _vm._v(" "),
        _c("span", { staticClass: "track-artist" }, [
          _c("a", { attrs: { href: _vm.url } }, [_vm._v(_vm._s(_vm.artist))])
        ])
      ]),
      _vm._v(" "),
      _c(
        "div",
        {
          directives: [
            {
              name: "show",
              rawName: "v-show",
              value: _vm.showWaveForm,
              expression: "showWaveForm"
            }
          ],
          staticClass: "track-visualization"
        },
        [
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" }),
          _vm._v(" "),
          _c("div", { staticClass: "audio-bar" })
        ]
      )
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/PreviousTracks.vue?vue&type=template&id=63467484&":
/*!*********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/PreviousTracks.vue?vue&type=template&id=63467484& ***!
  \*********************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c("h2", [_vm._v("Previously Played")]),
      _vm._v(" "),
      _vm._l(_vm.$parent.previousTracks, function(track) {
        return _c("div", { staticClass: "track-row track-other previous" }, [
          _c("img", {
            staticClass: "track-image",
            attrs: { src: track.artist_image_url, alt: "" }
          }),
          _vm._v(" "),
          _c("div", { staticClass: "track-details" }, [
            _c("span", { staticClass: "track-name" }, [
              _vm._v(_vm._s(track.track_name))
            ]),
            _vm._v(" "),
            _c("span", [_vm._v("by")]),
            _vm._v(" "),
            _c("span", { staticClass: "track-artist" }, [
              _c("a", { attrs: { href: track.artist_url } }, [
                _vm._v(_vm._s(track.artist_name))
              ])
            ])
          ])
        ])
      })
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/SettingsPiano.vue?vue&type=template&id=351d4957&":
/*!********************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/vue-loader/lib/loaders/templateLoader.js??vue-loader-options!./node_modules/vue-loader/lib/index.js??vue-loader-options!./resources/js/views/SettingsPiano.vue?vue&type=template&id=351d4957& ***!
  \********************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "render": () => (/* binding */ render),
/* harmony export */   "staticRenderFns": () => (/* binding */ staticRenderFns)
/* harmony export */ });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "radio-container radio-settings",
      attrs: {
        "data-settings-mood": _vm.mood,
        "data-settings-style": _vm.style,
        "data-settings-sacred": _vm.sacred,
        "data-settings-christmas": _vm.christmas,
        "data-settings-classical": _vm.classical
      }
    },
    [
      _c("div", { staticClass: "radio-contents" }, [
        _c("div", { staticClass: "radio-options" }, [
          _c("i", {
            staticClass: "fas fa-times close",
            on: { click: _vm.$parent.toggleSettings }
          })
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "preference-row settings-mood" }, [
          _c("label", { attrs: { for: "mood" } }, [_vm._v("Mood")]),
          _vm._v(" "),
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.mood,
                expression: "mood"
              }
            ],
            staticClass: "slider slider-stylistic",
            attrs: {
              name: "mood",
              type: "range",
              min: "0",
              max: "3",
              step: "1",
              "data-value": _vm.mood
            },
            domProps: { value: _vm.mood },
            on: {
              input: function($event) {
                return _vm.$parent.updateSetting($event)
              },
              __r: function($event) {
                _vm.mood = $event.target.value
              }
            }
          }),
          _vm._v(" "),
          _c("span", { staticClass: "value value-0" }, [_vm._v("whatever")]),
          _vm._v(" "),
          _c("span", { staticClass: "value value-1" }, [_vm._v("soft")]),
          _vm._v(" "),
          _c("span", { staticClass: "value value-2" }, [_vm._v("neutral")]),
          _vm._v(" "),
          _c("span", { staticClass: "value value-3" }, [_vm._v("lively")])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "preference-row settings-style" }, [
          _c("label", { attrs: { for: "mood" } }, [_vm._v("Style")]),
          _vm._v(" "),
          _c("input", {
            directives: [
              {
                name: "model",
                rawName: "v-model",
                value: _vm.style,
                expression: "style"
              }
            ],
            staticClass: "slider slider-stylistic",
            attrs: {
              name: "style",
              type: "range",
              min: "0",
              max: "3",
              step: "1",
              "data-value": _vm.style
            },
            domProps: { value: _vm.style },
            on: {
              input: function($event) {
                return _vm.$parent.updateSetting($event)
              },
              __r: function($event) {
                _vm.style = $event.target.value
              }
            }
          }),
          _vm._v(" "),
          _c("span", { staticClass: "value value-0" }, [_vm._v("whatever")]),
          _vm._v(" "),
          _c("span", { staticClass: "value value-1" }, [_vm._v("solo")]),
          _vm._v(" "),
          _c("span", { staticClass: "value value-2" }, [_vm._v("duet")]),
          _vm._v(" "),
          _c("span", { staticClass: "value value-3" }, [_vm._v("instrumental")])
        ]),
        _vm._v(" "),
        _c(
          "div",
          {
            class: [
              "preference-row",
              { grey: _vm.christmas == 2 || _vm.classical == 2 }
            ]
          },
          [
            _c("label", { attrs: { for: "sacred" } }, [
              _vm._v("Play sacred music")
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.sacred,
                  expression: "sacred"
                }
              ],
              staticClass: "slider slider-genre",
              attrs: {
                name: "sacred",
                type: "range",
                min: "0",
                max: "2",
                step: "1",
                "data-value": _vm.sacred
              },
              domProps: { value: _vm.sacred },
              on: {
                input: function($event) {
                  return _vm.$parent.updateSetting($event)
                },
                __r: function($event) {
                  _vm.sacred = $event.target.value
                }
              }
            }),
            _vm._v(" "),
            _c("span", { staticClass: "value value-0" }, [_vm._v("never")]),
            _vm._v(" "),
            _c("span", { staticClass: "value value-1" }, [_vm._v("sometimes")]),
            _vm._v(" "),
            _c("span", { staticClass: "value value-2" }, [_vm._v("always")])
          ]
        ),
        _vm._v(" "),
        _c(
          "div",
          {
            class: [
              "preference-row",
              { grey: _vm.sacred == 2 || _vm.classical == 2 }
            ]
          },
          [
            _c("label", { attrs: { for: "christmas" } }, [
              _vm._v("Play Christmas music")
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.christmas,
                  expression: "christmas"
                }
              ],
              staticClass: "slider slider-genre",
              attrs: {
                name: "christmas",
                type: "range",
                min: "0",
                max: "2",
                step: "1",
                "data-value": _vm.christmas
              },
              domProps: { value: _vm.christmas },
              on: {
                input: function($event) {
                  return _vm.$parent.updateSetting($event)
                },
                __r: function($event) {
                  _vm.christmas = $event.target.value
                }
              }
            }),
            _vm._v(" "),
            _c("span", { staticClass: "value value-0" }, [_vm._v("never")]),
            _vm._v(" "),
            _c("span", { staticClass: "value value-1" }, [_vm._v("sometimes")]),
            _vm._v(" "),
            _c("span", { staticClass: "value value-2" }, [_vm._v("always")])
          ]
        ),
        _vm._v(" "),
        _c(
          "div",
          {
            class: [
              "preference-row",
              { grey: _vm.sacred == 2 || _vm.christmas == 2 }
            ]
          },
          [
            _c("label", { attrs: { for: "christmas" } }, [
              _vm._v("Play classical music")
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.classical,
                  expression: "classical"
                }
              ],
              staticClass: "slider slider-genre",
              attrs: {
                name: "christmas",
                type: "range",
                min: "0",
                max: "2",
                step: "1",
                "data-value": _vm.classical,
                input: "$parent.updateSetting($event)"
              },
              domProps: { value: _vm.classical },
              on: {
                __r: function($event) {
                  _vm.classical = $event.target.value
                }
              }
            }),
            _vm._v(" "),
            _c("span", { staticClass: "value value-0" }, [_vm._v("never")]),
            _vm._v(" "),
            _c("span", { staticClass: "value value-1" }, [_vm._v("sometimes")]),
            _vm._v(" "),
            _c("span", { staticClass: "value value-2" }, [_vm._v("always")])
          ]
        )
      ])
    ]
  )
}
var staticRenderFns = []
render._withStripped = true



/***/ }),

/***/ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js":
/*!********************************************************************!*\
  !*** ./node_modules/vue-loader/lib/runtime/componentNormalizer.js ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ normalizeComponent)
/* harmony export */ });
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
        injectStyles.call(
          this,
          (options.functional ? this.parent : this).$root.$options.shadowRoot
        )
      }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ "./node_modules/vue-plyr/dist/vue-plyr.esm.js":
/*!****************************************************!*\
  !*** ./node_modules/vue-plyr/dist/vue-plyr.esm.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var e=function(e){try{return!!e()}catch(e){return!0}},t=!e((function(){return 7!=Object.defineProperty({},1,{get:function(){return 7}})[1]})),n="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self?self:{};function i(e,t,n){return e(n={path:t,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&n.path)}},n.exports),n.exports}var r=function(e){return e&&e.Math==Math&&e},a=r("object"==typeof globalThis&&globalThis)||r("object"==typeof window&&window)||r("object"==typeof self&&self)||r("object"==typeof n&&n)||Function("return this")(),o=function(e){return"object"==typeof e?null!==e:"function"==typeof e},s=a.document,l=o(s)&&o(s.createElement),c=function(e){return l?s.createElement(e):{}},u=!t&&!e((function(){return 7!=Object.defineProperty(c("div"),"a",{get:function(){return 7}}).a})),h=function(e){if(!o(e))throw TypeError(String(e)+" is not an object");return e},d=function(e,t){if(!o(e))return e;var n,i;if(t&&"function"==typeof(n=e.toString)&&!o(i=n.call(e)))return i;if("function"==typeof(n=e.valueOf)&&!o(i=n.call(e)))return i;if(!t&&"function"==typeof(n=e.toString)&&!o(i=n.call(e)))return i;throw TypeError("Can't convert object to primitive value")},f=Object.defineProperty,p={f:t?f:function(e,t,n){if(h(e),t=d(t,!0),h(n),u)try{return f(e,t,n)}catch(e){}if("get"in n||"set"in n)throw TypeError("Accessors not supported");return"value"in n&&(e[t]=n.value),e}},m=p.f,g=Function.prototype,v=g.toString,y=/^\s*function ([^ (]*)/;t&&!("name"in g)&&m(g,"name",{configurable:!0,get:function(){try{return v.call(this).match(y)[1]}catch(e){return""}}});var b={}.propertyIsEnumerable,w=Object.getOwnPropertyDescriptor,k={f:w&&!b.call({1:2},1)?function(e){var t=w(this,e);return!!t&&t.enumerable}:b},T=function(e,t){return{enumerable:!(1&e),configurable:!(2&e),writable:!(4&e),value:t}},S={}.toString,E=function(e){return S.call(e).slice(8,-1)},A="".split,x=e((function(){return!Object("z").propertyIsEnumerable(0)}))?function(e){return"String"==E(e)?A.call(e,""):Object(e)}:Object,C=function(e){if(null==e)throw TypeError("Can't call method on "+e);return e},P=function(e){return x(C(e))},O={}.hasOwnProperty,I=function(e,t){return O.call(e,t)},L=Object.getOwnPropertyDescriptor,N={f:t?L:function(e,t){if(e=P(e),t=d(t,!0),u)try{return L(e,t)}catch(e){}if(I(e,t))return T(!k.f.call(e,t),e[t])}},M=t?function(e,t,n){return p.f(e,t,T(1,n))}:function(e,t,n){return e[t]=n,e},j=function(e,t){try{M(a,e,t)}catch(n){a[e]=t}return t},R=a["__core-js_shared__"]||j("__core-js_shared__",{}),_=Function.toString;"function"!=typeof R.inspectSource&&(R.inspectSource=function(e){return _.call(e)});var D,F,q,U=R.inspectSource,H=a.WeakMap,B="function"==typeof H&&/native code/.test(U(H)),V=i((function(e){(e.exports=function(e,t){return R[e]||(R[e]=void 0!==t?t:{})})("versions",[]).push({version:"3.6.5",mode:"global",copyright:"© 2020 Denis Pushkarev (zloirock.ru)"})})),z=0,W=Math.random(),$=function(e){return"Symbol("+String(void 0===e?"":e)+")_"+(++z+W).toString(36)},K=V("keys"),Y=function(e){return K[e]||(K[e]=$(e))},G={},X=a.WeakMap;if(B){var Q=new X,J=Q.get,Z=Q.has,ee=Q.set;D=function(e,t){return ee.call(Q,e,t),t},F=function(e){return J.call(Q,e)||{}},q=function(e){return Z.call(Q,e)}}else{var te=Y("state");G[te]=!0,D=function(e,t){return M(e,te,t),t},F=function(e){return I(e,te)?e[te]:{}},q=function(e){return I(e,te)}}var ne,ie={set:D,get:F,has:q,enforce:function(e){return q(e)?F(e):D(e,{})},getterFor:function(e){return function(t){var n;if(!o(t)||(n=F(t)).type!==e)throw TypeError("Incompatible receiver, "+e+" required");return n}}},re=i((function(e){var t=ie.get,n=ie.enforce,i=String(String).split("String");(e.exports=function(e,t,r,o){var s=!!o&&!!o.unsafe,l=!!o&&!!o.enumerable,c=!!o&&!!o.noTargetGet;"function"==typeof r&&("string"!=typeof t||I(r,"name")||M(r,"name",t),n(r).source=i.join("string"==typeof t?t:"")),e!==a?(s?!c&&e[t]&&(l=!0):delete e[t],l?e[t]=r:M(e,t,r)):l?e[t]=r:j(t,r)})(Function.prototype,"toString",(function(){return"function"==typeof this&&t(this).source||U(this)}))})),ae=a,oe=function(e){return"function"==typeof e?e:void 0},se=function(e,t){return arguments.length<2?oe(ae[e])||oe(a[e]):ae[e]&&ae[e][t]||a[e]&&a[e][t]},le=Math.ceil,ce=Math.floor,ue=function(e){return isNaN(e=+e)?0:(e>0?ce:le)(e)},he=Math.min,de=function(e){return e>0?he(ue(e),9007199254740991):0},fe=Math.max,pe=Math.min,me=function(e,t){var n=ue(e);return n<0?fe(n+t,0):pe(n,t)},ge=function(e){return function(t,n,i){var r,a=P(t),o=de(a.length),s=me(i,o);if(e&&n!=n){for(;o>s;)if((r=a[s++])!=r)return!0}else for(;o>s;s++)if((e||s in a)&&a[s]===n)return e||s||0;return!e&&-1}},ve={includes:ge(!0),indexOf:ge(!1)},ye=ve.indexOf,be=function(e,t){var n,i=P(e),r=0,a=[];for(n in i)!I(G,n)&&I(i,n)&&a.push(n);for(;t.length>r;)I(i,n=t[r++])&&(~ye(a,n)||a.push(n));return a},we=["constructor","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","toLocaleString","toString","valueOf"],ke=we.concat("length","prototype"),Te={f:Object.getOwnPropertyNames||function(e){return be(e,ke)}},Se={f:Object.getOwnPropertySymbols},Ee=se("Reflect","ownKeys")||function(e){var t=Te.f(h(e)),n=Se.f;return n?t.concat(n(e)):t},Ae=function(e,t){for(var n=Ee(t),i=p.f,r=N.f,a=0;a<n.length;a++){var o=n[a];I(e,o)||i(e,o,r(t,o))}},xe=/#|\.prototype\./,Ce=function(t,n){var i=Oe[Pe(t)];return i==Le||i!=Ie&&("function"==typeof n?e(n):!!n)},Pe=Ce.normalize=function(e){return String(e).replace(xe,".").toLowerCase()},Oe=Ce.data={},Ie=Ce.NATIVE="N",Le=Ce.POLYFILL="P",Ne=Ce,Me=N.f,je=function(e,t){var n,i,r,o,s,l=e.target,c=e.global,u=e.stat;if(n=c?a:u?a[l]||j(l,{}):(a[l]||{}).prototype)for(i in t){if(o=t[i],r=e.noTargetGet?(s=Me(n,i))&&s.value:n[i],!Ne(c?i:l+(u?".":"#")+i,e.forced)&&void 0!==r){if(typeof o==typeof r)continue;Ae(o,r)}(e.sham||r&&r.sham)&&M(o,"sham",!0),re(n,i,o,e)}},Re=!!Object.getOwnPropertySymbols&&!e((function(){return!String(Symbol())})),_e=Re&&!Symbol.sham&&"symbol"==typeof Symbol.iterator,De=Array.isArray||function(e){return"Array"==E(e)},Fe=function(e){return Object(C(e))},qe=Object.keys||function(e){return be(e,we)},Ue=t?Object.defineProperties:function(e,t){h(e);for(var n,i=qe(t),r=i.length,a=0;r>a;)p.f(e,n=i[a++],t[n]);return e},He=se("document","documentElement"),Be=Y("IE_PROTO"),Ve=function(){},ze=function(e){return"<script>"+e+"<\/script>"},We=function(){try{ne=document.domain&&new ActiveXObject("htmlfile")}catch(e){}var e,t;We=ne?function(e){e.write(ze("")),e.close();var t=e.parentWindow.Object;return e=null,t}(ne):((t=c("iframe")).style.display="none",He.appendChild(t),t.src=String("javascript:"),(e=t.contentWindow.document).open(),e.write(ze("document.F=Object")),e.close(),e.F);for(var n=we.length;n--;)delete We.prototype[we[n]];return We()};G[Be]=!0;var $e=Object.create||function(e,t){var n;return null!==e?(Ve.prototype=h(e),n=new Ve,Ve.prototype=null,n[Be]=e):n=We(),void 0===t?n:Ue(n,t)},Ke=Te.f,Ye={}.toString,Ge="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],Xe={f:function(e){return Ge&&"[object Window]"==Ye.call(e)?function(e){try{return Ke(e)}catch(e){return Ge.slice()}}(e):Ke(P(e))}},Qe=V("wks"),Je=a.Symbol,Ze=_e?Je:Je&&Je.withoutSetter||$,et=function(e){return I(Qe,e)||(Re&&I(Je,e)?Qe[e]=Je[e]:Qe[e]=Ze("Symbol."+e)),Qe[e]},tt={f:et},nt=p.f,it=function(e){var t=ae.Symbol||(ae.Symbol={});I(t,e)||nt(t,e,{value:tt.f(e)})},rt=p.f,at=et("toStringTag"),ot=function(e,t,n){e&&!I(e=n?e:e.prototype,at)&&rt(e,at,{configurable:!0,value:t})},st=function(e){if("function"!=typeof e)throw TypeError(String(e)+" is not a function");return e},lt=function(e,t,n){if(st(e),void 0===t)return e;switch(n){case 0:return function(){return e.call(t)};case 1:return function(n){return e.call(t,n)};case 2:return function(n,i){return e.call(t,n,i)};case 3:return function(n,i,r){return e.call(t,n,i,r)}}return function(){return e.apply(t,arguments)}},ct=et("species"),ut=function(e,t){var n;return De(e)&&("function"!=typeof(n=e.constructor)||n!==Array&&!De(n.prototype)?o(n)&&null===(n=n[ct])&&(n=void 0):n=void 0),new(void 0===n?Array:n)(0===t?0:t)},ht=[].push,dt=function(e){var t=1==e,n=2==e,i=3==e,r=4==e,a=6==e,o=5==e||a;return function(s,l,c,u){for(var h,d,f=Fe(s),p=x(f),m=lt(l,c,3),g=de(p.length),v=0,y=u||ut,b=t?y(s,g):n?y(s,0):void 0;g>v;v++)if((o||v in p)&&(d=m(h=p[v],v,f),e))if(t)b[v]=d;else if(d)switch(e){case 3:return!0;case 5:return h;case 6:return v;case 2:ht.call(b,h)}else if(r)return!1;return a?-1:i||r?r:b}},ft={forEach:dt(0),map:dt(1),filter:dt(2),some:dt(3),every:dt(4),find:dt(5),findIndex:dt(6)},pt=ft.forEach,mt=Y("hidden"),gt=et("toPrimitive"),vt=ie.set,yt=ie.getterFor("Symbol"),bt=Object.prototype,wt=a.Symbol,kt=se("JSON","stringify"),Tt=N.f,St=p.f,Et=Xe.f,At=k.f,xt=V("symbols"),Ct=V("op-symbols"),Pt=V("string-to-symbol-registry"),Ot=V("symbol-to-string-registry"),It=V("wks"),Lt=a.QObject,Nt=!Lt||!Lt.prototype||!Lt.prototype.findChild,Mt=t&&e((function(){return 7!=$e(St({},"a",{get:function(){return St(this,"a",{value:7}).a}})).a}))?function(e,t,n){var i=Tt(bt,t);i&&delete bt[t],St(e,t,n),i&&e!==bt&&St(bt,t,i)}:St,jt=function(e,n){var i=xt[e]=$e(wt.prototype);return vt(i,{type:"Symbol",tag:e,description:n}),t||(i.description=n),i},Rt=_e?function(e){return"symbol"==typeof e}:function(e){return Object(e)instanceof wt},_t=function(e,t,n){e===bt&&_t(Ct,t,n),h(e);var i=d(t,!0);return h(n),I(xt,i)?(n.enumerable?(I(e,mt)&&e[mt][i]&&(e[mt][i]=!1),n=$e(n,{enumerable:T(0,!1)})):(I(e,mt)||St(e,mt,T(1,{})),e[mt][i]=!0),Mt(e,i,n)):St(e,i,n)},Dt=function(e,n){h(e);var i=P(n),r=qe(i).concat(Ht(i));return pt(r,(function(n){t&&!Ft.call(i,n)||_t(e,n,i[n])})),e},Ft=function(e){var t=d(e,!0),n=At.call(this,t);return!(this===bt&&I(xt,t)&&!I(Ct,t))&&(!(n||!I(this,t)||!I(xt,t)||I(this,mt)&&this[mt][t])||n)},qt=function(e,t){var n=P(e),i=d(t,!0);if(n!==bt||!I(xt,i)||I(Ct,i)){var r=Tt(n,i);return!r||!I(xt,i)||I(n,mt)&&n[mt][i]||(r.enumerable=!0),r}},Ut=function(e){var t=Et(P(e)),n=[];return pt(t,(function(e){I(xt,e)||I(G,e)||n.push(e)})),n},Ht=function(e){var t=e===bt,n=Et(t?Ct:P(e)),i=[];return pt(n,(function(e){!I(xt,e)||t&&!I(bt,e)||i.push(xt[e])})),i};if(Re||(re((wt=function(){if(this instanceof wt)throw TypeError("Symbol is not a constructor");var e=arguments.length&&void 0!==arguments[0]?String(arguments[0]):void 0,n=$(e),i=function(e){this===bt&&i.call(Ct,e),I(this,mt)&&I(this[mt],n)&&(this[mt][n]=!1),Mt(this,n,T(1,e))};return t&&Nt&&Mt(bt,n,{configurable:!0,set:i}),jt(n,e)}).prototype,"toString",(function(){return yt(this).tag})),re(wt,"withoutSetter",(function(e){return jt($(e),e)})),k.f=Ft,p.f=_t,N.f=qt,Te.f=Xe.f=Ut,Se.f=Ht,tt.f=function(e){return jt(et(e),e)},t&&(St(wt.prototype,"description",{configurable:!0,get:function(){return yt(this).description}}),re(bt,"propertyIsEnumerable",Ft,{unsafe:!0}))),je({global:!0,wrap:!0,forced:!Re,sham:!Re},{Symbol:wt}),pt(qe(It),(function(e){it(e)})),je({target:"Symbol",stat:!0,forced:!Re},{for:function(e){var t=String(e);if(I(Pt,t))return Pt[t];var n=wt(t);return Pt[t]=n,Ot[n]=t,n},keyFor:function(e){if(!Rt(e))throw TypeError(e+" is not a symbol");if(I(Ot,e))return Ot[e]},useSetter:function(){Nt=!0},useSimple:function(){Nt=!1}}),je({target:"Object",stat:!0,forced:!Re,sham:!t},{create:function(e,t){return void 0===t?$e(e):Dt($e(e),t)},defineProperty:_t,defineProperties:Dt,getOwnPropertyDescriptor:qt}),je({target:"Object",stat:!0,forced:!Re},{getOwnPropertyNames:Ut,getOwnPropertySymbols:Ht}),je({target:"Object",stat:!0,forced:e((function(){Se.f(1)}))},{getOwnPropertySymbols:function(e){return Se.f(Fe(e))}}),kt){var Bt=!Re||e((function(){var e=wt();return"[null]"!=kt([e])||"{}"!=kt({a:e})||"{}"!=kt(Object(e))}));je({target:"JSON",stat:!0,forced:Bt},{stringify:function(e,t,n){for(var i,r=[e],a=1;arguments.length>a;)r.push(arguments[a++]);if(i=t,(o(t)||void 0!==e)&&!Rt(e))return De(t)||(t=function(e,t){if("function"==typeof i&&(t=i.call(this,e,t)),!Rt(t))return t}),r[1]=t,kt.apply(null,r)}})}wt.prototype[gt]||M(wt.prototype,gt,wt.prototype.valueOf),ot(wt,"Symbol"),G[mt]=!0;var Vt,zt,Wt=se("navigator","userAgent")||"",$t=a.process,Kt=$t&&$t.versions,Yt=Kt&&Kt.v8;Yt?zt=(Vt=Yt.split("."))[0]+Vt[1]:Wt&&(!(Vt=Wt.match(/Edge\/(\d+)/))||Vt[1]>=74)&&(Vt=Wt.match(/Chrome\/(\d+)/))&&(zt=Vt[1]);var Gt=zt&&+zt,Xt=et("species"),Qt=function(t){return Gt>=51||!e((function(){var e=[];return(e.constructor={})[Xt]=function(){return{foo:1}},1!==e[t](Boolean).foo}))},Jt=Object.defineProperty,Zt={},en=function(e){throw e},tn=function(n,i){if(I(Zt,n))return Zt[n];i||(i={});var r=[][n],a=!!I(i,"ACCESSORS")&&i.ACCESSORS,o=I(i,0)?i[0]:en,s=I(i,1)?i[1]:void 0;return Zt[n]=!!r&&!e((function(){if(a&&!t)return!0;var e={length:-1};a?Jt(e,1,{enumerable:!0,get:en}):e[1]=1,r.call(e,o,s)}))},nn=ft.filter,rn=Qt("filter"),an=tn("filter");je({target:"Array",proto:!0,forced:!rn||!an},{filter:function(e){return nn(this,e,arguments.length>1?arguments[1]:void 0)}});var on=function(t,n){var i=[][t];return!!i&&e((function(){i.call(null,n||function(){throw 1},1)}))},sn=ft.forEach,ln=on("forEach"),cn=tn("forEach"),un=ln&&cn?[].forEach:function(e){return sn(this,e,arguments.length>1?arguments[1]:void 0)};je({target:"Array",proto:!0,forced:[].forEach!=un},{forEach:un});var hn=N.f,dn=e((function(){hn(1)}));je({target:"Object",stat:!0,forced:!t||dn,sham:!t},{getOwnPropertyDescriptor:function(e,t){return hn(P(e),t)}});var fn=function(e,t,n){var i=d(t);i in e?p.f(e,i,T(0,n)):e[i]=n};je({target:"Object",stat:!0,sham:!t},{getOwnPropertyDescriptors:function(e){for(var t,n,i=P(e),r=N.f,a=Ee(i),o={},s=0;a.length>s;)void 0!==(n=r(i,t=a[s++]))&&fn(o,t,n);return o}});var pn=e((function(){qe(1)}));je({target:"Object",stat:!0,forced:pn},{keys:function(e){return qe(Fe(e))}});var mn={CSSRuleList:0,CSSStyleDeclaration:0,CSSValueList:0,ClientRectList:0,DOMRectList:0,DOMStringList:0,DOMTokenList:1,DataTransferItemList:0,FileList:0,HTMLAllCollection:0,HTMLCollection:0,HTMLFormElement:0,HTMLSelectElement:0,MediaList:0,MimeTypeArray:0,NamedNodeMap:0,NodeList:1,PaintRequestList:0,Plugin:0,PluginArray:0,SVGLengthList:0,SVGNumberList:0,SVGPathSegList:0,SVGPointList:0,SVGStringList:0,SVGTransformList:0,SourceBufferList:0,StyleSheetList:0,TextTrackCueList:0,TextTrackList:0,TouchList:0};for(var gn in mn){var vn=a[gn],yn=vn&&vn.prototype;if(yn&&yn.forEach!==un)try{M(yn,"forEach",un)}catch(e){yn.forEach=un}}function bn(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function wn(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function kn(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?wn(Object(n),!0).forEach((function(t){bn(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):wn(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var Tn=p.f,Sn=a.Symbol;if(t&&"function"==typeof Sn&&(!("description"in Sn.prototype)||void 0!==Sn().description)){var En={},An=function(){var e=arguments.length<1||void 0===arguments[0]?void 0:String(arguments[0]),t=this instanceof An?new Sn(e):void 0===e?Sn():Sn(e);return""===e&&(En[t]=!0),t};Ae(An,Sn);var xn=An.prototype=Sn.prototype;xn.constructor=An;var Cn=xn.toString,Pn="Symbol(test)"==String(Sn("test")),On=/^Symbol\((.*)\)[^)]+$/;Tn(xn,"description",{configurable:!0,get:function(){var e=o(this)?this.valueOf():this,t=Cn.call(e);if(I(En,e))return"";var n=Pn?t.slice(7,-1):t.replace(On,"$1");return""===n?void 0:n}}),je({global:!0,forced:!0},{Symbol:An})}it("iterator");var In=et("isConcatSpreadable"),Ln=Gt>=51||!e((function(){var e=[];return e[In]=!1,e.concat()[0]!==e})),Nn=Qt("concat"),Mn=function(e){if(!o(e))return!1;var t=e[In];return void 0!==t?!!t:De(e)};je({target:"Array",proto:!0,forced:!Ln||!Nn},{concat:function(e){var t,n,i,r,a,o=Fe(this),s=ut(o,0),l=0;for(t=-1,i=arguments.length;t<i;t++)if(Mn(a=-1===t?o:arguments[t])){if(l+(r=de(a.length))>9007199254740991)throw TypeError("Maximum allowed index exceeded");for(n=0;n<r;n++,l++)n in a&&fn(s,l,a[n])}else{if(l>=9007199254740991)throw TypeError("Maximum allowed index exceeded");fn(s,l++,a)}return s.length=l,s}});var jn=ft.every,Rn=on("every"),_n=tn("every");je({target:"Array",proto:!0,forced:!Rn||!_n},{every:function(e){return jn(this,e,arguments.length>1?arguments[1]:void 0)}});var Dn=et("unscopables"),Fn=Array.prototype;null==Fn[Dn]&&p.f(Fn,Dn,{configurable:!0,value:$e(null)});var qn=function(e){Fn[Dn][e]=!0},Un=ft.find,Hn=!0,Bn=tn("find");"find"in[]&&Array(1).find((function(){Hn=!1})),je({target:"Array",proto:!0,forced:Hn||!Bn},{find:function(e){return Un(this,e,arguments.length>1?arguments[1]:void 0)}}),qn("find");var Vn=ft.findIndex,zn=!0,Wn=tn("findIndex");"findIndex"in[]&&Array(1).findIndex((function(){zn=!1})),je({target:"Array",proto:!0,forced:zn||!Wn},{findIndex:function(e){return Vn(this,e,arguments.length>1?arguments[1]:void 0)}}),qn("findIndex");var $n=function(e,t,n,i){try{return i?t(h(n)[0],n[1]):t(n)}catch(t){var r=e.return;throw void 0!==r&&h(r.call(e)),t}},Kn={},Yn=et("iterator"),Gn=Array.prototype,Xn=function(e){return void 0!==e&&(Kn.Array===e||Gn[Yn]===e)},Qn={};Qn[et("toStringTag")]="z";var Jn="[object z]"===String(Qn),Zn=et("toStringTag"),ei="Arguments"==E(function(){return arguments}()),ti=Jn?E:function(e){var t,n,i;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(n=function(e,t){try{return e[t]}catch(e){}}(t=Object(e),Zn))?n:ei?E(t):"Object"==(i=E(t))&&"function"==typeof t.callee?"Arguments":i},ni=et("iterator"),ii=function(e){if(null!=e)return e[ni]||e["@@iterator"]||Kn[ti(e)]},ri=function(e){var t,n,i,r,a,o,s=Fe(e),l="function"==typeof this?this:Array,c=arguments.length,u=c>1?arguments[1]:void 0,h=void 0!==u,d=ii(s),f=0;if(h&&(u=lt(u,c>2?arguments[2]:void 0,2)),null==d||l==Array&&Xn(d))for(n=new l(t=de(s.length));t>f;f++)o=h?u(s[f],f):s[f],fn(n,f,o);else for(a=(r=d.call(s)).next,n=new l;!(i=a.call(r)).done;f++)o=h?$n(r,u,[i.value,f],!0):i.value,fn(n,f,o);return n.length=f,n},ai=et("iterator"),oi=!1;try{var si=0,li={next:function(){return{done:!!si++}},return:function(){oi=!0}};li[ai]=function(){return this},Array.from(li,(function(){throw 2}))}catch(e){}var ci=function(e,t){if(!t&&!oi)return!1;var n=!1;try{var i={};i[ai]=function(){return{next:function(){return{done:n=!0}}}},e(i)}catch(e){}return n},ui=!ci((function(e){Array.from(e)}));je({target:"Array",stat:!0,forced:ui},{from:ri});var hi=ve.includes,di=tn("indexOf",{ACCESSORS:!0,1:0});je({target:"Array",proto:!0,forced:!di},{includes:function(e){return hi(this,e,arguments.length>1?arguments[1]:void 0)}}),qn("includes");var fi=ve.indexOf,pi=[].indexOf,mi=!!pi&&1/[1].indexOf(1,-0)<0,gi=on("indexOf"),vi=tn("indexOf",{ACCESSORS:!0,1:0});je({target:"Array",proto:!0,forced:mi||!gi||!vi},{indexOf:function(e){return mi?pi.apply(this,arguments)||0:fi(this,e,arguments.length>1?arguments[1]:void 0)}});var yi=[].join,bi=x!=Object,wi=on("join",",");je({target:"Array",proto:!0,forced:bi||!wi},{join:function(e){return yi.call(P(this),void 0===e?",":e)}});var ki=Math.min,Ti=[].lastIndexOf,Si=!!Ti&&1/[1].lastIndexOf(1,-0)<0,Ei=on("lastIndexOf"),Ai=tn("indexOf",{ACCESSORS:!0,1:0}),xi=Si||!Ei||!Ai?function(e){if(Si)return Ti.apply(this,arguments)||0;var t=P(this),n=de(t.length),i=n-1;for(arguments.length>1&&(i=ki(i,ue(arguments[1]))),i<0&&(i=n+i);i>=0;i--)if(i in t&&t[i]===e)return i||0;return-1}:Ti;je({target:"Array",proto:!0,forced:xi!==[].lastIndexOf},{lastIndexOf:xi});var Ci=ft.map,Pi=Qt("map"),Oi=tn("map");je({target:"Array",proto:!0,forced:!Pi||!Oi},{map:function(e){return Ci(this,e,arguments.length>1?arguments[1]:void 0)}});var Ii=function(e){return function(t,n,i,r){st(n);var a=Fe(t),o=x(a),s=de(a.length),l=e?s-1:0,c=e?-1:1;if(i<2)for(;;){if(l in o){r=o[l],l+=c;break}if(l+=c,e?l<0:s<=l)throw TypeError("Reduce of empty array with no initial value")}for(;e?l>=0:s>l;l+=c)l in o&&(r=n(r,o[l],l,a));return r}},Li={left:Ii(!1),right:Ii(!0)}.left,Ni=on("reduce"),Mi=tn("reduce",{1:0});je({target:"Array",proto:!0,forced:!Ni||!Mi},{reduce:function(e){return Li(this,e,arguments.length,arguments.length>1?arguments[1]:void 0)}});var ji=Qt("slice"),Ri=tn("slice",{ACCESSORS:!0,0:0,1:2}),_i=et("species"),Di=[].slice,Fi=Math.max;je({target:"Array",proto:!0,forced:!ji||!Ri},{slice:function(e,t){var n,i,r,a=P(this),s=de(a.length),l=me(e,s),c=me(void 0===t?s:t,s);if(De(a)&&("function"!=typeof(n=a.constructor)||n!==Array&&!De(n.prototype)?o(n)&&null===(n=n[_i])&&(n=void 0):n=void 0,n===Array||void 0===n))return Di.call(a,l,c);for(i=new(void 0===n?Array:n)(Fi(c-l,0)),r=0;l<c;l++,r++)l in a&&fn(i,r,a[l]);return i.length=r,i}});var qi=ft.some,Ui=on("some"),Hi=tn("some");je({target:"Array",proto:!0,forced:!Ui||!Hi},{some:function(e){return qi(this,e,arguments.length>1?arguments[1]:void 0)}});var Bi=Qt("splice"),Vi=tn("splice",{ACCESSORS:!0,0:0,1:2}),zi=Math.max,Wi=Math.min;je({target:"Array",proto:!0,forced:!Bi||!Vi},{splice:function(e,t){var n,i,r,a,o,s,l=Fe(this),c=de(l.length),u=me(e,c),h=arguments.length;if(0===h?n=i=0:1===h?(n=0,i=c-u):(n=h-2,i=Wi(zi(ue(t),0),c-u)),c+n-i>9007199254740991)throw TypeError("Maximum allowed length exceeded");for(r=ut(l,i),a=0;a<i;a++)(o=u+a)in l&&fn(r,a,l[o]);if(r.length=i,n<i){for(a=u;a<c-i;a++)s=a+n,(o=a+i)in l?l[s]=l[o]:delete l[s];for(a=c;a>c-i+n;a--)delete l[a-1]}else if(n>i)for(a=c-i;a>u;a--)s=a+n-1,(o=a+i-1)in l?l[s]=l[o]:delete l[s];for(a=0;a<n;a++)l[a+u]=arguments[a+2];return l.length=c-i+n,r}}),je({global:!0},{globalThis:a});var $i=Math.sign||function(e){return 0==(e=+e)||e!=e?e:e<0?-1:1};je({target:"Math",stat:!0},{sign:$i});var Ki=Math.ceil,Yi=Math.floor;je({target:"Math",stat:!0},{trunc:function(e){return(e>0?Yi:Ki)(e)}});var Gi=Object.setPrototypeOf||("__proto__"in{}?function(){var e,t=!1,n={};try{(e=Object.getOwnPropertyDescriptor(Object.prototype,"__proto__").set).call(n,[]),t=n instanceof Array}catch(e){}return function(n,i){return h(n),function(e){if(!o(e)&&null!==e)throw TypeError("Can't set "+String(e)+" as a prototype")}(i),t?e.call(n,i):n.__proto__=i,n}}():void 0),Xi=function(e,t,n){var i,r;return Gi&&"function"==typeof(i=t.constructor)&&i!==n&&o(r=i.prototype)&&r!==n.prototype&&Gi(e,r),e},Qi="\t\n\v\f\r                　\u2028\u2029\ufeff",Ji="["+Qi+"]",Zi=RegExp("^"+Ji+Ji+"*"),er=RegExp(Ji+Ji+"*$"),tr=function(e){return function(t){var n=String(C(t));return 1&e&&(n=n.replace(Zi,"")),2&e&&(n=n.replace(er,"")),n}},nr={start:tr(1),end:tr(2),trim:tr(3)},ir=Te.f,rr=N.f,ar=p.f,or=nr.trim,sr=a.Number,lr=sr.prototype,cr="Number"==E($e(lr)),ur=function(e){var t,n,i,r,a,o,s,l,c=d(e,!1);if("string"==typeof c&&c.length>2)if(43===(t=(c=or(c)).charCodeAt(0))||45===t){if(88===(n=c.charCodeAt(2))||120===n)return NaN}else if(48===t){switch(c.charCodeAt(1)){case 66:case 98:i=2,r=49;break;case 79:case 111:i=8,r=55;break;default:return+c}for(o=(a=c.slice(2)).length,s=0;s<o;s++)if((l=a.charCodeAt(s))<48||l>r)return NaN;return parseInt(a,i)}return+c};if(Ne("Number",!sr(" 0o1")||!sr("0b1")||sr("+0x1"))){for(var hr,dr=function(t){var n=arguments.length<1?0:t,i=this;return i instanceof dr&&(cr?e((function(){lr.valueOf.call(i)})):"Number"!=E(i))?Xi(new sr(ur(n)),i,dr):ur(n)},fr=t?ir(sr):"MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger".split(","),pr=0;fr.length>pr;pr++)I(sr,hr=fr[pr])&&!I(dr,hr)&&ar(dr,hr,rr(sr,hr));dr.prototype=lr,lr.constructor=dr,re(a,"Number",dr)}je({target:"Number",stat:!0},{isNaN:function(e){return e!=e}});var mr="".repeat||function(e){var t=String(C(this)),n="",i=ue(e);if(i<0||i==1/0)throw RangeError("Wrong number of repetitions");for(;i>0;(i>>>=1)&&(t+=t))1&i&&(n+=t);return n},gr=1..toFixed,vr=Math.floor,yr=function(e,t,n){return 0===t?n:t%2==1?yr(e,t-1,n*e):yr(e*e,t/2,n)},br=gr&&("0.000"!==8e-5.toFixed(3)||"1"!==.9.toFixed(0)||"1.25"!==1.255.toFixed(2)||"1000000000000000128"!==(0xde0b6b3a7640080).toFixed(0))||!e((function(){gr.call({})}));je({target:"Number",proto:!0,forced:br},{toFixed:function(e){var t,n,i,r,a=function(e){if("number"!=typeof e&&"Number"!=E(e))throw TypeError("Incorrect invocation");return+e}(this),o=ue(e),s=[0,0,0,0,0,0],l="",c="0",u=function(e,t){for(var n=-1,i=t;++n<6;)i+=e*s[n],s[n]=i%1e7,i=vr(i/1e7)},h=function(e){for(var t=6,n=0;--t>=0;)n+=s[t],s[t]=vr(n/e),n=n%e*1e7},d=function(){for(var e=6,t="";--e>=0;)if(""!==t||0===e||0!==s[e]){var n=String(s[e]);t=""===t?n:t+mr.call("0",7-n.length)+n}return t};if(o<0||o>20)throw RangeError("Incorrect fraction digits");if(a!=a)return"NaN";if(a<=-1e21||a>=1e21)return String(a);if(a<0&&(l="-",a=-a),a>1e-21)if(n=(t=function(e){for(var t=0,n=e;n>=4096;)t+=12,n/=4096;for(;n>=2;)t+=1,n/=2;return t}(a*yr(2,69,1))-69)<0?a*yr(2,-t,1):a/yr(2,t,1),n*=4503599627370496,(t=52-t)>0){for(u(0,n),i=o;i>=7;)u(1e7,0),i-=7;for(u(yr(10,i,1),0),i=t-1;i>=23;)h(1<<23),i-=23;h(1<<i),u(1,1),h(2),c=d()}else u(0,n),u(1<<-t,0),c=d()+mr.call("0",o);return c=o>0?l+((r=c.length)<=o?"0."+mr.call("0",o-r)+c:c.slice(0,r-o)+"."+c.slice(r-o)):l+c}});var wr=k.f,kr=function(e){return function(n){for(var i,r=P(n),a=qe(r),o=a.length,s=0,l=[];o>s;)i=a[s++],t&&!wr.call(r,i)||l.push(e?[i,r[i]]:r[i]);return l}},Tr={entries:kr(!0),values:kr(!1)},Sr=Tr.entries;je({target:"Object",stat:!0},{entries:function(e){return Sr(e)}});var Er=Jn?{}.toString:function(){return"[object "+ti(this)+"]"};Jn||re(Object.prototype,"toString",Er,{unsafe:!0});var Ar=Tr.values;je({target:"Object",stat:!0},{values:function(e){return Ar(e)}});var xr=et("match"),Cr=function(e){var t;return o(e)&&(void 0!==(t=e[xr])?!!t:"RegExp"==E(e))},Pr=function(){var e=h(this),t="";return e.global&&(t+="g"),e.ignoreCase&&(t+="i"),e.multiline&&(t+="m"),e.dotAll&&(t+="s"),e.unicode&&(t+="u"),e.sticky&&(t+="y"),t};function Or(e,t){return RegExp(e,t)}var Ir={UNSUPPORTED_Y:e((function(){var e=Or("a","y");return e.lastIndex=2,null!=e.exec("abcd")})),BROKEN_CARET:e((function(){var e=Or("^r","gy");return e.lastIndex=2,null!=e.exec("str")}))},Lr=et("species"),Nr=p.f,Mr=Te.f,jr=ie.set,Rr=et("match"),_r=a.RegExp,Dr=_r.prototype,Fr=/a/g,qr=/a/g,Ur=new _r(Fr)!==Fr,Hr=Ir.UNSUPPORTED_Y;if(t&&Ne("RegExp",!Ur||Hr||e((function(){return qr[Rr]=!1,_r(Fr)!=Fr||_r(qr)==qr||"/a/i"!=_r(Fr,"i")})))){for(var Br=function(e,t){var n,i=this instanceof Br,r=Cr(e),a=void 0===t;if(!i&&r&&e.constructor===Br&&a)return e;Ur?r&&!a&&(e=e.source):e instanceof Br&&(a&&(t=Pr.call(e)),e=e.source),Hr&&(n=!!t&&t.indexOf("y")>-1)&&(t=t.replace(/y/g,""));var o=Xi(Ur?new _r(e,t):_r(e,t),i?this:Dr,Br);return Hr&&n&&jr(o,{sticky:n}),o},Vr=function(e){e in Br||Nr(Br,e,{configurable:!0,get:function(){return _r[e]},set:function(t){_r[e]=t}})},zr=Mr(_r),Wr=0;zr.length>Wr;)Vr(zr[Wr++]);Dr.constructor=Br,Br.prototype=Dr,re(a,"RegExp",Br)}!function(e){var n=se(e),i=p.f;t&&n&&!n[Lr]&&i(n,Lr,{configurable:!0,get:function(){return this}})}("RegExp");var $r=RegExp.prototype.exec,Kr=String.prototype.replace,Yr=$r,Gr=function(){var e=/a/,t=/b*/g;return $r.call(e,"a"),$r.call(t,"a"),0!==e.lastIndex||0!==t.lastIndex}(),Xr=Ir.UNSUPPORTED_Y||Ir.BROKEN_CARET,Qr=void 0!==/()??/.exec("")[1];(Gr||Qr||Xr)&&(Yr=function(e){var t,n,i,r,a=this,o=Xr&&a.sticky,s=Pr.call(a),l=a.source,c=0,u=e;return o&&(-1===(s=s.replace("y","")).indexOf("g")&&(s+="g"),u=String(e).slice(a.lastIndex),a.lastIndex>0&&(!a.multiline||a.multiline&&"\n"!==e[a.lastIndex-1])&&(l="(?: "+l+")",u=" "+u,c++),n=new RegExp("^(?:"+l+")",s)),Qr&&(n=new RegExp("^"+l+"$(?!\\s)",s)),Gr&&(t=a.lastIndex),i=$r.call(o?n:a,u),o?i?(i.input=i.input.slice(c),i[0]=i[0].slice(c),i.index=a.lastIndex,a.lastIndex+=i[0].length):a.lastIndex=0:Gr&&i&&(a.lastIndex=a.global?i.index+i[0].length:t),Qr&&i&&i.length>1&&Kr.call(i[0],n,(function(){for(r=1;r<arguments.length-2;r++)void 0===arguments[r]&&(i[r]=void 0)})),i});var Jr=Yr;je({target:"RegExp",proto:!0,forced:/./.exec!==Jr},{exec:Jr});var Zr=RegExp.prototype,ea=Zr.toString,ta=e((function(){return"/a/b"!=ea.call({source:"a",flags:"b"})})),na="toString"!=ea.name;(ta||na)&&re(RegExp.prototype,"toString",(function(){var e=h(this),t=String(e.source),n=e.flags;return"/"+t+"/"+String(void 0===n&&e instanceof RegExp&&!("flags"in Zr)?Pr.call(e):n)}),{unsafe:!0});var ia=function(e){if(Cr(e))throw TypeError("The method doesn't accept regular expressions");return e},ra=et("match"),aa=function(e){var t=/./;try{"/./"[e](t)}catch(n){try{return t[ra]=!1,"/./"[e](t)}catch(e){}}return!1};je({target:"String",proto:!0,forced:!aa("includes")},{includes:function(e){return!!~String(C(this)).indexOf(ia(e),arguments.length>1?arguments[1]:void 0)}});var oa,sa,la,ca=function(e){return function(t,n){var i,r,a=String(C(t)),o=ue(n),s=a.length;return o<0||o>=s?e?"":void 0:(i=a.charCodeAt(o))<55296||i>56319||o+1===s||(r=a.charCodeAt(o+1))<56320||r>57343?e?a.charAt(o):i:e?a.slice(o,o+2):r-56320+(i-55296<<10)+65536}},ua={codeAt:ca(!1),charAt:ca(!0)},ha=!e((function(){function e(){}return e.prototype.constructor=null,Object.getPrototypeOf(new e)!==e.prototype})),da=Y("IE_PROTO"),fa=Object.prototype,pa=ha?Object.getPrototypeOf:function(e){return e=Fe(e),I(e,da)?e[da]:"function"==typeof e.constructor&&e instanceof e.constructor?e.constructor.prototype:e instanceof Object?fa:null},ma=et("iterator"),ga=!1;[].keys&&("next"in(la=[].keys())?(sa=pa(pa(la)))!==Object.prototype&&(oa=sa):ga=!0),null==oa&&(oa={}),I(oa,ma)||M(oa,ma,(function(){return this}));var va={IteratorPrototype:oa,BUGGY_SAFARI_ITERATORS:ga},ya=va.IteratorPrototype,ba=function(){return this},wa=function(e,t,n){var i=t+" Iterator";return e.prototype=$e(ya,{next:T(1,n)}),ot(e,i,!1),Kn[i]=ba,e},ka=va.IteratorPrototype,Ta=va.BUGGY_SAFARI_ITERATORS,Sa=et("iterator"),Ea=function(){return this},Aa=function(e,t,n,i,r,a,o){wa(n,t,i);var s,l,c,u=function(e){if(e===r&&m)return m;if(!Ta&&e in f)return f[e];switch(e){case"keys":case"values":case"entries":return function(){return new n(this,e)}}return function(){return new n(this)}},h=t+" Iterator",d=!1,f=e.prototype,p=f[Sa]||f["@@iterator"]||r&&f[r],m=!Ta&&p||u(r),g="Array"==t&&f.entries||p;if(g&&(s=pa(g.call(new e)),ka!==Object.prototype&&s.next&&(pa(s)!==ka&&(Gi?Gi(s,ka):"function"!=typeof s[Sa]&&M(s,Sa,Ea)),ot(s,h,!0))),"values"==r&&p&&"values"!==p.name&&(d=!0,m=function(){return p.call(this)}),f[Sa]!==m&&M(f,Sa,m),Kn[t]=m,r)if(l={values:u("values"),keys:a?m:u("keys"),entries:u("entries")},o)for(c in l)(Ta||d||!(c in f))&&re(f,c,l[c]);else je({target:t,proto:!0,forced:Ta||d},l);return l},xa=ua.charAt,Ca=ie.set,Pa=ie.getterFor("String Iterator");Aa(String,"String",(function(e){Ca(this,{type:"String Iterator",string:String(e),index:0})}),(function(){var e,t=Pa(this),n=t.string,i=t.index;return i>=n.length?{value:void 0,done:!0}:(e=xa(n,i),t.index+=e.length,{value:e,done:!1})}));var Oa=et("species"),Ia=!e((function(){var e=/./;return e.exec=function(){var e=[];return e.groups={a:"7"},e},"7"!=="".replace(e,"$<a>")})),La="$0"==="a".replace(/./,"$0"),Na=et("replace"),Ma=!!/./[Na]&&""===/./[Na]("a","$0"),ja=!e((function(){var e=/(?:)/,t=e.exec;e.exec=function(){return t.apply(this,arguments)};var n="ab".split(e);return 2!==n.length||"a"!==n[0]||"b"!==n[1]})),Ra=function(t,n,i,r){var a=et(t),o=!e((function(){var e={};return e[a]=function(){return 7},7!=""[t](e)})),s=o&&!e((function(){var e=!1,n=/a/;return"split"===t&&((n={}).constructor={},n.constructor[Oa]=function(){return n},n.flags="",n[a]=/./[a]),n.exec=function(){return e=!0,null},n[a](""),!e}));if(!o||!s||"replace"===t&&(!Ia||!La||Ma)||"split"===t&&!ja){var l=/./[a],c=i(a,""[t],(function(e,t,n,i,r){return t.exec===Jr?o&&!r?{done:!0,value:l.call(t,n,i)}:{done:!0,value:e.call(n,t,i)}:{done:!1}}),{REPLACE_KEEPS_$0:La,REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE:Ma}),u=c[0],h=c[1];re(String.prototype,t,u),re(RegExp.prototype,a,2==n?function(e,t){return h.call(e,this,t)}:function(e){return h.call(e,this)})}r&&M(RegExp.prototype[a],"sham",!0)},_a=ua.charAt,Da=function(e,t,n){return t+(n?_a(e,t).length:1)},Fa=function(e,t){var n=e.exec;if("function"==typeof n){var i=n.call(e,t);if("object"!=typeof i)throw TypeError("RegExp exec method returned something other than an Object or null");return i}if("RegExp"!==E(e))throw TypeError("RegExp#exec called on incompatible receiver");return Jr.call(e,t)};Ra("match",1,(function(e,t,n){return[function(t){var n=C(this),i=null==t?void 0:t[e];return void 0!==i?i.call(t,n):new RegExp(t)[e](String(n))},function(e){var i=n(t,e,this);if(i.done)return i.value;var r=h(e),a=String(this);if(!r.global)return Fa(r,a);var o=r.unicode;r.lastIndex=0;for(var s,l=[],c=0;null!==(s=Fa(r,a));){var u=String(s[0]);l[c]=u,""===u&&(r.lastIndex=Da(a,de(r.lastIndex),o)),c++}return 0===c?null:l}]}));var qa=Math.max,Ua=Math.min,Ha=Math.floor,Ba=/\$([$&'`]|\d\d?|<[^>]*>)/g,Va=/\$([$&'`]|\d\d?)/g;Ra("replace",2,(function(e,t,n,i){var r=i.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE,a=i.REPLACE_KEEPS_$0,o=r?"$":"$0";return[function(n,i){var r=C(this),a=null==n?void 0:n[e];return void 0!==a?a.call(n,r,i):t.call(String(r),n,i)},function(e,i){if(!r&&a||"string"==typeof i&&-1===i.indexOf(o)){var l=n(t,e,this,i);if(l.done)return l.value}var c=h(e),u=String(this),d="function"==typeof i;d||(i=String(i));var f=c.global;if(f){var p=c.unicode;c.lastIndex=0}for(var m=[];;){var g=Fa(c,u);if(null===g)break;if(m.push(g),!f)break;""===String(g[0])&&(c.lastIndex=Da(u,de(c.lastIndex),p))}for(var v,y="",b=0,w=0;w<m.length;w++){g=m[w];for(var k=String(g[0]),T=qa(Ua(ue(g.index),u.length),0),S=[],E=1;E<g.length;E++)S.push(void 0===(v=g[E])?v:String(v));var A=g.groups;if(d){var x=[k].concat(S,T,u);void 0!==A&&x.push(A);var C=String(i.apply(void 0,x))}else C=s(k,u,T,S,A,i);T>=b&&(y+=u.slice(b,T)+C,b=T+k.length)}return y+u.slice(b)}];function s(e,n,i,r,a,o){var s=i+e.length,l=r.length,c=Va;return void 0!==a&&(a=Fe(a),c=Ba),t.call(o,c,(function(t,o){var c;switch(o.charAt(0)){case"$":return"$";case"&":return e;case"`":return n.slice(0,i);case"'":return n.slice(s);case"<":c=a[o.slice(1,-1)];break;default:var u=+o;if(0===u)return t;if(u>l){var h=Ha(u/10);return 0===h?t:h<=l?void 0===r[h-1]?o.charAt(1):r[h-1]+o.charAt(1):t}c=r[u-1]}return void 0===c?"":c}))}}));var za=Object.is||function(e,t){return e===t?0!==e||1/e==1/t:e!=e&&t!=t};Ra("search",1,(function(e,t,n){return[function(t){var n=C(this),i=null==t?void 0:t[e];return void 0!==i?i.call(t,n):new RegExp(t)[e](String(n))},function(e){var i=n(t,e,this);if(i.done)return i.value;var r=h(e),a=String(this),o=r.lastIndex;za(o,0)||(r.lastIndex=0);var s=Fa(r,a);return za(r.lastIndex,o)||(r.lastIndex=o),null===s?-1:s.index}]}));var Wa=et("species"),$a=[].push,Ka=Math.min,Ya=!e((function(){return!RegExp(4294967295,"y")}));Ra("split",2,(function(e,t,n){var i;return i="c"=="abbc".split(/(b)*/)[1]||4!="test".split(/(?:)/,-1).length||2!="ab".split(/(?:ab)*/).length||4!=".".split(/(.?)(.?)/).length||".".split(/()()/).length>1||"".split(/.?/).length?function(e,n){var i=String(C(this)),r=void 0===n?4294967295:n>>>0;if(0===r)return[];if(void 0===e)return[i];if(!Cr(e))return t.call(i,e,r);for(var a,o,s,l=[],c=(e.ignoreCase?"i":"")+(e.multiline?"m":"")+(e.unicode?"u":"")+(e.sticky?"y":""),u=0,h=new RegExp(e.source,c+"g");(a=Jr.call(h,i))&&!((o=h.lastIndex)>u&&(l.push(i.slice(u,a.index)),a.length>1&&a.index<i.length&&$a.apply(l,a.slice(1)),s=a[0].length,u=o,l.length>=r));)h.lastIndex===a.index&&h.lastIndex++;return u===i.length?!s&&h.test("")||l.push(""):l.push(i.slice(u)),l.length>r?l.slice(0,r):l}:"0".split(void 0,0).length?function(e,n){return void 0===e&&0===n?[]:t.call(this,e,n)}:t,[function(t,n){var r=C(this),a=null==t?void 0:t[e];return void 0!==a?a.call(t,r,n):i.call(String(r),t,n)},function(e,r){var a=n(i,e,this,r,i!==t);if(a.done)return a.value;var o=h(e),s=String(this),l=function(e,t){var n,i=h(e).constructor;return void 0===i||null==(n=h(i)[Wa])?t:st(n)}(o,RegExp),c=o.unicode,u=(o.ignoreCase?"i":"")+(o.multiline?"m":"")+(o.unicode?"u":"")+(Ya?"y":"g"),d=new l(Ya?o:"^(?:"+o.source+")",u),f=void 0===r?4294967295:r>>>0;if(0===f)return[];if(0===s.length)return null===Fa(d,s)?[s]:[];for(var p=0,m=0,g=[];m<s.length;){d.lastIndex=Ya?m:0;var v,y=Fa(d,Ya?s:s.slice(m));if(null===y||(v=Ka(de(d.lastIndex+(Ya?0:m)),s.length))===p)m=Da(s,m,c);else{if(g.push(s.slice(p,m)),g.length===f)return g;for(var b=1;b<=y.length-1;b++)if(g.push(y[b]),g.length===f)return g;m=p=v}}return g.push(s.slice(p)),g}]}),!Ya);var Ga,Xa=N.f,Qa="".startsWith,Ja=Math.min,Za=aa("startsWith"),eo=!(Za||(Ga=Xa(String.prototype,"startsWith"),!Ga||Ga.writable));je({target:"String",proto:!0,forced:!eo&&!Za},{startsWith:function(e){var t=String(C(this));ia(e);var n=de(Ja(arguments.length>1?arguments[1]:void 0,t.length)),i=String(e);return Qa?Qa.call(t,i,n):t.slice(n,n+i.length)===i}});var to=nr.trim;je({target:"String",proto:!0,forced:function(t){return e((function(){return!!Qi[t]()||"​᠎"!="​᠎"[t]()||Qi[t].name!==t}))}("trim")},{trim:function(){return to(this)}});var no=function(e,t,n){for(var i in t)re(e,i,t[i],n);return e},io=!e((function(){return Object.isExtensible(Object.preventExtensions({}))})),ro=i((function(e){var t=p.f,n=$("meta"),i=0,r=Object.isExtensible||function(){return!0},a=function(e){t(e,n,{value:{objectID:"O"+ ++i,weakData:{}}})},s=e.exports={REQUIRED:!1,fastKey:function(e,t){if(!o(e))return"symbol"==typeof e?e:("string"==typeof e?"S":"P")+e;if(!I(e,n)){if(!r(e))return"F";if(!t)return"E";a(e)}return e[n].objectID},getWeakData:function(e,t){if(!I(e,n)){if(!r(e))return!0;if(!t)return!1;a(e)}return e[n].weakData},onFreeze:function(e){return io&&s.REQUIRED&&r(e)&&!I(e,n)&&a(e),e}};G[n]=!0})),ao=i((function(e){var t=function(e,t){this.stopped=e,this.result=t};(e.exports=function(e,n,i,r,a){var o,s,l,c,u,d,f,p=lt(n,i,r?2:1);if(a)o=e;else{if("function"!=typeof(s=ii(e)))throw TypeError("Target is not iterable");if(Xn(s)){for(l=0,c=de(e.length);c>l;l++)if((u=r?p(h(f=e[l])[0],f[1]):p(e[l]))&&u instanceof t)return u;return new t(!1)}o=s.call(e)}for(d=o.next;!(f=d.call(o)).done;)if("object"==typeof(u=$n(o,p,f.value,r))&&u&&u instanceof t)return u;return new t(!1)}).stop=function(e){return new t(!0,e)}})),oo=function(e,t,n){if(!(e instanceof t))throw TypeError("Incorrect "+(n?n+" ":"")+"invocation");return e},so=ro.getWeakData,lo=ie.set,co=ie.getterFor,uo=ft.find,ho=ft.findIndex,fo=0,po=function(e){return e.frozen||(e.frozen=new mo)},mo=function(){this.entries=[]},go=function(e,t){return uo(e.entries,(function(e){return e[0]===t}))};mo.prototype={get:function(e){var t=go(this,e);if(t)return t[1]},has:function(e){return!!go(this,e)},set:function(e,t){var n=go(this,e);n?n[1]=t:this.entries.push([e,t])},delete:function(e){var t=ho(this.entries,(function(t){return t[0]===e}));return~t&&this.entries.splice(t,1),!!~t}};var vo={getConstructor:function(e,t,n,i){var r=e((function(e,a){oo(e,r,t),lo(e,{type:t,id:fo++,frozen:void 0}),null!=a&&ao(a,e[i],e,n)})),a=co(t),s=function(e,t,n){var i=a(e),r=so(h(t),!0);return!0===r?po(i).set(t,n):r[i.id]=n,e};return no(r.prototype,{delete:function(e){var t=a(this);if(!o(e))return!1;var n=so(e);return!0===n?po(t).delete(e):n&&I(n,t.id)&&delete n[t.id]},has:function(e){var t=a(this);if(!o(e))return!1;var n=so(e);return!0===n?po(t).has(e):n&&I(n,t.id)}}),no(r.prototype,n?{get:function(e){var t=a(this);if(o(e)){var n=so(e);return!0===n?po(t).get(e):n?n[t.id]:void 0}},set:function(e,t){return s(this,e,t)}}:{add:function(e){return s(this,e,!0)}}),r}},yo=(i((function(t){var n,i=ie.enforce,r=!a.ActiveXObject&&"ActiveXObject"in a,s=Object.isExtensible,l=function(e){return function(){return e(this,arguments.length?arguments[0]:void 0)}},c=t.exports=function(t,n,i){var r=-1!==t.indexOf("Map"),s=-1!==t.indexOf("Weak"),l=r?"set":"add",c=a[t],u=c&&c.prototype,h=c,d={},f=function(e){var t=u[e];re(u,e,"add"==e?function(e){return t.call(this,0===e?0:e),this}:"delete"==e?function(e){return!(s&&!o(e))&&t.call(this,0===e?0:e)}:"get"==e?function(e){return s&&!o(e)?void 0:t.call(this,0===e?0:e)}:"has"==e?function(e){return!(s&&!o(e))&&t.call(this,0===e?0:e)}:function(e,n){return t.call(this,0===e?0:e,n),this})};if(Ne(t,"function"!=typeof c||!(s||u.forEach&&!e((function(){(new c).entries().next()})))))h=i.getConstructor(n,t,r,l),ro.REQUIRED=!0;else if(Ne(t,!0)){var p=new h,m=p[l](s?{}:-0,1)!=p,g=e((function(){p.has(1)})),v=ci((function(e){new c(e)})),y=!s&&e((function(){for(var e=new c,t=5;t--;)e[l](t,t);return!e.has(-0)}));v||((h=n((function(e,n){oo(e,h,t);var i=Xi(new c,e,h);return null!=n&&ao(n,i[l],i,r),i}))).prototype=u,u.constructor=h),(g||y)&&(f("delete"),f("has"),r&&f("get")),(y||m)&&f(l),s&&u.clear&&delete u.clear}return d[t]=h,je({global:!0,forced:h!=c},d),ot(h,t),s||i.setStrong(h,t,r),h}("WeakMap",l,vo);if(B&&r){n=vo.getConstructor(l,"WeakMap",!0),ro.REQUIRED=!0;var u=c.prototype,h=u.delete,d=u.has,f=u.get,p=u.set;no(u,{delete:function(e){if(o(e)&&!s(e)){var t=i(this);return t.frozen||(t.frozen=new n),h.call(this,e)||t.frozen.delete(e)}return h.call(this,e)},has:function(e){if(o(e)&&!s(e)){var t=i(this);return t.frozen||(t.frozen=new n),d.call(this,e)||t.frozen.has(e)}return d.call(this,e)},get:function(e){if(o(e)&&!s(e)){var t=i(this);return t.frozen||(t.frozen=new n),d.call(this,e)?f.call(this,e):t.frozen.get(e)}return f.call(this,e)},set:function(e,t){if(o(e)&&!s(e)){var r=i(this);r.frozen||(r.frozen=new n),d.call(this,e)?p.call(this,e,t):r.frozen.set(e,t)}else p.call(this,e,t);return this}})}})),ie.set),bo=ie.getterFor("Array Iterator"),wo=Aa(Array,"Array",(function(e,t){yo(this,{type:"Array Iterator",target:P(e),index:0,kind:t})}),(function(){var e=bo(this),t=e.target,n=e.kind,i=e.index++;return!t||i>=t.length?(e.target=void 0,{value:void 0,done:!0}):"keys"==n?{value:i,done:!1}:"values"==n?{value:t[i],done:!1}:{value:[i,t[i]],done:!1}}),"values");Kn.Arguments=Kn.Array,qn("keys"),qn("values"),qn("entries");var ko=et("iterator"),To=et("toStringTag"),So=wo.values;for(var Eo in mn){var Ao=a[Eo],xo=Ao&&Ao.prototype;if(xo){if(xo[ko]!==So)try{M(xo,ko,So)}catch(e){xo[ko]=So}if(xo[To]||M(xo,To,Eo),mn[Eo])for(var Co in wo)if(xo[Co]!==wo[Co])try{M(xo,Co,wo[Co])}catch(e){xo[Co]=wo[Co]}}}var Po=et("iterator"),Oo=!e((function(){var e=new URL("b?a=1&b=2&c=3","http://a"),t=e.searchParams,n="";return e.pathname="c%20d",t.forEach((function(e,i){t.delete("b"),n+=i+e})),!t.sort||"http://a/c%20d?a=1&c=3"!==e.href||"3"!==t.get("c")||"a=1"!==String(new URLSearchParams("?a=1"))||!t[Po]||"a"!==new URL("https://a@b").username||"b"!==new URLSearchParams(new URLSearchParams("a=b")).get("a")||"xn--e1aybc"!==new URL("http://тест").host||"#%D0%B1"!==new URL("http://a#б").hash||"a1c3"!==n||"x"!==new URL("http://x",void 0).host})),Io=Object.assign,Lo=Object.defineProperty,No=!Io||e((function(){if(t&&1!==Io({b:1},Io(Lo({},"a",{enumerable:!0,get:function(){Lo(this,"b",{value:3,enumerable:!1})}}),{b:2})).b)return!0;var e={},n={},i=Symbol(),r="abcdefghijklmnopqrst";return e[i]=7,r.split("").forEach((function(e){n[e]=e})),7!=Io({},e)[i]||qe(Io({},n)).join("")!=r}))?function(e,n){for(var i=Fe(e),r=arguments.length,a=1,o=Se.f,s=k.f;r>a;)for(var l,c=x(arguments[a++]),u=o?qe(c).concat(o(c)):qe(c),h=u.length,d=0;h>d;)l=u[d++],t&&!s.call(c,l)||(i[l]=c[l]);return i}:Io,Mo=/[^\0-\u007E]/,jo=/[.\u3002\uFF0E\uFF61]/g,Ro="Overflow: input needs wider integers to process",_o=Math.floor,Do=String.fromCharCode,Fo=function(e){return e+22+75*(e<26)},qo=function(e,t,n){var i=0;for(e=n?_o(e/700):e>>1,e+=_o(e/t);e>455;i+=36)e=_o(e/35);return _o(i+36*e/(e+38))},Uo=function(e){var t,n,i=[],r=(e=function(e){for(var t=[],n=0,i=e.length;n<i;){var r=e.charCodeAt(n++);if(r>=55296&&r<=56319&&n<i){var a=e.charCodeAt(n++);56320==(64512&a)?t.push(((1023&r)<<10)+(1023&a)+65536):(t.push(r),n--)}else t.push(r)}return t}(e)).length,a=128,o=0,s=72;for(t=0;t<e.length;t++)(n=e[t])<128&&i.push(Do(n));var l=i.length,c=l;for(l&&i.push("-");c<r;){var u=2147483647;for(t=0;t<e.length;t++)(n=e[t])>=a&&n<u&&(u=n);var h=c+1;if(u-a>_o((2147483647-o)/h))throw RangeError(Ro);for(o+=(u-a)*h,a=u,t=0;t<e.length;t++){if((n=e[t])<a&&++o>2147483647)throw RangeError(Ro);if(n==a){for(var d=o,f=36;;f+=36){var p=f<=s?1:f>=s+26?26:f-s;if(d<p)break;var m=d-p,g=36-p;i.push(Do(Fo(p+m%g))),d=_o(m/g)}i.push(Do(Fo(d))),s=qo(o,h,c==l),o=0,++c}}++o,++a}return i.join("")},Ho=function(e){var t=ii(e);if("function"!=typeof t)throw TypeError(String(e)+" is not iterable");return h(t.call(e))},Bo=se("fetch"),Vo=se("Headers"),zo=et("iterator"),Wo=ie.set,$o=ie.getterFor("URLSearchParams"),Ko=ie.getterFor("URLSearchParamsIterator"),Yo=/\+/g,Go=Array(4),Xo=function(e){return Go[e-1]||(Go[e-1]=RegExp("((?:%[\\da-f]{2}){"+e+"})","gi"))},Qo=function(e){try{return decodeURIComponent(e)}catch(t){return e}},Jo=function(e){var t=e.replace(Yo," "),n=4;try{return decodeURIComponent(t)}catch(e){for(;n;)t=t.replace(Xo(n--),Qo);return t}},Zo=/[!'()~]|%20/g,es={"!":"%21","'":"%27","(":"%28",")":"%29","~":"%7E","%20":"+"},ts=function(e){return es[e]},ns=function(e){return encodeURIComponent(e).replace(Zo,ts)},is=function(e,t){if(t)for(var n,i,r=t.split("&"),a=0;a<r.length;)(n=r[a++]).length&&(i=n.split("="),e.push({key:Jo(i.shift()),value:Jo(i.join("="))}))},rs=function(e){this.entries.length=0,is(this.entries,e)},as=function(e,t){if(e<t)throw TypeError("Not enough arguments")},os=wa((function(e,t){Wo(this,{type:"URLSearchParamsIterator",iterator:Ho($o(e).entries),kind:t})}),"Iterator",(function(){var e=Ko(this),t=e.kind,n=e.iterator.next(),i=n.value;return n.done||(n.value="keys"===t?i.key:"values"===t?i.value:[i.key,i.value]),n})),ss=function(){oo(this,ss,"URLSearchParams");var e,t,n,i,r,a,s,l,c,u=arguments.length>0?arguments[0]:void 0,d=this,f=[];if(Wo(d,{type:"URLSearchParams",entries:f,updateURL:function(){},updateSearchParams:rs}),void 0!==u)if(o(u))if("function"==typeof(e=ii(u)))for(n=(t=e.call(u)).next;!(i=n.call(t)).done;){if((s=(a=(r=Ho(h(i.value))).next).call(r)).done||(l=a.call(r)).done||!a.call(r).done)throw TypeError("Expected sequence with length 2");f.push({key:s.value+"",value:l.value+""})}else for(c in u)I(u,c)&&f.push({key:c,value:u[c]+""});else is(f,"string"==typeof u?"?"===u.charAt(0)?u.slice(1):u:u+"")},ls=ss.prototype;no(ls,{append:function(e,t){as(arguments.length,2);var n=$o(this);n.entries.push({key:e+"",value:t+""}),n.updateURL()},delete:function(e){as(arguments.length,1);for(var t=$o(this),n=t.entries,i=e+"",r=0;r<n.length;)n[r].key===i?n.splice(r,1):r++;t.updateURL()},get:function(e){as(arguments.length,1);for(var t=$o(this).entries,n=e+"",i=0;i<t.length;i++)if(t[i].key===n)return t[i].value;return null},getAll:function(e){as(arguments.length,1);for(var t=$o(this).entries,n=e+"",i=[],r=0;r<t.length;r++)t[r].key===n&&i.push(t[r].value);return i},has:function(e){as(arguments.length,1);for(var t=$o(this).entries,n=e+"",i=0;i<t.length;)if(t[i++].key===n)return!0;return!1},set:function(e,t){as(arguments.length,1);for(var n,i=$o(this),r=i.entries,a=!1,o=e+"",s=t+"",l=0;l<r.length;l++)(n=r[l]).key===o&&(a?r.splice(l--,1):(a=!0,n.value=s));a||r.push({key:o,value:s}),i.updateURL()},sort:function(){var e,t,n,i=$o(this),r=i.entries,a=r.slice();for(r.length=0,n=0;n<a.length;n++){for(e=a[n],t=0;t<n;t++)if(r[t].key>e.key){r.splice(t,0,e);break}t===n&&r.push(e)}i.updateURL()},forEach:function(e){for(var t,n=$o(this).entries,i=lt(e,arguments.length>1?arguments[1]:void 0,3),r=0;r<n.length;)i((t=n[r++]).value,t.key,this)},keys:function(){return new os(this,"keys")},values:function(){return new os(this,"values")},entries:function(){return new os(this,"entries")}},{enumerable:!0}),re(ls,zo,ls.entries),re(ls,"toString",(function(){for(var e,t=$o(this).entries,n=[],i=0;i<t.length;)e=t[i++],n.push(ns(e.key)+"="+ns(e.value));return n.join("&")}),{enumerable:!0}),ot(ss,"URLSearchParams"),je({global:!0,forced:!Oo},{URLSearchParams:ss}),Oo||"function"!=typeof Bo||"function"!=typeof Vo||je({global:!0,enumerable:!0,forced:!0},{fetch:function(e){var t,n,i,r=[e];return arguments.length>1&&(o(t=arguments[1])&&(n=t.body,"URLSearchParams"===ti(n)&&((i=t.headers?new Vo(t.headers):new Vo).has("content-type")||i.set("content-type","application/x-www-form-urlencoded;charset=UTF-8"),t=$e(t,{body:T(0,String(n)),headers:T(0,i)}))),r.push(t)),Bo.apply(this,r)}});var cs,us={URLSearchParams:ss,getState:$o},hs=ua.codeAt,ds=a.URL,fs=us.URLSearchParams,ps=us.getState,ms=ie.set,gs=ie.getterFor("URL"),vs=Math.floor,ys=Math.pow,bs=/[A-Za-z]/,ws=/[\d+-.A-Za-z]/,ks=/\d/,Ts=/^(0x|0X)/,Ss=/^[0-7]+$/,Es=/^\d+$/,As=/^[\dA-Fa-f]+$/,xs=/[\u0000\u0009\u000A\u000D #%/:?@[\\]]/,Cs=/[\u0000\u0009\u000A\u000D #/:?@[\\]]/,Ps=/^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g,Os=/[\u0009\u000A\u000D]/g,Is=function(e,t){var n,i,r;if("["==t.charAt(0)){if("]"!=t.charAt(t.length-1))return"Invalid host";if(!(n=Ns(t.slice(1,-1))))return"Invalid host";e.host=n}else if(Us(e)){if(t=function(e){var t,n,i=[],r=e.toLowerCase().replace(jo,".").split(".");for(t=0;t<r.length;t++)n=r[t],i.push(Mo.test(n)?"xn--"+Uo(n):n);return i.join(".")}(t),xs.test(t))return"Invalid host";if(null===(n=Ls(t)))return"Invalid host";e.host=n}else{if(Cs.test(t))return"Invalid host";for(n="",i=ri(t),r=0;r<i.length;r++)n+=Fs(i[r],js);e.host=n}},Ls=function(e){var t,n,i,r,a,o,s,l=e.split(".");if(l.length&&""==l[l.length-1]&&l.pop(),(t=l.length)>4)return e;for(n=[],i=0;i<t;i++){if(""==(r=l[i]))return e;if(a=10,r.length>1&&"0"==r.charAt(0)&&(a=Ts.test(r)?16:8,r=r.slice(8==a?1:2)),""===r)o=0;else{if(!(10==a?Es:8==a?Ss:As).test(r))return e;o=parseInt(r,a)}n.push(o)}for(i=0;i<t;i++)if(o=n[i],i==t-1){if(o>=ys(256,5-t))return null}else if(o>255)return null;for(s=n.pop(),i=0;i<n.length;i++)s+=n[i]*ys(256,3-i);return s},Ns=function(e){var t,n,i,r,a,o,s,l=[0,0,0,0,0,0,0,0],c=0,u=null,h=0,d=function(){return e.charAt(h)};if(":"==d()){if(":"!=e.charAt(1))return;h+=2,u=++c}for(;d();){if(8==c)return;if(":"!=d()){for(t=n=0;n<4&&As.test(d());)t=16*t+parseInt(d(),16),h++,n++;if("."==d()){if(0==n)return;if(h-=n,c>6)return;for(i=0;d();){if(r=null,i>0){if(!("."==d()&&i<4))return;h++}if(!ks.test(d()))return;for(;ks.test(d());){if(a=parseInt(d(),10),null===r)r=a;else{if(0==r)return;r=10*r+a}if(r>255)return;h++}l[c]=256*l[c]+r,2!=++i&&4!=i||c++}if(4!=i)return;break}if(":"==d()){if(h++,!d())return}else if(d())return;l[c++]=t}else{if(null!==u)return;h++,u=++c}}if(null!==u)for(o=c-u,c=7;0!=c&&o>0;)s=l[c],l[c--]=l[u+o-1],l[u+--o]=s;else if(8!=c)return;return l},Ms=function(e){var t,n,i,r;if("number"==typeof e){for(t=[],n=0;n<4;n++)t.unshift(e%256),e=vs(e/256);return t.join(".")}if("object"==typeof e){for(t="",i=function(e){for(var t=null,n=1,i=null,r=0,a=0;a<8;a++)0!==e[a]?(r>n&&(t=i,n=r),i=null,r=0):(null===i&&(i=a),++r);return r>n&&(t=i,n=r),t}(e),n=0;n<8;n++)r&&0===e[n]||(r&&(r=!1),i===n?(t+=n?":":"::",r=!0):(t+=e[n].toString(16),n<7&&(t+=":")));return"["+t+"]"}return e},js={},Rs=No({},js,{" ":1,'"':1,"<":1,">":1,"`":1}),_s=No({},Rs,{"#":1,"?":1,"{":1,"}":1}),Ds=No({},_s,{"/":1,":":1,";":1,"=":1,"@":1,"[":1,"\\":1,"]":1,"^":1,"|":1}),Fs=function(e,t){var n=hs(e,0);return n>32&&n<127&&!I(t,e)?e:encodeURIComponent(e)},qs={ftp:21,file:null,http:80,https:443,ws:80,wss:443},Us=function(e){return I(qs,e.scheme)},Hs=function(e){return""!=e.username||""!=e.password},Bs=function(e){return!e.host||e.cannotBeABaseURL||"file"==e.scheme},Vs=function(e,t){var n;return 2==e.length&&bs.test(e.charAt(0))&&(":"==(n=e.charAt(1))||!t&&"|"==n)},zs=function(e){var t;return e.length>1&&Vs(e.slice(0,2))&&(2==e.length||"/"===(t=e.charAt(2))||"\\"===t||"?"===t||"#"===t)},Ws=function(e){var t=e.path,n=t.length;!n||"file"==e.scheme&&1==n&&Vs(t[0],!0)||t.pop()},$s=function(e){return"."===e||"%2e"===e.toLowerCase()},Ks={},Ys={},Gs={},Xs={},Qs={},Js={},Zs={},el={},tl={},nl={},il={},rl={},al={},ol={},sl={},ll={},cl={},ul={},hl={},dl={},fl={},pl=function(e,t,n,i){var r,a,o,s,l,c=n||Ks,u=0,h="",d=!1,f=!1,p=!1;for(n||(e.scheme="",e.username="",e.password="",e.host=null,e.port=null,e.path=[],e.query=null,e.fragment=null,e.cannotBeABaseURL=!1,t=t.replace(Ps,"")),t=t.replace(Os,""),r=ri(t);u<=r.length;){switch(a=r[u],c){case Ks:if(!a||!bs.test(a)){if(n)return"Invalid scheme";c=Gs;continue}h+=a.toLowerCase(),c=Ys;break;case Ys:if(a&&(ws.test(a)||"+"==a||"-"==a||"."==a))h+=a.toLowerCase();else{if(":"!=a){if(n)return"Invalid scheme";h="",c=Gs,u=0;continue}if(n&&(Us(e)!=I(qs,h)||"file"==h&&(Hs(e)||null!==e.port)||"file"==e.scheme&&!e.host))return;if(e.scheme=h,n)return void(Us(e)&&qs[e.scheme]==e.port&&(e.port=null));h="","file"==e.scheme?c=ol:Us(e)&&i&&i.scheme==e.scheme?c=Xs:Us(e)?c=el:"/"==r[u+1]?(c=Qs,u++):(e.cannotBeABaseURL=!0,e.path.push(""),c=hl)}break;case Gs:if(!i||i.cannotBeABaseURL&&"#"!=a)return"Invalid scheme";if(i.cannotBeABaseURL&&"#"==a){e.scheme=i.scheme,e.path=i.path.slice(),e.query=i.query,e.fragment="",e.cannotBeABaseURL=!0,c=fl;break}c="file"==i.scheme?ol:Js;continue;case Xs:if("/"!=a||"/"!=r[u+1]){c=Js;continue}c=tl,u++;break;case Qs:if("/"==a){c=nl;break}c=ul;continue;case Js:if(e.scheme=i.scheme,a==cs)e.username=i.username,e.password=i.password,e.host=i.host,e.port=i.port,e.path=i.path.slice(),e.query=i.query;else if("/"==a||"\\"==a&&Us(e))c=Zs;else if("?"==a)e.username=i.username,e.password=i.password,e.host=i.host,e.port=i.port,e.path=i.path.slice(),e.query="",c=dl;else{if("#"!=a){e.username=i.username,e.password=i.password,e.host=i.host,e.port=i.port,e.path=i.path.slice(),e.path.pop(),c=ul;continue}e.username=i.username,e.password=i.password,e.host=i.host,e.port=i.port,e.path=i.path.slice(),e.query=i.query,e.fragment="",c=fl}break;case Zs:if(!Us(e)||"/"!=a&&"\\"!=a){if("/"!=a){e.username=i.username,e.password=i.password,e.host=i.host,e.port=i.port,c=ul;continue}c=nl}else c=tl;break;case el:if(c=tl,"/"!=a||"/"!=h.charAt(u+1))continue;u++;break;case tl:if("/"!=a&&"\\"!=a){c=nl;continue}break;case nl:if("@"==a){d&&(h="%40"+h),d=!0,o=ri(h);for(var m=0;m<o.length;m++){var g=o[m];if(":"!=g||p){var v=Fs(g,Ds);p?e.password+=v:e.username+=v}else p=!0}h=""}else if(a==cs||"/"==a||"?"==a||"#"==a||"\\"==a&&Us(e)){if(d&&""==h)return"Invalid authority";u-=ri(h).length+1,h="",c=il}else h+=a;break;case il:case rl:if(n&&"file"==e.scheme){c=ll;continue}if(":"!=a||f){if(a==cs||"/"==a||"?"==a||"#"==a||"\\"==a&&Us(e)){if(Us(e)&&""==h)return"Invalid host";if(n&&""==h&&(Hs(e)||null!==e.port))return;if(s=Is(e,h))return s;if(h="",c=cl,n)return;continue}"["==a?f=!0:"]"==a&&(f=!1),h+=a}else{if(""==h)return"Invalid host";if(s=Is(e,h))return s;if(h="",c=al,n==rl)return}break;case al:if(!ks.test(a)){if(a==cs||"/"==a||"?"==a||"#"==a||"\\"==a&&Us(e)||n){if(""!=h){var y=parseInt(h,10);if(y>65535)return"Invalid port";e.port=Us(e)&&y===qs[e.scheme]?null:y,h=""}if(n)return;c=cl;continue}return"Invalid port"}h+=a;break;case ol:if(e.scheme="file","/"==a||"\\"==a)c=sl;else{if(!i||"file"!=i.scheme){c=ul;continue}if(a==cs)e.host=i.host,e.path=i.path.slice(),e.query=i.query;else if("?"==a)e.host=i.host,e.path=i.path.slice(),e.query="",c=dl;else{if("#"!=a){zs(r.slice(u).join(""))||(e.host=i.host,e.path=i.path.slice(),Ws(e)),c=ul;continue}e.host=i.host,e.path=i.path.slice(),e.query=i.query,e.fragment="",c=fl}}break;case sl:if("/"==a||"\\"==a){c=ll;break}i&&"file"==i.scheme&&!zs(r.slice(u).join(""))&&(Vs(i.path[0],!0)?e.path.push(i.path[0]):e.host=i.host),c=ul;continue;case ll:if(a==cs||"/"==a||"\\"==a||"?"==a||"#"==a){if(!n&&Vs(h))c=ul;else if(""==h){if(e.host="",n)return;c=cl}else{if(s=Is(e,h))return s;if("localhost"==e.host&&(e.host=""),n)return;h="",c=cl}continue}h+=a;break;case cl:if(Us(e)){if(c=ul,"/"!=a&&"\\"!=a)continue}else if(n||"?"!=a)if(n||"#"!=a){if(a!=cs&&(c=ul,"/"!=a))continue}else e.fragment="",c=fl;else e.query="",c=dl;break;case ul:if(a==cs||"/"==a||"\\"==a&&Us(e)||!n&&("?"==a||"#"==a)){if(".."===(l=(l=h).toLowerCase())||"%2e."===l||".%2e"===l||"%2e%2e"===l?(Ws(e),"/"==a||"\\"==a&&Us(e)||e.path.push("")):$s(h)?"/"==a||"\\"==a&&Us(e)||e.path.push(""):("file"==e.scheme&&!e.path.length&&Vs(h)&&(e.host&&(e.host=""),h=h.charAt(0)+":"),e.path.push(h)),h="","file"==e.scheme&&(a==cs||"?"==a||"#"==a))for(;e.path.length>1&&""===e.path[0];)e.path.shift();"?"==a?(e.query="",c=dl):"#"==a&&(e.fragment="",c=fl)}else h+=Fs(a,_s);break;case hl:"?"==a?(e.query="",c=dl):"#"==a?(e.fragment="",c=fl):a!=cs&&(e.path[0]+=Fs(a,js));break;case dl:n||"#"!=a?a!=cs&&("'"==a&&Us(e)?e.query+="%27":e.query+="#"==a?"%23":Fs(a,js)):(e.fragment="",c=fl);break;case fl:a!=cs&&(e.fragment+=Fs(a,Rs))}u++}},ml=function(e){var n,i,r=oo(this,ml,"URL"),a=arguments.length>1?arguments[1]:void 0,o=String(e),s=ms(r,{type:"URL"});if(void 0!==a)if(a instanceof ml)n=gs(a);else if(i=pl(n={},String(a)))throw TypeError(i);if(i=pl(s,o,null,n))throw TypeError(i);var l=s.searchParams=new fs,c=ps(l);c.updateSearchParams(s.query),c.updateURL=function(){s.query=String(l)||null},t||(r.href=vl.call(r),r.origin=yl.call(r),r.protocol=bl.call(r),r.username=wl.call(r),r.password=kl.call(r),r.host=Tl.call(r),r.hostname=Sl.call(r),r.port=El.call(r),r.pathname=Al.call(r),r.search=xl.call(r),r.searchParams=Cl.call(r),r.hash=Pl.call(r))},gl=ml.prototype,vl=function(){var e=gs(this),t=e.scheme,n=e.username,i=e.password,r=e.host,a=e.port,o=e.path,s=e.query,l=e.fragment,c=t+":";return null!==r?(c+="//",Hs(e)&&(c+=n+(i?":"+i:"")+"@"),c+=Ms(r),null!==a&&(c+=":"+a)):"file"==t&&(c+="//"),c+=e.cannotBeABaseURL?o[0]:o.length?"/"+o.join("/"):"",null!==s&&(c+="?"+s),null!==l&&(c+="#"+l),c},yl=function(){var e=gs(this),t=e.scheme,n=e.port;if("blob"==t)try{return new URL(t.path[0]).origin}catch(e){return"null"}return"file"!=t&&Us(e)?t+"://"+Ms(e.host)+(null!==n?":"+n:""):"null"},bl=function(){return gs(this).scheme+":"},wl=function(){return gs(this).username},kl=function(){return gs(this).password},Tl=function(){var e=gs(this),t=e.host,n=e.port;return null===t?"":null===n?Ms(t):Ms(t)+":"+n},Sl=function(){var e=gs(this).host;return null===e?"":Ms(e)},El=function(){var e=gs(this).port;return null===e?"":String(e)},Al=function(){var e=gs(this),t=e.path;return e.cannotBeABaseURL?t[0]:t.length?"/"+t.join("/"):""},xl=function(){var e=gs(this).query;return e?"?"+e:""},Cl=function(){return gs(this).searchParams},Pl=function(){var e=gs(this).fragment;return e?"#"+e:""},Ol=function(e,t){return{get:e,set:t,configurable:!0,enumerable:!0}};if(t&&Ue(gl,{href:Ol(vl,(function(e){var t=gs(this),n=String(e),i=pl(t,n);if(i)throw TypeError(i);ps(t.searchParams).updateSearchParams(t.query)})),origin:Ol(yl),protocol:Ol(bl,(function(e){var t=gs(this);pl(t,String(e)+":",Ks)})),username:Ol(wl,(function(e){var t=gs(this),n=ri(String(e));if(!Bs(t)){t.username="";for(var i=0;i<n.length;i++)t.username+=Fs(n[i],Ds)}})),password:Ol(kl,(function(e){var t=gs(this),n=ri(String(e));if(!Bs(t)){t.password="";for(var i=0;i<n.length;i++)t.password+=Fs(n[i],Ds)}})),host:Ol(Tl,(function(e){var t=gs(this);t.cannotBeABaseURL||pl(t,String(e),il)})),hostname:Ol(Sl,(function(e){var t=gs(this);t.cannotBeABaseURL||pl(t,String(e),rl)})),port:Ol(El,(function(e){var t=gs(this);Bs(t)||(""==(e=String(e))?t.port=null:pl(t,e,al))})),pathname:Ol(Al,(function(e){var t=gs(this);t.cannotBeABaseURL||(t.path=[],pl(t,e+"",cl))})),search:Ol(xl,(function(e){var t=gs(this);""==(e=String(e))?t.query=null:("?"==e.charAt(0)&&(e=e.slice(1)),t.query="",pl(t,e,dl)),ps(t.searchParams).updateSearchParams(t.query)})),searchParams:Ol(Cl),hash:Ol(Pl,(function(e){var t=gs(this);""!=(e=String(e))?("#"==e.charAt(0)&&(e=e.slice(1)),t.fragment="",pl(t,e,fl)):t.fragment=null}))}),re(gl,"toJSON",(function(){return vl.call(this)}),{enumerable:!0}),re(gl,"toString",(function(){return vl.call(this)}),{enumerable:!0}),ds){var Il=ds.createObjectURL,Ll=ds.revokeObjectURL;Il&&re(ml,"createObjectURL",(function(e){return Il.apply(ds,arguments)})),Ll&&re(ml,"revokeObjectURL",(function(e){return Ll.apply(ds,arguments)}))}function Nl(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function Ml(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function jl(e,t,n){return t&&Ml(e.prototype,t),n&&Ml(e,n),e}function Rl(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function _l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function Dl(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?_l(Object(n),!0).forEach((function(t){Rl(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):_l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function Fl(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},a=Object.keys(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(i=0;i<a.length;i++)n=a[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}function ql(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var n=[],i=!0,r=!1,a=void 0;try{for(var o,s=e[Symbol.iterator]();!(i=(o=s.next()).done)&&(n.push(o.value),!t||n.length!==t);i=!0);}catch(e){r=!0,a=e}finally{try{i||null==s.return||s.return()}finally{if(r)throw a}}return n}}(e,t)||Hl(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function Ul(e){return function(e){if(Array.isArray(e))return Bl(e)}(e)||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||Hl(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function Hl(e,t){if(e){if("string"==typeof e)return Bl(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Bl(e,t):void 0}}function Bl(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,i=new Array(t);n<t;n++)i[n]=e[n];return i}function Vl(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function zl(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Wl(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function $l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Wl(Object(n),!0).forEach((function(t){zl(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Wl(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}ot(ml,"URL"),je({global:!0,forced:!Oo,sham:!t},{URL:ml});var Kl={addCSS:!0,thumbWidth:15,watch:!0};function Yl(e,t){return function(){return Array.from(document.querySelectorAll(t)).includes(this)}.call(e,t)}var Gl=function(e){return null!=e?e.constructor:null},Xl=function(e,t){return!!(e&&t&&e instanceof t)},Ql=function(e){return null==e},Jl=function(e){return Gl(e)===Object},Zl=function(e){return Gl(e)===String},ec=function(e){return Array.isArray(e)},tc=function(e){return Xl(e,NodeList)},nc=Zl,ic=ec,rc=tc,ac=function(e){return Xl(e,Element)},oc=function(e){return Xl(e,Event)},sc=function(e){return Ql(e)||(Zl(e)||ec(e)||tc(e))&&!e.length||Jl(e)&&!Object.keys(e).length};function lc(e,t){if(1>t){var n=function(e){var t="".concat(e).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);return t?Math.max(0,(t[1]?t[1].length:0)-(t[2]?+t[2]:0)):0}(t);return parseFloat(e.toFixed(n))}return Math.round(e/t)*t}var cc,uc,hc,dc=function(){function e(t,n){(function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")})(this,e),ac(t)?this.element=t:nc(t)&&(this.element=document.querySelector(t)),ac(this.element)&&sc(this.element.rangeTouch)&&(this.config=$l({},Kl,{},n),this.init())}return function(e,t,n){t&&Vl(e.prototype,t),n&&Vl(e,n)}(e,[{key:"init",value:function(){e.enabled&&(this.config.addCSS&&(this.element.style.userSelect="none",this.element.style.webKitUserSelect="none",this.element.style.touchAction="manipulation"),this.listeners(!0),this.element.rangeTouch=this)}},{key:"destroy",value:function(){e.enabled&&(this.config.addCSS&&(this.element.style.userSelect="",this.element.style.webKitUserSelect="",this.element.style.touchAction=""),this.listeners(!1),this.element.rangeTouch=null)}},{key:"listeners",value:function(e){var t=this,n=e?"addEventListener":"removeEventListener";["touchstart","touchmove","touchend"].forEach((function(e){t.element[n](e,(function(e){return t.set(e)}),!1)}))}},{key:"get",value:function(t){if(!e.enabled||!oc(t))return null;var n,i=t.target,r=t.changedTouches[0],a=parseFloat(i.getAttribute("min"))||0,o=parseFloat(i.getAttribute("max"))||100,s=parseFloat(i.getAttribute("step"))||1,l=i.getBoundingClientRect(),c=100/l.width*(this.config.thumbWidth/2)/100;return 0>(n=100/l.width*(r.clientX-l.left))?n=0:100<n&&(n=100),50>n?n-=(100-2*n)*c:50<n&&(n+=2*(n-50)*c),a+lc(n/100*(o-a),s)}},{key:"set",value:function(t){e.enabled&&oc(t)&&!t.target.disabled&&(t.preventDefault(),t.target.value=this.get(t),function(e,t){if(e&&t){var n=new Event(t,{bubbles:!0});e.dispatchEvent(n)}}(t.target,"touchend"===t.type?"change":"input"))}}],[{key:"setup",value:function(t){var n=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},i=null;if(sc(t)||nc(t)?i=Array.from(document.querySelectorAll(nc(t)?t:'input[type="range"]')):ac(t)?i=[t]:rc(t)?i=Array.from(t):ic(t)&&(i=t.filter(ac)),sc(i))return null;var r=$l({},Kl,{},n);if(nc(t)&&r.watch){var a=new MutationObserver((function(n){Array.from(n).forEach((function(n){Array.from(n.addedNodes).forEach((function(n){ac(n)&&Yl(n,t)&&new e(n,r)}))}))}));a.observe(document.body,{childList:!0,subtree:!0})}return i.map((function(t){return new e(t,n)}))}},{key:"enabled",get:function(){return"ontouchstart"in document.documentElement}}]),e}(),fc=function(e){return null!=e?e.constructor:null},pc=function(e,t){return Boolean(e&&t&&e instanceof t)},mc=function(e){return null==e},gc=function(e){return fc(e)===Object},vc=function(e){return fc(e)===String},yc=function(e){return fc(e)===Function},bc=function(e){return Array.isArray(e)},wc=function(e){return pc(e,NodeList)},kc=function(e){return mc(e)||(vc(e)||bc(e)||wc(e))&&!e.length||gc(e)&&!Object.keys(e).length},Tc=mc,Sc=gc,Ec=function(e){return fc(e)===Number&&!Number.isNaN(e)},Ac=vc,xc=function(e){return fc(e)===Boolean},Cc=yc,Pc=bc,Oc=wc,Ic=function(e){return pc(e,Element)},Lc=function(e){return pc(e,Event)},Nc=function(e){return pc(e,KeyboardEvent)},Mc=function(e){return pc(e,TextTrack)||!mc(e)&&vc(e.kind)},jc=function(e){return pc(e,Promise)&&yc(e.then)},Rc=function(e){if(pc(e,window.URL))return!0;if(!vc(e))return!1;var t=e;e.startsWith("http://")&&e.startsWith("https://")||(t="http://".concat(e));try{return!kc(new URL(t).hostname)}catch(e){return!1}},_c=kc,Dc=(cc=document.createElement("span"),uc={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"},hc=Object.keys(uc).find((function(e){return void 0!==cc.style[e]})),!!Ac(hc)&&uc[hc]);function Fc(e,t){setTimeout((function(){try{e.hidden=!0,e.offsetHeight,e.hidden=!1}catch(e){}}),t)}var qc={isIE:
/* @cc_on!@ */
!!document.documentMode,isEdge:window.navigator.userAgent.includes("Edge"),isWebkit:"WebkitAppearance"in document.documentElement.style&&!/Edge/.test(navigator.userAgent),isIPhone:/(iPhone|iPod)/gi.test(navigator.platform),isIos:/(iPad|iPhone|iPod)/gi.test(navigator.platform)};function Uc(e,t){return t.split(".").reduce((function(e,t){return e&&e[t]}),e)}function Hc(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];if(!n.length)return e;var r=n.shift();return Sc(r)?(Object.keys(r).forEach((function(t){Sc(r[t])?(Object.keys(e).includes(t)||Object.assign(e,Rl({},t,{})),Hc(e[t],r[t])):Object.assign(e,Rl({},t,r[t]))})),Hc.apply(void 0,[e].concat(n))):e}function Bc(e,t){var n=e.length?e:[e];Array.from(n).reverse().forEach((function(e,n){var i=n>0?t.cloneNode(!0):t,r=e.parentNode,a=e.nextSibling;i.appendChild(e),a?r.insertBefore(i,a):r.appendChild(i)}))}function Vc(e,t){Ic(e)&&!_c(t)&&Object.entries(t).filter((function(e){var t=ql(e,2)[1];return!Tc(t)})).forEach((function(t){var n=ql(t,2),i=n[0],r=n[1];return e.setAttribute(i,r)}))}function zc(e,t,n){var i=document.createElement(e);return Sc(t)&&Vc(i,t),Ac(n)&&(i.innerText=n),i}function Wc(e,t,n,i){Ic(t)&&t.appendChild(zc(e,n,i))}function $c(e){Oc(e)||Pc(e)?Array.from(e).forEach($c):Ic(e)&&Ic(e.parentNode)&&e.parentNode.removeChild(e)}function Kc(e){if(Ic(e))for(var t=e.childNodes.length;t>0;)e.removeChild(e.lastChild),t-=1}function Yc(e,t){return Ic(t)&&Ic(t.parentNode)&&Ic(e)?(t.parentNode.replaceChild(e,t),e):null}function Gc(e,t){if(!Ac(e)||_c(e))return{};var n={},i=Hc({},t);return e.split(",").forEach((function(e){var t=e.trim(),r=t.replace(".",""),a=t.replace(/[[\]]/g,"").split("="),o=ql(a,1)[0],s=a.length>1?a[1].replace(/["']/g,""):"";switch(t.charAt(0)){case".":Ac(i.class)?n.class="".concat(i.class," ").concat(r):n.class=r;break;case"#":n.id=t.replace("#","");break;case"[":n[o]=s}})),Hc(i,n)}function Xc(e,t){if(Ic(e)){var n=t;xc(n)||(n=!e.hidden),e.hidden=n}}function Qc(e,t,n){if(Oc(e))return Array.from(e).map((function(e){return Qc(e,t,n)}));if(Ic(e)){var i="toggle";return void 0!==n&&(i=n?"add":"remove"),e.classList[i](t),e.classList.contains(t)}return!1}function Jc(e,t){return Ic(e)&&e.classList.contains(t)}function Zc(e,t){var n=Element.prototype;return(n.matches||n.webkitMatchesSelector||n.mozMatchesSelector||n.msMatchesSelector||function(){return Array.from(document.querySelectorAll(t)).includes(this)}).call(e,t)}function eu(e){return this.elements.container.querySelectorAll(e)}function tu(e){return this.elements.container.querySelector(e)}function nu(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];Ic(e)&&(e.focus({preventScroll:!0}),t&&Qc(e,this.config.classNames.tabFocus))}var iu={"audio/ogg":"vorbis","audio/wav":"1","video/webm":"vp8, vorbis","video/mp4":"avc1.42E01E, mp4a.40.2","video/ogg":"theora"},ru={audio:"canPlayType"in document.createElement("audio"),video:"canPlayType"in document.createElement("video"),check:function(e,t,n){var i=qc.isIPhone&&n&&ru.playsinline,r=ru[e]||"html5"!==t;return{api:r,ui:r&&ru.rangeInput&&("video"!==e||!qc.isIPhone||i)}},pip:!(qc.isIPhone||!Cc(zc("video").webkitSetPresentationMode)&&(!document.pictureInPictureEnabled||zc("video").disablePictureInPicture)),airplay:Cc(window.WebKitPlaybackTargetAvailabilityEvent),playsinline:"playsInline"in document.createElement("video"),mime:function(e){if(_c(e))return!1;var t=ql(e.split("/"),1)[0],n=e;if(!this.isHTML5||t!==this.type)return!1;Object.keys(iu).includes(n)&&(n+='; codecs="'.concat(iu[e],'"'));try{return Boolean(n&&this.media.canPlayType(n).replace(/no/,""))}catch(e){return!1}},textTracks:"textTracks"in document.createElement("video"),rangeInput:function(){var e=document.createElement("input");return e.type="range","range"===e.type}(),touch:"ontouchstart"in document.documentElement,transitions:!1!==Dc,reducedMotion:"matchMedia"in window&&window.matchMedia("(prefers-reduced-motion)").matches},au=function(){var e=!1;try{var t=Object.defineProperty({},"passive",{get:function(){return e=!0,null}});window.addEventListener("test",null,t),window.removeEventListener("test",null,t)}catch(e){}return e}();function ou(e,t,n){var i=this,r=arguments.length>3&&void 0!==arguments[3]&&arguments[3],a=!(arguments.length>4&&void 0!==arguments[4])||arguments[4],o=arguments.length>5&&void 0!==arguments[5]&&arguments[5];if(e&&"addEventListener"in e&&!_c(t)&&Cc(n)){var s=t.split(" "),l=o;au&&(l={passive:a,capture:o}),s.forEach((function(t){i&&i.eventListeners&&r&&i.eventListeners.push({element:e,type:t,callback:n,options:l}),e[r?"addEventListener":"removeEventListener"](t,n,l)}))}}function su(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=arguments.length>2?arguments[2]:void 0,i=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],r=arguments.length>4&&void 0!==arguments[4]&&arguments[4];ou.call(this,e,t,n,!0,i,r)}function lu(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=arguments.length>2?arguments[2]:void 0,i=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],r=arguments.length>4&&void 0!==arguments[4]&&arguments[4];ou.call(this,e,t,n,!1,i,r)}function cu(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",i=arguments.length>2?arguments[2]:void 0,r=!(arguments.length>3&&void 0!==arguments[3])||arguments[3],a=arguments.length>4&&void 0!==arguments[4]&&arguments[4],o=function o(){lu(e,n,o,r,a);for(var s=arguments.length,l=new Array(s),c=0;c<s;c++)l[c]=arguments[c];i.apply(t,l)};ou.call(this,e,n,o,!0,r,a)}function uu(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};if(Ic(e)&&!_c(t)){var r=new CustomEvent(t,{bubbles:n,detail:Dl(Dl({},i),{},{plyr:this})});e.dispatchEvent(r)}}function hu(){this&&this.eventListeners&&(this.eventListeners.forEach((function(e){var t=e.element,n=e.type,i=e.callback,r=e.options;t.removeEventListener(n,i,r)})),this.eventListeners=[])}function du(){var e=this;return new Promise((function(t){return e.ready?setTimeout(t,0):su.call(e,e.elements.container,"ready",t)})).then((function(){}))}function fu(e){jc(e)&&e.then(null,(function(){}))}function pu(e){return!!(Pc(e)||Ac(e)&&e.includes(":"))&&(Pc(e)?e:e.split(":")).map(Number).every(Ec)}function mu(e){if(!Pc(e)||!e.every(Ec))return null;var t=ql(e,2),n=t[0],i=t[1],r=function e(t,n){return 0===n?t:e(n,t%n)}(n,i);return[n/r,i/r]}function gu(e){var t=function(e){return pu(e)?e.split(":").map(Number):null},n=t(e);if(null===n&&(n=t(this.config.ratio)),null===n&&!_c(this.embed)&&Pc(this.embed.ratio)&&(n=this.embed.ratio),null===n&&this.isHTML5){var i=this.media;n=mu([i.videoWidth,i.videoHeight])}return n}function vu(e){if(!this.isVideo)return{};var t=this.elements.wrapper,n=gu.call(this,e),i=ql(Pc(n)?n:[0,0],2),r=100/i[0]*i[1];if(t.style.paddingBottom="".concat(r,"%"),this.isVimeo&&!this.config.vimeo.premium&&this.supported.ui){var a=100/this.media.offsetWidth*parseInt(window.getComputedStyle(this.media).paddingBottom,10),o=(a-r)/(a/50);this.fullscreen.active?t.style.paddingBottom=null:this.media.style.transform="translateY(-".concat(o,"%)")}else this.isHTML5&&t.classList.toggle(this.config.classNames.videoFixedRatio,null!==n);return{padding:r,ratio:n}}var yu={getSources:function(){var e=this;return this.isHTML5?Array.from(this.media.querySelectorAll("source")).filter((function(t){var n=t.getAttribute("type");return!!_c(n)||ru.mime.call(e,n)})):[]},getQualityOptions:function(){return this.config.quality.forced?this.config.quality.options:yu.getSources.call(this).map((function(e){return Number(e.getAttribute("size"))})).filter(Boolean)},setup:function(){if(this.isHTML5){var e=this;e.options.speed=e.config.speed.options,_c(this.config.ratio)||vu.call(e),Object.defineProperty(e.media,"quality",{get:function(){var t=yu.getSources.call(e).find((function(t){return t.getAttribute("src")===e.source}));return t&&Number(t.getAttribute("size"))},set:function(t){if(e.quality!==t){if(e.config.quality.forced&&Cc(e.config.quality.onChange))e.config.quality.onChange(t);else{var n=yu.getSources.call(e).find((function(e){return Number(e.getAttribute("size"))===t}));if(!n)return;var i=e.media,r=i.currentTime,a=i.paused,o=i.preload,s=i.readyState,l=i.playbackRate;e.media.src=n.getAttribute("src"),("none"!==o||s)&&(e.once("loadedmetadata",(function(){e.speed=l,e.currentTime=r,a||fu(e.play())})),e.media.load())}uu.call(e,e.media,"qualitychange",!1,{quality:t})}}})}},cancelRequests:function(){this.isHTML5&&($c(yu.getSources.call(this)),this.media.setAttribute("src",this.config.blankVideo),this.media.load(),this.debug.log("Cancelled network requests"))}};function bu(e){return Pc(e)?e.filter((function(t,n){return e.indexOf(t)===n})):e}function wu(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),i=1;i<t;i++)n[i-1]=arguments[i];return _c(e)?e:e.toString().replace(/{(\d+)}/g,(function(e,t){return n[t].toString()}))}var ku=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"";return e.replace(new RegExp(t.toString().replace(/([.*+?^=!:${}()|[\]/\\])/g,"\\$1"),"g"),n.toString())},Tu=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return e.toString().replace(/\w\S*/g,(function(e){return e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()}))};function Su(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=e.toString();return t=ku(t,"-"," "),t=ku(t,"_"," "),t=Tu(t),ku(t," ","")}function Eu(e){var t=document.createElement("div");return t.appendChild(e),t.innerHTML}var Au={pip:"PIP",airplay:"AirPlay",html5:"HTML5",vimeo:"Vimeo",youtube:"YouTube"},xu=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(_c(e)||_c(t))return"";var n=Uc(t.i18n,e);if(_c(n))return Object.keys(Au).includes(e)?Au[e]:"";var i={"{seektime}":t.seekTime,"{title}":t.title};return Object.entries(i).forEach((function(e){var t=ql(e,2),i=t[0],r=t[1];n=ku(n,i,r)})),n},Cu=function(){function e(t){Nl(this,e),this.enabled=t.config.storage.enabled,this.key=t.config.storage.key}return jl(e,[{key:"get",value:function(t){if(!e.supported||!this.enabled)return null;var n=window.localStorage.getItem(this.key);if(_c(n))return null;var i=JSON.parse(n);return Ac(t)&&t.length?i[t]:i}},{key:"set",value:function(t){if(e.supported&&this.enabled&&Sc(t)){var n=this.get();_c(n)&&(n={}),Hc(n,t),window.localStorage.setItem(this.key,JSON.stringify(n))}}}],[{key:"supported",get:function(){try{if(!("localStorage"in window))return!1;var e="___test";return window.localStorage.setItem(e,e),window.localStorage.removeItem(e),!0}catch(e){return!1}}}]),e}();function Pu(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"text";return new Promise((function(n,i){try{var r=new XMLHttpRequest;if(!("withCredentials"in r))return;r.addEventListener("load",(function(){if("text"===t)try{n(JSON.parse(r.responseText))}catch(e){n(r.responseText)}else n(r.response)})),r.addEventListener("error",(function(){throw new Error(r.status)})),r.open("GET",e,!0),r.responseType=t,r.send()}catch(e){i(e)}}))}function Ou(e,t){if(Ac(e)){var n="cache",i=Ac(t),r=function(){return null!==document.getElementById(t)},a=function(e,t){e.innerHTML=t,i&&r()||document.body.insertAdjacentElement("afterbegin",e)};if(!i||!r()){var o=Cu.supported,s=document.createElement("div");if(s.setAttribute("hidden",""),i&&s.setAttribute("id",t),o){var l=window.localStorage.getItem("".concat(n,"-").concat(t));if(null!==l){var c=JSON.parse(l);a(s,c.content)}}Pu(e).then((function(e){_c(e)||(o&&window.localStorage.setItem("".concat(n,"-").concat(t),JSON.stringify({content:e})),a(s,e))})).catch((function(){}))}}}var Iu=function(e){return Math.trunc(e/60/60%60,10)},Lu=function(e){return Math.trunc(e/60%60,10)},Nu=function(e){return Math.trunc(e%60,10)};function Mu(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(!Ec(e))return Mu(void 0,t,n);var i=function(e){return"0".concat(e).slice(-2)},r=Iu(e),a=Lu(e),o=Nu(e);return r=t||r>0?"".concat(r,":"):"","".concat(n&&e>0?"-":"").concat(r).concat(i(a),":").concat(i(o))}var ju={getIconUrl:function(){var e=new URL(this.config.iconUrl,window.location).host!==window.location.host||qc.isIE&&!window.svg4everybody;return{url:this.config.iconUrl,cors:e}},findElements:function(){try{return this.elements.controls=tu.call(this,this.config.selectors.controls.wrapper),this.elements.buttons={play:eu.call(this,this.config.selectors.buttons.play),pause:tu.call(this,this.config.selectors.buttons.pause),restart:tu.call(this,this.config.selectors.buttons.restart),rewind:tu.call(this,this.config.selectors.buttons.rewind),fastForward:tu.call(this,this.config.selectors.buttons.fastForward),mute:tu.call(this,this.config.selectors.buttons.mute),pip:tu.call(this,this.config.selectors.buttons.pip),airplay:tu.call(this,this.config.selectors.buttons.airplay),settings:tu.call(this,this.config.selectors.buttons.settings),captions:tu.call(this,this.config.selectors.buttons.captions),fullscreen:tu.call(this,this.config.selectors.buttons.fullscreen)},this.elements.progress=tu.call(this,this.config.selectors.progress),this.elements.inputs={seek:tu.call(this,this.config.selectors.inputs.seek),volume:tu.call(this,this.config.selectors.inputs.volume)},this.elements.display={buffer:tu.call(this,this.config.selectors.display.buffer),currentTime:tu.call(this,this.config.selectors.display.currentTime),duration:tu.call(this,this.config.selectors.display.duration)},Ic(this.elements.progress)&&(this.elements.display.seekTooltip=this.elements.progress.querySelector(".".concat(this.config.classNames.tooltip))),!0}catch(e){return this.debug.warn("It looks like there is a problem with your custom controls HTML",e),this.toggleNativeControls(!0),!1}},createIcon:function(e,t){var n="http://www.w3.org/2000/svg",i=ju.getIconUrl.call(this),r="".concat(i.cors?"":i.url,"#").concat(this.config.iconPrefix),a=document.createElementNS(n,"svg");Vc(a,Hc(t,{"aria-hidden":"true",focusable:"false"}));var o=document.createElementNS(n,"use"),s="".concat(r,"-").concat(e);return"href"in o&&o.setAttributeNS("http://www.w3.org/1999/xlink","href",s),o.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",s),a.appendChild(o),a},createLabel:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=xu(e,this.config),i=Dl(Dl({},t),{},{class:[t.class,this.config.classNames.hidden].filter(Boolean).join(" ")});return zc("span",i,n)},createBadge:function(e){if(_c(e))return null;var t=zc("span",{class:this.config.classNames.menu.value});return t.appendChild(zc("span",{class:this.config.classNames.menu.badge},e)),t},createButton:function(e,t){var n=this,i=Hc({},t),r=function(){var e=(arguments.length>0&&void 0!==arguments[0]?arguments[0]:"").toString();return(e=Su(e)).charAt(0).toLowerCase()+e.slice(1)}(e),a={element:"button",toggle:!1,label:null,icon:null,labelPressed:null,iconPressed:null};switch(["element","icon","label"].forEach((function(e){Object.keys(i).includes(e)&&(a[e]=i[e],delete i[e])})),"button"!==a.element||Object.keys(i).includes("type")||(i.type="button"),Object.keys(i).includes("class")?i.class.split(" ").some((function(e){return e===n.config.classNames.control}))||Hc(i,{class:"".concat(i.class," ").concat(this.config.classNames.control)}):i.class=this.config.classNames.control,e){case"play":a.toggle=!0,a.label="play",a.labelPressed="pause",a.icon="play",a.iconPressed="pause";break;case"mute":a.toggle=!0,a.label="mute",a.labelPressed="unmute",a.icon="volume",a.iconPressed="muted";break;case"captions":a.toggle=!0,a.label="enableCaptions",a.labelPressed="disableCaptions",a.icon="captions-off",a.iconPressed="captions-on";break;case"fullscreen":a.toggle=!0,a.label="enterFullscreen",a.labelPressed="exitFullscreen",a.icon="enter-fullscreen",a.iconPressed="exit-fullscreen";break;case"play-large":i.class+=" ".concat(this.config.classNames.control,"--overlaid"),r="play",a.label="play",a.icon="play";break;default:_c(a.label)&&(a.label=r),_c(a.icon)&&(a.icon=e)}var o=zc(a.element);return a.toggle?(o.appendChild(ju.createIcon.call(this,a.iconPressed,{class:"icon--pressed"})),o.appendChild(ju.createIcon.call(this,a.icon,{class:"icon--not-pressed"})),o.appendChild(ju.createLabel.call(this,a.labelPressed,{class:"label--pressed"})),o.appendChild(ju.createLabel.call(this,a.label,{class:"label--not-pressed"}))):(o.appendChild(ju.createIcon.call(this,a.icon)),o.appendChild(ju.createLabel.call(this,a.label))),Hc(i,Gc(this.config.selectors.buttons[r],i)),Vc(o,i),"play"===r?(Pc(this.elements.buttons[r])||(this.elements.buttons[r]=[]),this.elements.buttons[r].push(o)):this.elements.buttons[r]=o,o},createRange:function(e,t){var n=zc("input",Hc(Gc(this.config.selectors.inputs[e]),{type:"range",min:0,max:100,step:.01,value:0,autocomplete:"off",role:"slider","aria-label":xu(e,this.config),"aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":0},t));return this.elements.inputs[e]=n,ju.updateRangeFill.call(this,n),dc.setup(n),n},createProgress:function(e,t){var n=zc("progress",Hc(Gc(this.config.selectors.display[e]),{min:0,max:100,value:0,role:"progressbar","aria-hidden":!0},t));if("volume"!==e){n.appendChild(zc("span",null,"0"));var i={played:"played",buffer:"buffered"}[e],r=i?xu(i,this.config):"";n.innerText="% ".concat(r.toLowerCase())}return this.elements.display[e]=n,n},createTime:function(e,t){var n=Gc(this.config.selectors.display[e],t),i=zc("div",Hc(n,{class:"".concat(n.class?n.class:""," ").concat(this.config.classNames.display.time," ").trim(),"aria-label":xu(e,this.config)}),"00:00");return this.elements.display[e]=i,i},bindMenuItemShortcuts:function(e,t){var n=this;su.call(this,e,"keydown keyup",(function(i){if([32,38,39,40].includes(i.which)&&(i.preventDefault(),i.stopPropagation(),"keydown"!==i.type)){var r,a=Zc(e,'[role="menuitemradio"]');!a&&[32,39].includes(i.which)?ju.showMenuPanel.call(n,t,!0):32!==i.which&&(40===i.which||a&&39===i.which?(r=e.nextElementSibling,Ic(r)||(r=e.parentNode.firstElementChild)):(r=e.previousElementSibling,Ic(r)||(r=e.parentNode.lastElementChild)),nu.call(n,r,!0))}}),!1),su.call(this,e,"keyup",(function(e){13===e.which&&ju.focusFirstMenuItem.call(n,null,!0)}))},createMenuItem:function(e){var t=this,n=e.value,i=e.list,r=e.type,a=e.title,o=e.badge,s=void 0===o?null:o,l=e.checked,c=void 0!==l&&l,u=Gc(this.config.selectors.inputs[r]),h=zc("button",Hc(u,{type:"button",role:"menuitemradio",class:"".concat(this.config.classNames.control," ").concat(u.class?u.class:"").trim(),"aria-checked":c,value:n})),d=zc("span");d.innerHTML=a,Ic(s)&&d.appendChild(s),h.appendChild(d),Object.defineProperty(h,"checked",{enumerable:!0,get:function(){return"true"===h.getAttribute("aria-checked")},set:function(e){e&&Array.from(h.parentNode.children).filter((function(e){return Zc(e,'[role="menuitemradio"]')})).forEach((function(e){return e.setAttribute("aria-checked","false")})),h.setAttribute("aria-checked",e?"true":"false")}}),this.listeners.bind(h,"click keyup",(function(e){if(!Nc(e)||32===e.which){switch(e.preventDefault(),e.stopPropagation(),h.checked=!0,r){case"language":t.currentTrack=Number(n);break;case"quality":t.quality=n;break;case"speed":t.speed=parseFloat(n)}ju.showMenuPanel.call(t,"home",Nc(e))}}),r,!1),ju.bindMenuItemShortcuts.call(this,h,r),i.appendChild(h)},formatTime:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(!Ec(e))return e;var n=Iu(this.duration)>0;return Mu(e,n,t)},updateTimeDisplay:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];Ic(e)&&Ec(t)&&(e.innerText=ju.formatTime(t,n))},updateVolume:function(){this.supported.ui&&(Ic(this.elements.inputs.volume)&&ju.setRange.call(this,this.elements.inputs.volume,this.muted?0:this.volume),Ic(this.elements.buttons.mute)&&(this.elements.buttons.mute.pressed=this.muted||0===this.volume))},setRange:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;Ic(e)&&(e.value=t,ju.updateRangeFill.call(this,e))},updateProgress:function(e){var t=this;if(this.supported.ui&&Lc(e)){var n=0;if(e)switch(e.type){case"timeupdate":case"seeking":case"seeked":n=function(e,t){return 0===e||0===t||Number.isNaN(e)||Number.isNaN(t)?0:(e/t*100).toFixed(2)}(this.currentTime,this.duration),"timeupdate"===e.type&&ju.setRange.call(this,this.elements.inputs.seek,n);break;case"playing":case"progress":!function(e,n){var i=Ec(n)?n:0,r=Ic(e)?e:t.elements.display.buffer;if(Ic(r)){r.value=i;var a=r.getElementsByTagName("span")[0];Ic(a)&&(a.childNodes[0].nodeValue=i)}}(this.elements.display.buffer,100*this.buffered)}}},updateRangeFill:function(e){var t=Lc(e)?e.target:e;if(Ic(t)&&"range"===t.getAttribute("type")){if(Zc(t,this.config.selectors.inputs.seek)){t.setAttribute("aria-valuenow",this.currentTime);var n=ju.formatTime(this.currentTime),i=ju.formatTime(this.duration),r=xu("seekLabel",this.config);t.setAttribute("aria-valuetext",r.replace("{currentTime}",n).replace("{duration}",i))}else if(Zc(t,this.config.selectors.inputs.volume)){var a=100*t.value;t.setAttribute("aria-valuenow",a),t.setAttribute("aria-valuetext","".concat(a.toFixed(1),"%"))}else t.setAttribute("aria-valuenow",t.value);qc.isWebkit&&t.style.setProperty("--value","".concat(t.value/t.max*100,"%"))}},updateSeekTooltip:function(e){var t=this;if(this.config.tooltips.seek&&Ic(this.elements.inputs.seek)&&Ic(this.elements.display.seekTooltip)&&0!==this.duration){var n="".concat(this.config.classNames.tooltip,"--visible"),i=function(e){return Qc(t.elements.display.seekTooltip,n,e)};if(this.touch)i(!1);else{var r=0,a=this.elements.progress.getBoundingClientRect();if(Lc(e))r=100/a.width*(e.pageX-a.left);else{if(!Jc(this.elements.display.seekTooltip,n))return;r=parseFloat(this.elements.display.seekTooltip.style.left,10)}r<0?r=0:r>100&&(r=100),ju.updateTimeDisplay.call(this,this.elements.display.seekTooltip,this.duration/100*r),this.elements.display.seekTooltip.style.left="".concat(r,"%"),Lc(e)&&["mouseenter","mouseleave"].includes(e.type)&&i("mouseenter"===e.type)}}},timeUpdate:function(e){var t=!Ic(this.elements.display.duration)&&this.config.invertTime;ju.updateTimeDisplay.call(this,this.elements.display.currentTime,t?this.duration-this.currentTime:this.currentTime,t),e&&"timeupdate"===e.type&&this.media.seeking||ju.updateProgress.call(this,e)},durationUpdate:function(){if(this.supported.ui&&(this.config.invertTime||!this.currentTime)){if(this.duration>=Math.pow(2,32))return Xc(this.elements.display.currentTime,!0),void Xc(this.elements.progress,!0);Ic(this.elements.inputs.seek)&&this.elements.inputs.seek.setAttribute("aria-valuemax",this.duration);var e=Ic(this.elements.display.duration);!e&&this.config.displayDuration&&this.paused&&ju.updateTimeDisplay.call(this,this.elements.display.currentTime,this.duration),e&&ju.updateTimeDisplay.call(this,this.elements.display.duration,this.duration),ju.updateSeekTooltip.call(this)}},toggleMenuButton:function(e,t){Xc(this.elements.settings.buttons[e],!t)},updateSetting:function(e,t,n){var i=this.elements.settings.panels[e],r=null,a=t;if("captions"===e)r=this.currentTrack;else{if(r=_c(n)?this[e]:n,_c(r)&&(r=this.config[e].default),!_c(this.options[e])&&!this.options[e].includes(r))return void this.debug.warn("Unsupported value of '".concat(r,"' for ").concat(e));if(!this.config[e].options.includes(r))return void this.debug.warn("Disabled value of '".concat(r,"' for ").concat(e))}if(Ic(a)||(a=i&&i.querySelector('[role="menu"]')),Ic(a)){this.elements.settings.buttons[e].querySelector(".".concat(this.config.classNames.menu.value)).innerHTML=ju.getLabel.call(this,e,r);var o=a&&a.querySelector('[value="'.concat(r,'"]'));Ic(o)&&(o.checked=!0)}},getLabel:function(e,t){switch(e){case"speed":return 1===t?xu("normal",this.config):"".concat(t,"&times;");case"quality":if(Ec(t)){var n=xu("qualityLabel.".concat(t),this.config);return n.length?n:"".concat(t,"p")}return Tu(t);case"captions":return Du.getLabel.call(this);default:return null}},setQualityMenu:function(e){var t=this;if(Ic(this.elements.settings.panels.quality)){var n="quality",i=this.elements.settings.panels.quality.querySelector('[role="menu"]');Pc(e)&&(this.options.quality=bu(e).filter((function(e){return t.config.quality.options.includes(e)})));var r=!_c(this.options.quality)&&this.options.quality.length>1;if(ju.toggleMenuButton.call(this,n,r),Kc(i),ju.checkMenu.call(this),r){var a=function(e){var n=xu("qualityBadge.".concat(e),t.config);return n.length?ju.createBadge.call(t,n):null};this.options.quality.sort((function(e,n){var i=t.config.quality.options;return i.indexOf(e)>i.indexOf(n)?1:-1})).forEach((function(e){ju.createMenuItem.call(t,{value:e,list:i,type:n,title:ju.getLabel.call(t,"quality",e),badge:a(e)})})),ju.updateSetting.call(this,n,i)}}},setCaptionsMenu:function(){var e=this;if(Ic(this.elements.settings.panels.captions)){var t="captions",n=this.elements.settings.panels.captions.querySelector('[role="menu"]'),i=Du.getTracks.call(this),r=Boolean(i.length);if(ju.toggleMenuButton.call(this,t,r),Kc(n),ju.checkMenu.call(this),r){var a=i.map((function(t,i){return{value:i,checked:e.captions.toggled&&e.currentTrack===i,title:Du.getLabel.call(e,t),badge:t.language&&ju.createBadge.call(e,t.language.toUpperCase()),list:n,type:"language"}}));a.unshift({value:-1,checked:!this.captions.toggled,title:xu("disabled",this.config),list:n,type:"language"}),a.forEach(ju.createMenuItem.bind(this)),ju.updateSetting.call(this,t,n)}}},setSpeedMenu:function(){var e=this;if(Ic(this.elements.settings.panels.speed)){var t="speed",n=this.elements.settings.panels.speed.querySelector('[role="menu"]');this.options.speed=this.options.speed.filter((function(t){return t>=e.minimumSpeed&&t<=e.maximumSpeed}));var i=!_c(this.options.speed)&&this.options.speed.length>1;ju.toggleMenuButton.call(this,t,i),Kc(n),ju.checkMenu.call(this),i&&(this.options.speed.forEach((function(i){ju.createMenuItem.call(e,{value:i,list:n,type:t,title:ju.getLabel.call(e,"speed",i)})})),ju.updateSetting.call(this,t,n))}},checkMenu:function(){var e=this.elements.settings.buttons,t=!_c(e)&&Object.values(e).some((function(e){return!e.hidden}));Xc(this.elements.settings.menu,!t)},focusFirstMenuItem:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(!this.elements.settings.popup.hidden){var n=e;Ic(n)||(n=Object.values(this.elements.settings.panels).find((function(e){return!e.hidden})));var i=n.querySelector('[role^="menuitem"]');nu.call(this,i,t)}},toggleMenu:function(e){var t=this.elements.settings.popup,n=this.elements.buttons.settings;if(Ic(t)&&Ic(n)){var i=t.hidden,r=i;if(xc(e))r=e;else if(Nc(e)&&27===e.which)r=!1;else if(Lc(e)){var a=Cc(e.composedPath)?e.composedPath()[0]:e.target,o=t.contains(a);if(o||!o&&e.target!==n&&r)return}n.setAttribute("aria-expanded",r),Xc(t,!r),Qc(this.elements.container,this.config.classNames.menu.open,r),r&&Nc(e)?ju.focusFirstMenuItem.call(this,null,!0):r||i||nu.call(this,n,Nc(e))}},getMenuSize:function(e){var t=e.cloneNode(!0);t.style.position="absolute",t.style.opacity=0,t.removeAttribute("hidden"),e.parentNode.appendChild(t);var n=t.scrollWidth,i=t.scrollHeight;return $c(t),{width:n,height:i}},showMenuPanel:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]&&arguments[1],i=this.elements.container.querySelector("#plyr-settings-".concat(this.id,"-").concat(t));if(Ic(i)){var r=i.parentNode,a=Array.from(r.children).find((function(e){return!e.hidden}));if(ru.transitions&&!ru.reducedMotion){r.style.width="".concat(a.scrollWidth,"px"),r.style.height="".concat(a.scrollHeight,"px");var o=ju.getMenuSize.call(this,i),s=function t(n){n.target===r&&["width","height"].includes(n.propertyName)&&(r.style.width="",r.style.height="",lu.call(e,r,Dc,t))};su.call(this,r,Dc,s),r.style.width="".concat(o.width,"px"),r.style.height="".concat(o.height,"px")}Xc(a,!0),Xc(i,!1),ju.focusFirstMenuItem.call(this,i,n)}},setDownloadUrl:function(){var e=this.elements.buttons.download;Ic(e)&&e.setAttribute("href",this.download)},create:function(e){var t=this,n=ju.bindMenuItemShortcuts,i=ju.createButton,r=ju.createProgress,a=ju.createRange,o=ju.createTime,s=ju.setQualityMenu,l=ju.setSpeedMenu,c=ju.showMenuPanel;this.elements.controls=null,Pc(this.config.controls)&&this.config.controls.includes("play-large")&&this.elements.container.appendChild(i.call(this,"play-large"));var u=zc("div",Gc(this.config.selectors.controls.wrapper));this.elements.controls=u;var h={class:"plyr__controls__item"};return bu(Pc(this.config.controls)?this.config.controls:[]).forEach((function(s){if("restart"===s&&u.appendChild(i.call(t,"restart",h)),"rewind"===s&&u.appendChild(i.call(t,"rewind",h)),"play"===s&&u.appendChild(i.call(t,"play",h)),"fast-forward"===s&&u.appendChild(i.call(t,"fast-forward",h)),"progress"===s){var l=zc("div",{class:"".concat(h.class," plyr__progress__container")}),d=zc("div",Gc(t.config.selectors.progress));if(d.appendChild(a.call(t,"seek",{id:"plyr-seek-".concat(e.id)})),d.appendChild(r.call(t,"buffer")),t.config.tooltips.seek){var f=zc("span",{class:t.config.classNames.tooltip},"00:00");d.appendChild(f),t.elements.display.seekTooltip=f}t.elements.progress=d,l.appendChild(t.elements.progress),u.appendChild(l)}if("current-time"===s&&u.appendChild(o.call(t,"currentTime",h)),"duration"===s&&u.appendChild(o.call(t,"duration",h)),"mute"===s||"volume"===s){var p=t.elements.volume;if(Ic(p)&&u.contains(p)||(p=zc("div",Hc({},h,{class:"".concat(h.class," plyr__volume").trim()})),t.elements.volume=p,u.appendChild(p)),"mute"===s&&p.appendChild(i.call(t,"mute")),"volume"===s&&!qc.isIos){var m={max:1,step:.05,value:t.config.volume};p.appendChild(a.call(t,"volume",Hc(m,{id:"plyr-volume-".concat(e.id)})))}}if("captions"===s&&u.appendChild(i.call(t,"captions",h)),"settings"===s&&!_c(t.config.settings)){var g=zc("div",Hc({},h,{class:"".concat(h.class," plyr__menu").trim(),hidden:""}));g.appendChild(i.call(t,"settings",{"aria-haspopup":!0,"aria-controls":"plyr-settings-".concat(e.id),"aria-expanded":!1}));var v=zc("div",{class:"plyr__menu__container",id:"plyr-settings-".concat(e.id),hidden:""}),y=zc("div"),b=zc("div",{id:"plyr-settings-".concat(e.id,"-home")}),w=zc("div",{role:"menu"});b.appendChild(w),y.appendChild(b),t.elements.settings.panels.home=b,t.config.settings.forEach((function(i){var r=zc("button",Hc(Gc(t.config.selectors.buttons.settings),{type:"button",class:"".concat(t.config.classNames.control," ").concat(t.config.classNames.control,"--forward"),role:"menuitem","aria-haspopup":!0,hidden:""}));n.call(t,r,i),su.call(t,r,"click",(function(){c.call(t,i,!1)}));var a=zc("span",null,xu(i,t.config)),o=zc("span",{class:t.config.classNames.menu.value});o.innerHTML=e[i],a.appendChild(o),r.appendChild(a),w.appendChild(r);var s=zc("div",{id:"plyr-settings-".concat(e.id,"-").concat(i),hidden:""}),l=zc("button",{type:"button",class:"".concat(t.config.classNames.control," ").concat(t.config.classNames.control,"--back")});l.appendChild(zc("span",{"aria-hidden":!0},xu(i,t.config))),l.appendChild(zc("span",{class:t.config.classNames.hidden},xu("menuBack",t.config))),su.call(t,s,"keydown",(function(e){37===e.which&&(e.preventDefault(),e.stopPropagation(),c.call(t,"home",!0))}),!1),su.call(t,l,"click",(function(){c.call(t,"home",!1)})),s.appendChild(l),s.appendChild(zc("div",{role:"menu"})),y.appendChild(s),t.elements.settings.buttons[i]=r,t.elements.settings.panels[i]=s})),v.appendChild(y),g.appendChild(v),u.appendChild(g),t.elements.settings.popup=v,t.elements.settings.menu=g}if("pip"===s&&ru.pip&&u.appendChild(i.call(t,"pip",h)),"airplay"===s&&ru.airplay&&u.appendChild(i.call(t,"airplay",h)),"download"===s){var k=Hc({},h,{element:"a",href:t.download,target:"_blank"});t.isHTML5&&(k.download="");var T=t.config.urls.download;!Rc(T)&&t.isEmbed&&Hc(k,{icon:"logo-".concat(t.provider),label:t.provider}),u.appendChild(i.call(t,"download",k))}"fullscreen"===s&&u.appendChild(i.call(t,"fullscreen",h))})),this.isHTML5&&s.call(this,yu.getQualityOptions.call(this)),l.call(this),u},inject:function(){var e=this;if(this.config.loadSprite){var t=ju.getIconUrl.call(this);t.cors&&Ou(t.url,"sprite-plyr")}this.id=Math.floor(1e4*Math.random());var n=null;this.elements.controls=null;var i,r,a={id:this.id,seektime:this.config.seekTime,title:this.config.title},o=!0;if(Cc(this.config.controls)&&(this.config.controls=this.config.controls.call(this,a)),this.config.controls||(this.config.controls=[]),Ic(this.config.controls)||Ac(this.config.controls)?n=this.config.controls:(n=ju.create.call(this,{id:this.id,seektime:this.config.seekTime,speed:this.speed,quality:this.quality,captions:Du.getLabel.call(this)}),o=!1),o&&Ac(this.config.controls)&&(i=n,Object.entries(a).forEach((function(e){var t=ql(e,2),n=t[0],r=t[1];i=ku(i,"{".concat(n,"}"),r)})),n=i),Ac(this.config.selectors.controls.container)&&(r=document.querySelector(this.config.selectors.controls.container)),Ic(r)||(r=this.elements.container),r[Ic(n)?"insertAdjacentElement":"insertAdjacentHTML"]("afterbegin",n),Ic(this.elements.controls)||ju.findElements.call(this),!_c(this.elements.buttons)){var s=function(t){var n=e.config.classNames.controlPressed;Object.defineProperty(t,"pressed",{enumerable:!0,get:function(){return Jc(t,n)},set:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];Qc(t,n,e)}})};Object.values(this.elements.buttons).filter(Boolean).forEach((function(e){Pc(e)||Oc(e)?Array.from(e).filter(Boolean).forEach(s):s(e)}))}if(qc.isEdge&&Fc(r),this.config.tooltips.controls){var l=this.config,c=l.classNames,u=l.selectors,h="".concat(u.controls.wrapper," ").concat(u.labels," .").concat(c.hidden),d=eu.call(this,h);Array.from(d).forEach((function(t){Qc(t,e.config.classNames.hidden,!1),Qc(t,e.config.classNames.tooltip,!0)}))}}};function Ru(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=e;if(t){var i=document.createElement("a");i.href=n,n=i.href}try{return new URL(n)}catch(e){return null}}function _u(e){var t=new URLSearchParams;return Sc(e)&&Object.entries(e).forEach((function(e){var n=ql(e,2),i=n[0],r=n[1];t.set(i,r)})),t}var Du={setup:function(){if(this.supported.ui)if(!this.isVideo||this.isYouTube||this.isHTML5&&!ru.textTracks)Pc(this.config.controls)&&this.config.controls.includes("settings")&&this.config.settings.includes("captions")&&ju.setCaptionsMenu.call(this);else{if(Ic(this.elements.captions)||(this.elements.captions=zc("div",Gc(this.config.selectors.captions)),function(e,t){Ic(e)&&Ic(t)&&t.parentNode.insertBefore(e,t.nextSibling)}(this.elements.captions,this.elements.wrapper)),qc.isIE&&window.URL){var e=this.media.querySelectorAll("track");Array.from(e).forEach((function(e){var t=e.getAttribute("src"),n=Ru(t);null!==n&&n.hostname!==window.location.href.hostname&&["http:","https:"].includes(n.protocol)&&Pu(t,"blob").then((function(t){e.setAttribute("src",window.URL.createObjectURL(t))})).catch((function(){$c(e)}))}))}var t=bu((navigator.languages||[navigator.language||navigator.userLanguage||"en"]).map((function(e){return e.split("-")[0]}))),n=(this.storage.get("language")||this.config.captions.language||"auto").toLowerCase();"auto"===n&&(n=ql(t,1)[0]);var i=this.storage.get("captions");if(xc(i)||(i=this.config.captions.active),Object.assign(this.captions,{toggled:!1,active:i,language:n,languages:t}),this.isHTML5){var r=this.config.captions.update?"addtrack removetrack":"removetrack";su.call(this,this.media.textTracks,r,Du.update.bind(this))}setTimeout(Du.update.bind(this),0)}},update:function(){var e=this,t=Du.getTracks.call(this,!0),n=this.captions,i=n.active,r=n.language,a=n.meta,o=n.currentTrackNode,s=Boolean(t.find((function(e){return e.language===r})));this.isHTML5&&this.isVideo&&t.filter((function(e){return!a.get(e)})).forEach((function(t){e.debug.log("Track added",t),a.set(t,{default:"showing"===t.mode}),"showing"===t.mode&&(t.mode="hidden"),su.call(e,t,"cuechange",(function(){return Du.updateCues.call(e)}))})),(s&&this.language!==r||!t.includes(o))&&(Du.setLanguage.call(this,r),Du.toggle.call(this,i&&s)),Qc(this.elements.container,this.config.classNames.captions.enabled,!_c(t)),Pc(this.config.controls)&&this.config.controls.includes("settings")&&this.config.settings.includes("captions")&&ju.setCaptionsMenu.call(this)},toggle:function(e){var t=this,n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];if(this.supported.ui){var i=this.captions.toggled,r=this.config.classNames.captions.active,a=Tc(e)?!i:e;if(a!==i){if(n||(this.captions.active=a,this.storage.set({captions:a})),!this.language&&a&&!n){var o=Du.getTracks.call(this),s=Du.findTrack.call(this,[this.captions.language].concat(Ul(this.captions.languages)),!0);return this.captions.language=s.language,void Du.set.call(this,o.indexOf(s))}this.elements.buttons.captions&&(this.elements.buttons.captions.pressed=a),Qc(this.elements.container,r,a),this.captions.toggled=a,ju.updateSetting.call(this,"captions"),uu.call(this,this.media,a?"captionsenabled":"captionsdisabled")}setTimeout((function(){a&&t.captions.toggled&&(t.captions.currentTrackNode.mode="hidden")}))}},set:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],n=Du.getTracks.call(this);if(-1!==e)if(Ec(e))if(e in n){if(this.captions.currentTrack!==e){this.captions.currentTrack=e;var i=n[e],r=i||{},a=r.language;this.captions.currentTrackNode=i,ju.updateSetting.call(this,"captions"),t||(this.captions.language=a,this.storage.set({language:a})),this.isVimeo&&this.embed.enableTextTrack(a),uu.call(this,this.media,"languagechange")}Du.toggle.call(this,!0,t),this.isHTML5&&this.isVideo&&Du.updateCues.call(this)}else this.debug.warn("Track not found",e);else this.debug.warn("Invalid caption argument",e);else Du.toggle.call(this,!1,t)},setLanguage:function(e){var t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];if(Ac(e)){var n=e.toLowerCase();this.captions.language=n;var i=Du.getTracks.call(this),r=Du.findTrack.call(this,[n]);Du.set.call(this,i.indexOf(r),t)}else this.debug.warn("Invalid language argument",e)},getTracks:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]&&arguments[0],n=Array.from((this.media||{}).textTracks||[]);return n.filter((function(n){return!e.isHTML5||t||e.captions.meta.has(n)})).filter((function(e){return["captions","subtitles"].includes(e.kind)}))},findTrack:function(e){var t,n=this,i=arguments.length>1&&void 0!==arguments[1]&&arguments[1],r=Du.getTracks.call(this),a=function(e){return Number((n.captions.meta.get(e)||{}).default)},o=Array.from(r).sort((function(e,t){return a(t)-a(e)}));return e.every((function(e){return!(t=o.find((function(t){return t.language===e})))})),t||(i?o[0]:void 0)},getCurrentTrack:function(){return Du.getTracks.call(this)[this.currentTrack]},getLabel:function(e){var t=e;return!Mc(t)&&ru.textTracks&&this.captions.toggled&&(t=Du.getCurrentTrack.call(this)),Mc(t)?_c(t.label)?_c(t.language)?xu("enabled",this.config):e.language.toUpperCase():t.label:xu("disabled",this.config)},updateCues:function(e){if(this.supported.ui)if(Ic(this.elements.captions))if(Tc(e)||Array.isArray(e)){var t=e;if(!t){var n=Du.getCurrentTrack.call(this);t=Array.from((n||{}).activeCues||[]).map((function(e){return e.getCueAsHTML()})).map(Eu)}var i=t.map((function(e){return e.trim()})).join("\n");if(i!==this.elements.captions.innerHTML){Kc(this.elements.captions);var r=zc("span",Gc(this.config.selectors.caption));r.innerHTML=i,this.elements.captions.appendChild(r),uu.call(this,this.media,"cuechange")}}else this.debug.warn("updateCues: Invalid input",e);else this.debug.warn("No captions element to render to")}},Fu={enabled:!0,title:"",debug:!1,autoplay:!1,autopause:!0,playsinline:!0,seekTime:10,volume:1,muted:!1,duration:null,displayDuration:!0,invertTime:!0,toggleInvert:!0,ratio:null,clickToPlay:!0,hideControls:!0,resetOnEnd:!1,disableContextMenu:!0,loadSprite:!0,iconPrefix:"plyr",iconUrl:"https://cdn.plyr.io/3.6.1/plyr.svg",blankVideo:"https://cdn.plyr.io/static/blank.mp4",quality:{default:576,options:[4320,2880,2160,1440,1080,720,576,480,360,240],forced:!1,onChange:null},loop:{active:!1},speed:{selected:1,options:[.5,.75,1,1.25,1.5,1.75,2,4]},keyboard:{focused:!0,global:!1},tooltips:{controls:!1,seek:!0},captions:{active:!1,language:"auto",update:!1},fullscreen:{enabled:!0,fallback:!0,iosNative:!1},storage:{enabled:!0,key:"plyr"},controls:["play-large","play","progress","current-time","mute","volume","captions","settings","pip","airplay","fullscreen"],settings:["captions","quality","speed"],i18n:{restart:"Restart",rewind:"Rewind {seektime}s",play:"Play",pause:"Pause",fastForward:"Forward {seektime}s",seek:"Seek",seekLabel:"{currentTime} of {duration}",played:"Played",buffered:"Buffered",currentTime:"Current time",duration:"Duration",volume:"Volume",mute:"Mute",unmute:"Unmute",enableCaptions:"Enable captions",disableCaptions:"Disable captions",download:"Download",enterFullscreen:"Enter fullscreen",exitFullscreen:"Exit fullscreen",frameTitle:"Player for {title}",captions:"Captions",settings:"Settings",pip:"PIP",menuBack:"Go back to previous menu",speed:"Speed",normal:"Normal",quality:"Quality",loop:"Loop",start:"Start",end:"End",all:"All",reset:"Reset",disabled:"Disabled",enabled:"Enabled",advertisement:"Ad",qualityBadge:{2160:"4K",1440:"HD",1080:"HD",720:"HD",576:"SD",480:"SD"}},urls:{download:null,vimeo:{sdk:"https://player.vimeo.com/api/player.js",iframe:"https://player.vimeo.com/video/{0}?{1}",api:"https://vimeo.com/api/v2/video/{0}.json"},youtube:{sdk:"https://www.youtube.com/iframe_api",api:"https://noembed.com/embed?url=https://www.youtube.com/watch?v={0}"},googleIMA:{sdk:"https://imasdk.googleapis.com/js/sdkloader/ima3.js"}},listeners:{seek:null,play:null,pause:null,restart:null,rewind:null,fastForward:null,mute:null,volume:null,captions:null,download:null,fullscreen:null,pip:null,airplay:null,speed:null,quality:null,loop:null,language:null},events:["ended","progress","stalled","playing","waiting","canplay","canplaythrough","loadstart","loadeddata","loadedmetadata","timeupdate","volumechange","play","pause","error","seeking","seeked","emptied","ratechange","cuechange","download","enterfullscreen","exitfullscreen","captionsenabled","captionsdisabled","languagechange","controlshidden","controlsshown","ready","statechange","qualitychange","adsloaded","adscontentpause","adscontentresume","adstarted","adsmidpoint","adscomplete","adsallcomplete","adsimpression","adsclick"],selectors:{editable:"input, textarea, select, [contenteditable]",container:".plyr",controls:{container:null,wrapper:".plyr__controls"},labels:"[data-plyr]",buttons:{play:'[data-plyr="play"]',pause:'[data-plyr="pause"]',restart:'[data-plyr="restart"]',rewind:'[data-plyr="rewind"]',fastForward:'[data-plyr="fast-forward"]',mute:'[data-plyr="mute"]',captions:'[data-plyr="captions"]',download:'[data-plyr="download"]',fullscreen:'[data-plyr="fullscreen"]',pip:'[data-plyr="pip"]',airplay:'[data-plyr="airplay"]',settings:'[data-plyr="settings"]',loop:'[data-plyr="loop"]'},inputs:{seek:'[data-plyr="seek"]',volume:'[data-plyr="volume"]',speed:'[data-plyr="speed"]',language:'[data-plyr="language"]',quality:'[data-plyr="quality"]'},display:{currentTime:".plyr__time--current",duration:".plyr__time--duration",buffer:".plyr__progress__buffer",loop:".plyr__progress__loop",volume:".plyr__volume--display"},progress:".plyr__progress",captions:".plyr__captions",caption:".plyr__caption"},classNames:{type:"plyr--{0}",provider:"plyr--{0}",video:"plyr__video-wrapper",embed:"plyr__video-embed",videoFixedRatio:"plyr__video-wrapper--fixed-ratio",embedContainer:"plyr__video-embed__container",poster:"plyr__poster",posterEnabled:"plyr__poster-enabled",ads:"plyr__ads",control:"plyr__control",controlPressed:"plyr__control--pressed",playing:"plyr--playing",paused:"plyr--paused",stopped:"plyr--stopped",loading:"plyr--loading",hover:"plyr--hover",tooltip:"plyr__tooltip",cues:"plyr__cues",hidden:"plyr__sr-only",hideControls:"plyr--hide-controls",isIos:"plyr--is-ios",isTouch:"plyr--is-touch",uiSupported:"plyr--full-ui",noTransition:"plyr--no-transition",display:{time:"plyr__time"},menu:{value:"plyr__menu__value",badge:"plyr__badge",open:"plyr--menu-open"},captions:{enabled:"plyr--captions-enabled",active:"plyr--captions-active"},fullscreen:{enabled:"plyr--fullscreen-enabled",fallback:"plyr--fullscreen-fallback"},pip:{supported:"plyr--pip-supported",active:"plyr--pip-active"},airplay:{supported:"plyr--airplay-supported",active:"plyr--airplay-active"},tabFocus:"plyr__tab-focus",previewThumbnails:{thumbContainer:"plyr__preview-thumb",thumbContainerShown:"plyr__preview-thumb--is-shown",imageContainer:"plyr__preview-thumb__image-container",timeContainer:"plyr__preview-thumb__time-container",scrubbingContainer:"plyr__preview-scrubbing",scrubbingContainerShown:"plyr__preview-scrubbing--is-shown"}},attributes:{embed:{provider:"data-plyr-provider",id:"data-plyr-embed-id"}},ads:{enabled:!1,publisherId:"",tagUrl:""},previewThumbnails:{enabled:!1,src:""},vimeo:{byline:!1,portrait:!1,title:!1,speed:!0,transparent:!1,premium:!1,referrerPolicy:null},youtube:{noCookie:!0,rel:0,showinfo:0,iv_load_policy:3,modestbranding:1}},qu="picture-in-picture",Uu="inline",Hu={html5:"html5",youtube:"youtube",vimeo:"vimeo"},Bu="audio",Vu="video";var zu=function(){},Wu=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];Nl(this,e),this.enabled=window.console&&t,this.enabled&&this.log("Debugging enabled")}return jl(e,[{key:"log",get:function(){return this.enabled?Function.prototype.bind.call(console.log,console):zu}},{key:"warn",get:function(){return this.enabled?Function.prototype.bind.call(console.warn,console):zu}},{key:"error",get:function(){return this.enabled?Function.prototype.bind.call(console.error,console):zu}}]),e}(),$u=function(){function e(t){var n=this;Nl(this,e),this.player=t,this.prefix=e.prefix,this.property=e.property,this.scrollPosition={x:0,y:0},this.forceFallback="force"===t.config.fullscreen.fallback,this.player.elements.fullscreen=t.config.fullscreen.container&&function(e,t){return(Element.prototype.closest||function(){var e=this;do{if(Zc.matches(e,t))return e;e=e.parentElement||e.parentNode}while(null!==e&&1===e.nodeType);return null}).call(e,t)}(this.player.elements.container,t.config.fullscreen.container),su.call(this.player,document,"ms"===this.prefix?"MSFullscreenChange":"".concat(this.prefix,"fullscreenchange"),(function(){n.onChange()})),su.call(this.player,this.player.elements.container,"dblclick",(function(e){Ic(n.player.elements.controls)&&n.player.elements.controls.contains(e.target)||n.toggle()})),su.call(this,this.player.elements.container,"keydown",(function(e){return n.trapFocus(e)})),this.update()}return jl(e,[{key:"onChange",value:function(){if(this.enabled){var e=this.player.elements.buttons.fullscreen;Ic(e)&&(e.pressed=this.active);var t=this.target===this.player.media?this.target:this.player.elements.container;uu.call(this.player,t,this.active?"enterfullscreen":"exitfullscreen",!0)}}},{key:"toggleFallback",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(e?this.scrollPosition={x:window.scrollX||0,y:window.scrollY||0}:window.scrollTo(this.scrollPosition.x,this.scrollPosition.y),document.body.style.overflow=e?"hidden":"",Qc(this.target,this.player.config.classNames.fullscreen.fallback,e),qc.isIos){var t=document.head.querySelector('meta[name="viewport"]'),n="viewport-fit=cover";t||(t=document.createElement("meta")).setAttribute("name","viewport");var i=Ac(t.content)&&t.content.includes(n);e?(this.cleanupViewport=!i,i||(t.content+=",".concat(n))):this.cleanupViewport&&(t.content=t.content.split(",").filter((function(e){return e.trim()!==n})).join(","))}this.onChange()}},{key:"trapFocus",value:function(e){if(!qc.isIos&&this.active&&"Tab"===e.key&&9===e.keyCode){var t=document.activeElement,n=eu.call(this.player,"a[href], button:not(:disabled), input:not(:disabled), [tabindex]"),i=ql(n,1)[0],r=n[n.length-1];t!==r||e.shiftKey?t===i&&e.shiftKey&&(r.focus(),e.preventDefault()):(i.focus(),e.preventDefault())}}},{key:"update",value:function(){var t;this.enabled?(t=this.forceFallback?"Fallback (forced)":e.native?"Native":"Fallback",this.player.debug.log("".concat(t," fullscreen enabled"))):this.player.debug.log("Fullscreen not supported and fallback disabled"),Qc(this.player.elements.container,this.player.config.classNames.fullscreen.enabled,this.enabled)}},{key:"enter",value:function(){this.enabled&&(qc.isIos&&this.player.config.fullscreen.iosNative?this.target.webkitEnterFullscreen():!e.native||this.forceFallback?this.toggleFallback(!0):this.prefix?_c(this.prefix)||this.target["".concat(this.prefix,"Request").concat(this.property)]():this.target.requestFullscreen({navigationUI:"hide"}))}},{key:"exit",value:function(){if(this.enabled)if(qc.isIos&&this.player.config.fullscreen.iosNative)this.target.webkitExitFullscreen(),fu(this.player.play());else if(!e.native||this.forceFallback)this.toggleFallback(!1);else if(this.prefix){if(!_c(this.prefix)){var t="moz"===this.prefix?"Cancel":"Exit";document["".concat(this.prefix).concat(t).concat(this.property)]()}}else(document.cancelFullScreen||document.exitFullscreen).call(document)}},{key:"toggle",value:function(){this.active?this.exit():this.enter()}},{key:"usingNative",get:function(){return e.native&&!this.forceFallback}},{key:"enabled",get:function(){return(e.native||this.player.config.fullscreen.fallback)&&this.player.config.fullscreen.enabled&&this.player.supported.ui&&this.player.isVideo}},{key:"active",get:function(){if(!this.enabled)return!1;if(!e.native||this.forceFallback)return Jc(this.target,this.player.config.classNames.fullscreen.fallback);var t=this.prefix?document["".concat(this.prefix).concat(this.property,"Element")]:document.fullscreenElement;return t&&t.shadowRoot?t===this.target.getRootNode().host:t===this.target}},{key:"target",get:function(){return qc.isIos&&this.player.config.fullscreen.iosNative?this.player.media:this.player.elements.fullscreen||this.player.elements.container}}],[{key:"native",get:function(){return!!(document.fullscreenEnabled||document.webkitFullscreenEnabled||document.mozFullScreenEnabled||document.msFullscreenEnabled)}},{key:"prefix",get:function(){if(Cc(document.exitFullscreen))return"";var e="";return["webkit","moz","ms"].some((function(t){return!(!Cc(document["".concat(t,"ExitFullscreen")])&&!Cc(document["".concat(t,"CancelFullScreen")])||(e=t,0))})),e}},{key:"property",get:function(){return"moz"===this.prefix?"FullScreen":"Fullscreen"}}]),e}();function Ku(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;return new Promise((function(n,i){var r=new Image,a=function(){delete r.onload,delete r.onerror,(r.naturalWidth>=t?n:i)(r)};Object.assign(r,{onload:a,onerror:a,src:e})}))}var Yu={addStyleHook:function(){Qc(this.elements.container,this.config.selectors.container.replace(".",""),!0),Qc(this.elements.container,this.config.classNames.uiSupported,this.supported.ui)},toggleNativeControls:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];e&&this.isHTML5?this.media.setAttribute("controls",""):this.media.removeAttribute("controls")},build:function(){var e=this;if(this.listeners.media(),!this.supported.ui)return this.debug.warn("Basic support only for ".concat(this.provider," ").concat(this.type)),void Yu.toggleNativeControls.call(this,!0);Ic(this.elements.controls)||(ju.inject.call(this),this.listeners.controls()),Yu.toggleNativeControls.call(this),this.isHTML5&&Du.setup.call(this),this.volume=null,this.muted=null,this.loop=null,this.quality=null,this.speed=null,ju.updateVolume.call(this),ju.timeUpdate.call(this),Yu.checkPlaying.call(this),Qc(this.elements.container,this.config.classNames.pip.supported,ru.pip&&this.isHTML5&&this.isVideo),Qc(this.elements.container,this.config.classNames.airplay.supported,ru.airplay&&this.isHTML5),Qc(this.elements.container,this.config.classNames.isIos,qc.isIos),Qc(this.elements.container,this.config.classNames.isTouch,this.touch),this.ready=!0,setTimeout((function(){uu.call(e,e.media,"ready")}),0),Yu.setTitle.call(this),this.poster&&Yu.setPoster.call(this,this.poster,!1).catch((function(){})),this.config.duration&&ju.durationUpdate.call(this)},setTitle:function(){var e=xu("play",this.config);if(Ac(this.config.title)&&!_c(this.config.title)&&(e+=", ".concat(this.config.title)),Array.from(this.elements.buttons.play||[]).forEach((function(t){t.setAttribute("aria-label",e)})),this.isEmbed){var t=tu.call(this,"iframe");if(!Ic(t))return;var n=_c(this.config.title)?"video":this.config.title,i=xu("frameTitle",this.config);t.setAttribute("title",i.replace("{title}",n))}},togglePoster:function(e){Qc(this.elements.container,this.config.classNames.posterEnabled,e)},setPoster:function(e){var t=this,n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return n&&this.poster?Promise.reject(new Error("Poster already set")):(this.media.setAttribute("data-poster",e),du.call(this).then((function(){return Ku(e)})).catch((function(n){throw e===t.poster&&Yu.togglePoster.call(t,!1),n})).then((function(){if(e!==t.poster)throw new Error("setPoster cancelled by later call to setPoster")})).then((function(){return Object.assign(t.elements.poster.style,{backgroundImage:"url('".concat(e,"')"),backgroundSize:""}),Yu.togglePoster.call(t,!0),e})))},checkPlaying:function(e){var t=this;Qc(this.elements.container,this.config.classNames.playing,this.playing),Qc(this.elements.container,this.config.classNames.paused,this.paused),Qc(this.elements.container,this.config.classNames.stopped,this.stopped),Array.from(this.elements.buttons.play||[]).forEach((function(e){Object.assign(e,{pressed:t.playing}),e.setAttribute("aria-label",xu(t.playing?"pause":"play",t.config))})),Lc(e)&&"timeupdate"===e.type||Yu.toggleControls.call(this)},checkLoading:function(e){var t=this;this.loading=["stalled","waiting"].includes(e.type),clearTimeout(this.timers.loading),this.timers.loading=setTimeout((function(){Qc(t.elements.container,t.config.classNames.loading,t.loading),Yu.toggleControls.call(t)}),this.loading?250:0)},toggleControls:function(e){var t=this.elements.controls;if(t&&this.config.hideControls){var n=this.touch&&this.lastSeekTime+2e3>Date.now();this.toggleControls(Boolean(e||this.loading||this.paused||t.pressed||t.hover||n))}},migrateStyles:function(){var e=this;Object.values(Dl({},this.media.style)).filter((function(e){return!_c(e)&&Ac(e)&&e.startsWith("--plyr")})).forEach((function(t){e.elements.container.style.setProperty(t,e.media.style.getPropertyValue(t)),e.media.style.removeProperty(t)})),_c(this.media.style)&&this.media.removeAttribute("style")}},Gu=function(){function e(t){Nl(this,e),this.player=t,this.lastKey=null,this.focusTimer=null,this.lastKeyDown=null,this.handleKey=this.handleKey.bind(this),this.toggleMenu=this.toggleMenu.bind(this),this.setTabFocus=this.setTabFocus.bind(this),this.firstTouch=this.firstTouch.bind(this)}return jl(e,[{key:"handleKey",value:function(e){var t=this.player,n=t.elements,i=e.keyCode?e.keyCode:e.which,r="keydown"===e.type,a=r&&i===this.lastKey;if(!(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)&&Ec(i))if(r){var o=document.activeElement;if(Ic(o)){var s=t.config.selectors.editable;if(o!==n.inputs.seek&&Zc(o,s))return;if(32===e.which&&Zc(o,'button, [role^="menuitem"]'))return}switch([32,37,38,39,40,48,49,50,51,52,53,54,56,57,67,70,73,75,76,77,79].includes(i)&&(e.preventDefault(),e.stopPropagation()),i){case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:a||(t.currentTime=t.duration/10*(i-48));break;case 32:case 75:a||fu(t.togglePlay());break;case 38:t.increaseVolume(.1);break;case 40:t.decreaseVolume(.1);break;case 77:a||(t.muted=!t.muted);break;case 39:t.forward();break;case 37:t.rewind();break;case 70:t.fullscreen.toggle();break;case 67:a||t.toggleCaptions();break;case 76:t.loop=!t.loop}27===i&&!t.fullscreen.usingNative&&t.fullscreen.active&&t.fullscreen.toggle(),this.lastKey=i}else this.lastKey=null}},{key:"toggleMenu",value:function(e){ju.toggleMenu.call(this.player,e)}},{key:"firstTouch",value:function(){var e=this.player,t=e.elements;e.touch=!0,Qc(t.container,e.config.classNames.isTouch,!0)}},{key:"setTabFocus",value:function(e){var t=this.player,n=t.elements;if(clearTimeout(this.focusTimer),"keydown"!==e.type||9===e.which){"keydown"===e.type&&(this.lastKeyDown=e.timeStamp);var i,r=e.timeStamp-this.lastKeyDown<=20;("focus"!==e.type||r)&&(i=t.config.classNames.tabFocus,Qc(eu.call(t,".".concat(i)),i,!1),"focusout"!==e.type&&(this.focusTimer=setTimeout((function(){var e=document.activeElement;n.container.contains(e)&&Qc(document.activeElement,t.config.classNames.tabFocus,!0)}),10)))}}},{key:"global",value:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],t=this.player;t.config.keyboard.global&&ou.call(t,window,"keydown keyup",this.handleKey,e,!1),ou.call(t,document.body,"click",this.toggleMenu,e),cu.call(t,document.body,"touchstart",this.firstTouch),ou.call(t,document.body,"keydown focus blur focusout",this.setTabFocus,e,!1,!0)}},{key:"container",value:function(){var e=this.player,t=e.config,n=e.elements,i=e.timers;!t.keyboard.global&&t.keyboard.focused&&su.call(e,n.container,"keydown keyup",this.handleKey,!1),su.call(e,n.container,"mousemove mouseleave touchstart touchmove enterfullscreen exitfullscreen",(function(t){var r=n.controls;r&&"enterfullscreen"===t.type&&(r.pressed=!1,r.hover=!1);var a=0;["touchstart","touchmove","mousemove"].includes(t.type)&&(Yu.toggleControls.call(e,!0),a=e.touch?3e3:2e3),clearTimeout(i.controls),i.controls=setTimeout((function(){return Yu.toggleControls.call(e,!1)}),a)}));var r=function(t){if(!t)return vu.call(e);var i=n.container.getBoundingClientRect(),r=i.width,a=i.height;return vu.call(e,"".concat(r,":").concat(a))},a=function(){clearTimeout(i.resized),i.resized=setTimeout(r,50)};su.call(e,n.container,"enterfullscreen exitfullscreen",(function(t){var i=e.fullscreen,o=i.target,s=i.usingNative;if(o===n.container&&(e.isEmbed||!_c(e.config.ratio))){var l="enterfullscreen"===t.type,c=r(l);c.padding,!function(t,n,i){if(e.isVimeo&&!e.config.vimeo.premium){var r=e.elements.wrapper.firstChild,a=ql(t,2)[1],o=ql(gu.call(e),2),s=o[0],l=o[1];r.style.maxWidth=i?"".concat(a/l*s,"px"):null,r.style.margin=i?"0 auto":null}}(c.ratio,0,l),s||(l?su.call(e,window,"resize",a):lu.call(e,window,"resize",a))}}))}},{key:"media",value:function(){var e=this,t=this.player,n=t.elements;if(su.call(t,t.media,"timeupdate seeking seeked",(function(e){return ju.timeUpdate.call(t,e)})),su.call(t,t.media,"durationchange loadeddata loadedmetadata",(function(e){return ju.durationUpdate.call(t,e)})),su.call(t,t.media,"ended",(function(){t.isHTML5&&t.isVideo&&t.config.resetOnEnd&&(t.restart(),t.pause())})),su.call(t,t.media,"progress playing seeking seeked",(function(e){return ju.updateProgress.call(t,e)})),su.call(t,t.media,"volumechange",(function(e){return ju.updateVolume.call(t,e)})),su.call(t,t.media,"playing play pause ended emptied timeupdate",(function(e){return Yu.checkPlaying.call(t,e)})),su.call(t,t.media,"waiting canplay seeked playing",(function(e){return Yu.checkLoading.call(t,e)})),t.supported.ui&&t.config.clickToPlay&&!t.isAudio){var i=tu.call(t,".".concat(t.config.classNames.video));if(!Ic(i))return;su.call(t,n.container,"click",(function(r){([n.container,i].includes(r.target)||i.contains(r.target))&&(t.touch&&t.config.hideControls||(t.ended?(e.proxy(r,t.restart,"restart"),e.proxy(r,(function(){fu(t.play())}),"play")):e.proxy(r,(function(){fu(t.togglePlay())}),"play")))}))}t.supported.ui&&t.config.disableContextMenu&&su.call(t,n.wrapper,"contextmenu",(function(e){e.preventDefault()}),!1),su.call(t,t.media,"volumechange",(function(){t.storage.set({volume:t.volume,muted:t.muted})})),su.call(t,t.media,"ratechange",(function(){ju.updateSetting.call(t,"speed"),t.storage.set({speed:t.speed})})),su.call(t,t.media,"qualitychange",(function(e){ju.updateSetting.call(t,"quality",null,e.detail.quality)})),su.call(t,t.media,"ready qualitychange",(function(){ju.setDownloadUrl.call(t)}));var r=t.config.events.concat(["keyup","keydown"]).join(" ");su.call(t,t.media,r,(function(e){var i=e.detail,r=void 0===i?{}:i;"error"===e.type&&(r=t.media.error),uu.call(t,n.container,e.type,!0,r)}))}},{key:"proxy",value:function(e,t,n){var i=this.player,r=i.config.listeners[n],a=!0;Cc(r)&&(a=r.call(i,e)),!1!==a&&Cc(t)&&t.call(i,e)}},{key:"bind",value:function(e,t,n,i){var r=this,a=!(arguments.length>4&&void 0!==arguments[4])||arguments[4],o=this.player,s=o.config.listeners[i],l=Cc(s);su.call(o,e,t,(function(e){return r.proxy(e,n,i)}),a&&!l)}},{key:"controls",value:function(){var e=this,t=this.player,n=t.elements,i=qc.isIE?"change":"input";if(n.buttons.play&&Array.from(n.buttons.play).forEach((function(n){e.bind(n,"click",(function(){fu(t.togglePlay())}),"play")})),this.bind(n.buttons.restart,"click",t.restart,"restart"),this.bind(n.buttons.rewind,"click",t.rewind,"rewind"),this.bind(n.buttons.fastForward,"click",t.forward,"fastForward"),this.bind(n.buttons.mute,"click",(function(){t.muted=!t.muted}),"mute"),this.bind(n.buttons.captions,"click",(function(){return t.toggleCaptions()})),this.bind(n.buttons.download,"click",(function(){uu.call(t,t.media,"download")}),"download"),this.bind(n.buttons.fullscreen,"click",(function(){t.fullscreen.toggle()}),"fullscreen"),this.bind(n.buttons.pip,"click",(function(){t.pip="toggle"}),"pip"),this.bind(n.buttons.airplay,"click",t.airplay,"airplay"),this.bind(n.buttons.settings,"click",(function(e){e.stopPropagation(),e.preventDefault(),ju.toggleMenu.call(t,e)}),null,!1),this.bind(n.buttons.settings,"keyup",(function(e){var n=e.which;[13,32].includes(n)&&(13!==n?(e.preventDefault(),e.stopPropagation(),ju.toggleMenu.call(t,e)):ju.focusFirstMenuItem.call(t,null,!0))}),null,!1),this.bind(n.settings.menu,"keydown",(function(e){27===e.which&&ju.toggleMenu.call(t,e)})),this.bind(n.inputs.seek,"mousedown mousemove",(function(e){var t=n.progress.getBoundingClientRect(),i=100/t.width*(e.pageX-t.left);e.currentTarget.setAttribute("seek-value",i)})),this.bind(n.inputs.seek,"mousedown mouseup keydown keyup touchstart touchend",(function(e){var n=e.currentTarget,i=e.keyCode?e.keyCode:e.which,r="play-on-seeked";if(!Nc(e)||39===i||37===i){t.lastSeekTime=Date.now();var a=n.hasAttribute(r),o=["mouseup","touchend","keyup"].includes(e.type);a&&o?(n.removeAttribute(r),fu(t.play())):!o&&t.playing&&(n.setAttribute(r,""),t.pause())}})),qc.isIos){var r=eu.call(t,'input[type="range"]');Array.from(r).forEach((function(t){return e.bind(t,i,(function(e){return Fc(e.target)}))}))}this.bind(n.inputs.seek,i,(function(e){var n=e.currentTarget,i=n.getAttribute("seek-value");_c(i)&&(i=n.value),n.removeAttribute("seek-value"),t.currentTime=i/n.max*t.duration}),"seek"),this.bind(n.progress,"mouseenter mouseleave mousemove",(function(e){return ju.updateSeekTooltip.call(t,e)})),this.bind(n.progress,"mousemove touchmove",(function(e){var n=t.previewThumbnails;n&&n.loaded&&n.startMove(e)})),this.bind(n.progress,"mouseleave touchend click",(function(){var e=t.previewThumbnails;e&&e.loaded&&e.endMove(!1,!0)})),this.bind(n.progress,"mousedown touchstart",(function(e){var n=t.previewThumbnails;n&&n.loaded&&n.startScrubbing(e)})),this.bind(n.progress,"mouseup touchend",(function(e){var n=t.previewThumbnails;n&&n.loaded&&n.endScrubbing(e)})),qc.isWebkit&&Array.from(eu.call(t,'input[type="range"]')).forEach((function(n){e.bind(n,"input",(function(e){return ju.updateRangeFill.call(t,e.target)}))})),t.config.toggleInvert&&!Ic(n.display.duration)&&this.bind(n.display.currentTime,"click",(function(){0!==t.currentTime&&(t.config.invertTime=!t.config.invertTime,ju.timeUpdate.call(t))})),this.bind(n.inputs.volume,i,(function(e){t.volume=e.target.value}),"volume"),this.bind(n.controls,"mouseenter mouseleave",(function(e){n.controls.hover=!t.touch&&"mouseenter"===e.type})),n.fullscreen&&Array.from(n.fullscreen.children).filter((function(e){return!e.contains(n.container)})).forEach((function(i){e.bind(i,"mouseenter mouseleave",(function(e){n.controls.hover=!t.touch&&"mouseenter"===e.type}))})),this.bind(n.controls,"mousedown mouseup touchstart touchend touchcancel",(function(e){n.controls.pressed=["mousedown","touchstart"].includes(e.type)})),this.bind(n.controls,"focusin",(function(){var i=t.config,r=t.timers;Qc(n.controls,i.classNames.noTransition,!0),Yu.toggleControls.call(t,!0),setTimeout((function(){Qc(n.controls,i.classNames.noTransition,!1)}),0);var a=e.touch?3e3:4e3;clearTimeout(r.controls),r.controls=setTimeout((function(){return Yu.toggleControls.call(t,!1)}),a)})),this.bind(n.inputs.volume,"wheel",(function(e){var n=e.webkitDirectionInvertedFromDevice,i=ql([e.deltaX,-e.deltaY].map((function(e){return n?-e:e})),2),r=i[0],a=i[1],o=Math.sign(Math.abs(r)>Math.abs(a)?r:a);t.increaseVolume(o/50);var s=t.media.volume;(1===o&&s<1||-1===o&&s>0)&&e.preventDefault()}),"volume",!1)}}]),e}();var Xu=function(e,t){return e(t={exports:{}},t.exports),t.exports}((function(e,t){e.exports=function(){var e=function(){},t={},n={},i={};function r(e,t){if(e){var r=i[e];if(n[e]=t,r)for(;r.length;)r[0](e,t),r.splice(0,1)}}function a(t,n){t.call&&(t={success:t}),n.length?(t.error||e)(n):(t.success||e)(t)}function o(t,n,i,r){var a,s,l=document,c=i.async,u=(i.numRetries||0)+1,h=i.before||e,d=t.replace(/[\?|#].*$/,""),f=t.replace(/^(css|img)!/,"");r=r||0,/(^css!|\.css$)/.test(d)?((s=l.createElement("link")).rel="stylesheet",s.href=f,(a="hideFocus"in s)&&s.relList&&(a=0,s.rel="preload",s.as="style")):/(^img!|\.(png|gif|jpg|svg|webp)$)/.test(d)?(s=l.createElement("img")).src=f:((s=l.createElement("script")).src=t,s.async=void 0===c||c),s.onload=s.onerror=s.onbeforeload=function(e){var l=e.type[0];if(a)try{s.sheet.cssText.length||(l="e")}catch(e){18!=e.code&&(l="e")}if("e"==l){if((r+=1)<u)return o(t,n,i,r)}else if("preload"==s.rel&&"style"==s.as)return s.rel="stylesheet";n(t,l,e.defaultPrevented)},!1!==h(t,s)&&l.head.appendChild(s)}function s(e,t,n){var i,r,a=(e=e.push?e:[e]).length,s=a,l=[];for(i=function(e,n,i){if("e"==n&&l.push(e),"b"==n){if(!i)return;l.push(e)}--a||t(l)},r=0;r<s;r++)o(e[r],i,n)}function l(e,n,i){var o,l;if(n&&n.trim&&(o=n),l=(o?i:n)||{},o){if(o in t)throw"LoadJS";t[o]=!0}function c(t,n){s(e,(function(e){a(l,e),t&&a({success:t,error:n},e),r(o,e)}),l)}if(l.returnPromise)return new Promise(c);c()}return l.ready=function(e,t){return function(e,t){e=e.push?e:[e];var r,a,o,s=[],l=e.length,c=l;for(r=function(e,n){n.length&&s.push(e),--c||t(s)};l--;)a=e[l],(o=n[a])?r(a,o):(i[a]=i[a]||[]).push(r)}(e,(function(e){a(t,e)})),l},l.done=function(e){r(e,[])},l.reset=function(){t={},n={},i={}},l.isDefined=function(e){return e in t},l}()}));function Qu(e){return new Promise((function(t,n){Xu(e,{success:t,error:n})}))}function Ju(e){e&&!this.embed.hasPlayed&&(this.embed.hasPlayed=!0),this.media.paused===e&&(this.media.paused=!e,uu.call(this,this.media,e?"play":"pause"))}var Zu={setup:function(){var e=this;Qc(e.elements.wrapper,e.config.classNames.embed,!0),e.options.speed=e.config.speed.options,vu.call(e),Sc(window.Vimeo)?Zu.ready.call(e):Qu(e.config.urls.vimeo.sdk).then((function(){Zu.ready.call(e)})).catch((function(t){e.debug.warn("Vimeo SDK (player.js) failed to load",t)}))},ready:function(){var e=this,t=this,n=t.config.vimeo,i=n.premium,r=n.referrerPolicy,a=Fl(n,["premium","referrerPolicy"]);i&&Object.assign(a,{controls:!1,sidedock:!1});var o=_u(Dl({loop:t.config.loop.active,autoplay:t.autoplay,muted:t.muted,gesture:"media",playsinline:!this.config.fullscreen.iosNative},a)),s=t.media.getAttribute("src");_c(s)&&(s=t.media.getAttribute(t.config.attributes.embed.id));var l=function(e){return _c(e)?null:Ec(Number(e))?e:e.match(/^.*(vimeo.com\/|video\/)(\d+).*/)?RegExp.$2:e}(s),c=zc("iframe"),u=wu(t.config.urls.vimeo.iframe,l,o);c.setAttribute("src",u),c.setAttribute("allowfullscreen",""),c.setAttribute("allow","autoplay,fullscreen,picture-in-picture"),_c(r)||c.setAttribute("referrerPolicy",r);var h=t.poster;if(i)c.setAttribute("data-poster",h),t.media=Yc(c,t.media);else{var d=zc("div",{class:t.config.classNames.embedContainer,"data-poster":h});d.appendChild(c),t.media=Yc(d,t.media)}Pu(wu(t.config.urls.vimeo.api,l),"json").then((function(e){if(!_c(e)){var n=new URL(e[0].thumbnail_large);n.pathname="".concat(n.pathname.split("_")[0],".jpg"),Yu.setPoster.call(t,n.href).catch((function(){}))}})),t.embed=new window.Vimeo.Player(c,{autopause:t.config.autopause,muted:t.muted}),t.media.paused=!0,t.media.currentTime=0,t.supported.ui&&t.embed.disableTextTrack(),t.media.play=function(){return Ju.call(t,!0),t.embed.play()},t.media.pause=function(){return Ju.call(t,!1),t.embed.pause()},t.media.stop=function(){t.pause(),t.currentTime=0};var f=t.media.currentTime;Object.defineProperty(t.media,"currentTime",{get:function(){return f},set:function(e){var n=t.embed,i=t.media,r=t.paused,a=t.volume,o=r&&!n.hasPlayed;i.seeking=!0,uu.call(t,i,"seeking"),Promise.resolve(o&&n.setVolume(0)).then((function(){return n.setCurrentTime(e)})).then((function(){return o&&n.pause()})).then((function(){return o&&n.setVolume(a)})).catch((function(){}))}});var p=t.config.speed.selected;Object.defineProperty(t.media,"playbackRate",{get:function(){return p},set:function(e){t.embed.setPlaybackRate(e).then((function(){p=e,uu.call(t,t.media,"ratechange")})).catch((function(){t.options.speed=[1]}))}});var m=t.config.volume;Object.defineProperty(t.media,"volume",{get:function(){return m},set:function(e){t.embed.setVolume(e).then((function(){m=e,uu.call(t,t.media,"volumechange")}))}});var g=t.config.muted;Object.defineProperty(t.media,"muted",{get:function(){return g},set:function(e){var n=!!xc(e)&&e;t.embed.setVolume(n?0:t.config.volume).then((function(){g=n,uu.call(t,t.media,"volumechange")}))}});var v,y=t.config.loop;Object.defineProperty(t.media,"loop",{get:function(){return y},set:function(e){var n=xc(e)?e:t.config.loop.active;t.embed.setLoop(n).then((function(){y=n}))}}),t.embed.getVideoUrl().then((function(e){v=e,ju.setDownloadUrl.call(t)})).catch((function(t){e.debug.warn(t)})),Object.defineProperty(t.media,"currentSrc",{get:function(){return v}}),Object.defineProperty(t.media,"ended",{get:function(){return t.currentTime===t.duration}}),Promise.all([t.embed.getVideoWidth(),t.embed.getVideoHeight()]).then((function(n){var i=ql(n,2),r=i[0],a=i[1];t.embed.ratio=[r,a],vu.call(e)})),t.embed.setAutopause(t.config.autopause).then((function(e){t.config.autopause=e})),t.embed.getVideoTitle().then((function(n){t.config.title=n,Yu.setTitle.call(e)})),t.embed.getCurrentTime().then((function(e){f=e,uu.call(t,t.media,"timeupdate")})),t.embed.getDuration().then((function(e){t.media.duration=e,uu.call(t,t.media,"durationchange")})),t.embed.getTextTracks().then((function(e){t.media.textTracks=e,Du.setup.call(t)})),t.embed.on("cuechange",(function(e){var n=e.cues,i=(void 0===n?[]:n).map((function(e){return function(e){var t=document.createDocumentFragment(),n=document.createElement("div");return t.appendChild(n),n.innerHTML=e,t.firstChild.innerText}(e.text)}));Du.updateCues.call(t,i)})),t.embed.on("loaded",(function(){t.embed.getPaused().then((function(e){Ju.call(t,!e),e||uu.call(t,t.media,"playing")})),Ic(t.embed.element)&&t.supported.ui&&t.embed.element.setAttribute("tabindex",-1)})),t.embed.on("bufferstart",(function(){uu.call(t,t.media,"waiting")})),t.embed.on("bufferend",(function(){uu.call(t,t.media,"playing")})),t.embed.on("play",(function(){Ju.call(t,!0),uu.call(t,t.media,"playing")})),t.embed.on("pause",(function(){Ju.call(t,!1)})),t.embed.on("timeupdate",(function(e){t.media.seeking=!1,f=e.seconds,uu.call(t,t.media,"timeupdate")})),t.embed.on("progress",(function(e){t.media.buffered=e.percent,uu.call(t,t.media,"progress"),1===parseInt(e.percent,10)&&uu.call(t,t.media,"canplaythrough"),t.embed.getDuration().then((function(e){e!==t.media.duration&&(t.media.duration=e,uu.call(t,t.media,"durationchange"))}))})),t.embed.on("seeked",(function(){t.media.seeking=!1,uu.call(t,t.media,"seeked")})),t.embed.on("ended",(function(){t.media.paused=!0,uu.call(t,t.media,"ended")})),t.embed.on("error",(function(e){t.media.error=e,uu.call(t,t.media,"error")})),setTimeout((function(){return Yu.build.call(t)}),0)}};function eh(e){e&&!this.embed.hasPlayed&&(this.embed.hasPlayed=!0),this.media.paused===e&&(this.media.paused=!e,uu.call(this,this.media,e?"play":"pause"))}function th(e){return e.noCookie?"https://www.youtube-nocookie.com":"http:"===window.location.protocol?"http://www.youtube.com":void 0}var nh={setup:function(){var e=this;if(Qc(this.elements.wrapper,this.config.classNames.embed,!0),Sc(window.YT)&&Cc(window.YT.Player))nh.ready.call(this);else{var t=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){Cc(t)&&t(),nh.ready.call(e)},Qu(this.config.urls.youtube.sdk).catch((function(t){e.debug.warn("YouTube API failed to load",t)}))}},getTitle:function(e){var t=this;Pu(wu(this.config.urls.youtube.api,e)).then((function(e){if(Sc(e)){var n=e.title,i=e.height,r=e.width;t.config.title=n,Yu.setTitle.call(t),t.embed.ratio=[r,i]}vu.call(t)})).catch((function(){vu.call(t)}))},ready:function(){var e=this,t=e.media&&e.media.getAttribute("id");if(_c(t)||!t.startsWith("youtube-")){var n=e.media.getAttribute("src");_c(n)&&(n=e.media.getAttribute(this.config.attributes.embed.id));var i=function(e){return _c(e)?null:e.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?RegExp.$2:e}(n),r=function(e){return"".concat(e,"-").concat(Math.floor(1e4*Math.random()))}(e.provider),a=zc("div",{id:r,"data-poster":e.poster});e.media=Yc(a,e.media);var o=function(e){return"https://i.ytimg.com/vi/".concat(i,"/").concat(e,"default.jpg")};Ku(o("maxres"),121).catch((function(){return Ku(o("sd"),121)})).catch((function(){return Ku(o("hq"))})).then((function(t){return Yu.setPoster.call(e,t.src)})).then((function(t){t.includes("maxres")||(e.elements.poster.style.backgroundSize="cover")})).catch((function(){}));var s=e.config.youtube;e.embed=new window.YT.Player(r,{videoId:i,host:th(s),playerVars:Hc({},{autoplay:e.config.autoplay?1:0,hl:e.config.hl,controls:e.supported.ui?0:1,disablekb:1,playsinline:e.config.fullscreen.iosNative?0:1,cc_load_policy:e.captions.active?1:0,cc_lang_pref:e.config.captions.language,widget_referrer:window?window.location.href:null},s),events:{onError:function(t){if(!e.media.error){var n=t.data,i={2:"The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.",5:"The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.",100:"The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.",101:"The owner of the requested video does not allow it to be played in embedded players.",150:"The owner of the requested video does not allow it to be played in embedded players."}[n]||"An unknown error occured";e.media.error={code:n,message:i},uu.call(e,e.media,"error")}},onPlaybackRateChange:function(t){var n=t.target;e.media.playbackRate=n.getPlaybackRate(),uu.call(e,e.media,"ratechange")},onReady:function(t){if(!Cc(e.media.play)){var n=t.target;nh.getTitle.call(e,i),e.media.play=function(){eh.call(e,!0),n.playVideo()},e.media.pause=function(){eh.call(e,!1),n.pauseVideo()},e.media.stop=function(){n.stopVideo()},e.media.duration=n.getDuration(),e.media.paused=!0,e.media.currentTime=0,Object.defineProperty(e.media,"currentTime",{get:function(){return Number(n.getCurrentTime())},set:function(t){e.paused&&!e.embed.hasPlayed&&e.embed.mute(),e.media.seeking=!0,uu.call(e,e.media,"seeking"),n.seekTo(t)}}),Object.defineProperty(e.media,"playbackRate",{get:function(){return n.getPlaybackRate()},set:function(e){n.setPlaybackRate(e)}});var r=e.config.volume;Object.defineProperty(e.media,"volume",{get:function(){return r},set:function(t){r=t,n.setVolume(100*r),uu.call(e,e.media,"volumechange")}});var a=e.config.muted;Object.defineProperty(e.media,"muted",{get:function(){return a},set:function(t){var i=xc(t)?t:a;a=i,n[i?"mute":"unMute"](),uu.call(e,e.media,"volumechange")}}),Object.defineProperty(e.media,"currentSrc",{get:function(){return n.getVideoUrl()}}),Object.defineProperty(e.media,"ended",{get:function(){return e.currentTime===e.duration}});var o=n.getAvailablePlaybackRates();e.options.speed=o.filter((function(t){return e.config.speed.options.includes(t)})),e.supported.ui&&e.media.setAttribute("tabindex",-1),uu.call(e,e.media,"timeupdate"),uu.call(e,e.media,"durationchange"),clearInterval(e.timers.buffering),e.timers.buffering=setInterval((function(){e.media.buffered=n.getVideoLoadedFraction(),(null===e.media.lastBuffered||e.media.lastBuffered<e.media.buffered)&&uu.call(e,e.media,"progress"),e.media.lastBuffered=e.media.buffered,1===e.media.buffered&&(clearInterval(e.timers.buffering),uu.call(e,e.media,"canplaythrough"))}),200),setTimeout((function(){return Yu.build.call(e)}),50)}},onStateChange:function(t){var n=t.target;switch(clearInterval(e.timers.playing),e.media.seeking&&[1,2].includes(t.data)&&(e.media.seeking=!1,uu.call(e,e.media,"seeked")),t.data){case-1:uu.call(e,e.media,"timeupdate"),e.media.buffered=n.getVideoLoadedFraction(),uu.call(e,e.media,"progress");break;case 0:eh.call(e,!1),e.media.loop?(n.stopVideo(),n.playVideo()):uu.call(e,e.media,"ended");break;case 1:e.config.autoplay||!e.media.paused||e.embed.hasPlayed?(eh.call(e,!0),uu.call(e,e.media,"playing"),e.timers.playing=setInterval((function(){uu.call(e,e.media,"timeupdate")}),50),e.media.duration!==n.getDuration()&&(e.media.duration=n.getDuration(),uu.call(e,e.media,"durationchange"))):e.media.pause();break;case 2:e.muted||e.embed.unMute(),eh.call(e,!1);break;case 3:uu.call(e,e.media,"waiting")}uu.call(e,e.elements.container,"statechange",!1,{code:t.data})}}})}}},ih={setup:function(){this.media?(Qc(this.elements.container,this.config.classNames.type.replace("{0}",this.type),!0),Qc(this.elements.container,this.config.classNames.provider.replace("{0}",this.provider),!0),this.isEmbed&&Qc(this.elements.container,this.config.classNames.type.replace("{0}","video"),!0),this.isVideo&&(this.elements.wrapper=zc("div",{class:this.config.classNames.video}),Bc(this.media,this.elements.wrapper),this.elements.poster=zc("div",{class:this.config.classNames.poster}),this.elements.wrapper.appendChild(this.elements.poster)),this.isHTML5?yu.setup.call(this):this.isYouTube?nh.setup.call(this):this.isVimeo&&Zu.setup.call(this)):this.debug.warn("No media element found!")}},rh=function(){function e(t){var n=this;Nl(this,e),this.player=t,this.config=t.config.ads,this.playing=!1,this.initialized=!1,this.elements={container:null,displayContainer:null},this.manager=null,this.loader=null,this.cuePoints=null,this.events={},this.safetyTimer=null,this.countdownTimer=null,this.managerPromise=new Promise((function(e,t){n.on("loaded",e),n.on("error",t)})),this.load()}return jl(e,[{key:"load",value:function(){var e=this;this.enabled&&(Sc(window.google)&&Sc(window.google.ima)?this.ready():Qu(this.player.config.urls.googleIMA.sdk).then((function(){e.ready()})).catch((function(){e.trigger("error",new Error("Google IMA SDK failed to load"))})))}},{key:"ready",value:function(){var e=this;this.enabled||function(e){e.manager&&e.manager.destroy(),e.elements.displayContainer&&e.elements.displayContainer.destroy(),e.elements.container.remove()}(this),this.startSafetyTimer(12e3,"ready()"),this.managerPromise.then((function(){e.clearSafetyTimer("onAdsManagerLoaded()")})),this.listeners(),this.setupIMA()}},{key:"setupIMA",value:function(){var e=this;this.elements.container=zc("div",{class:this.player.config.classNames.ads}),this.player.elements.container.appendChild(this.elements.container),google.ima.settings.setVpaidMode(google.ima.ImaSdkSettings.VpaidMode.ENABLED),google.ima.settings.setLocale(this.player.config.ads.language),google.ima.settings.setDisableCustomPlaybackForIOS10Plus(this.player.config.playsinline),this.elements.displayContainer=new google.ima.AdDisplayContainer(this.elements.container,this.player.media),this.loader=new google.ima.AdsLoader(this.elements.displayContainer),this.loader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,(function(t){return e.onAdsManagerLoaded(t)}),!1),this.loader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,(function(t){return e.onAdError(t)}),!1),this.requestAds()}},{key:"requestAds",value:function(){var e=this.player.elements.container;try{var t=new google.ima.AdsRequest;t.adTagUrl=this.tagUrl,t.linearAdSlotWidth=e.offsetWidth,t.linearAdSlotHeight=e.offsetHeight,t.nonLinearAdSlotWidth=e.offsetWidth,t.nonLinearAdSlotHeight=e.offsetHeight,t.forceNonLinearFullSlot=!1,t.setAdWillPlayMuted(!this.player.muted),this.loader.requestAds(t)}catch(e){this.onAdError(e)}}},{key:"pollCountdown",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(!t)return clearInterval(this.countdownTimer),void this.elements.container.removeAttribute("data-badge-text");var n=function(){var t=Mu(Math.max(e.manager.getRemainingTime(),0)),n="".concat(xu("advertisement",e.player.config)," - ").concat(t);e.elements.container.setAttribute("data-badge-text",n)};this.countdownTimer=setInterval(n,100)}},{key:"onAdsManagerLoaded",value:function(e){var t=this;if(this.enabled){var n=new google.ima.AdsRenderingSettings;n.restoreCustomPlaybackStateOnAdBreakComplete=!0,n.enablePreloading=!0,this.manager=e.getAdsManager(this.player,n),this.cuePoints=this.manager.getCuePoints(),this.manager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR,(function(e){return t.onAdError(e)})),Object.keys(google.ima.AdEvent.Type).forEach((function(e){t.manager.addEventListener(google.ima.AdEvent.Type[e],(function(e){return t.onAdEvent(e)}))})),this.trigger("loaded")}}},{key:"addCuePoints",value:function(){var e=this;_c(this.cuePoints)||this.cuePoints.forEach((function(t){if(0!==t&&-1!==t&&t<e.player.duration){var n=e.player.elements.progress;if(Ic(n)){var i=100/e.player.duration*t,r=zc("span",{class:e.player.config.classNames.cues});r.style.left="".concat(i.toString(),"%"),n.appendChild(r)}}}))}},{key:"onAdEvent",value:function(e){var t,n=this.player.elements.container,i=e.getAd(),r=e.getAdData();switch(t=e.type,uu.call(this.player,this.player.media,"ads".concat(t.replace(/_/g,"").toLowerCase())),e.type){case google.ima.AdEvent.Type.LOADED:this.trigger("loaded"),this.pollCountdown(!0),i.isLinear()||(i.width=n.offsetWidth,i.height=n.offsetHeight);break;case google.ima.AdEvent.Type.STARTED:this.manager.setVolume(this.player.volume);break;case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:this.player.ended?this.loadAds():this.loader.contentComplete();break;case google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED:this.pauseContent();break;case google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED:this.pollCountdown(),this.resumeContent();break;case google.ima.AdEvent.Type.LOG:r.adError&&this.player.debug.warn("Non-fatal ad error: ".concat(r.adError.getMessage()))}}},{key:"onAdError",value:function(e){this.cancel(),this.player.debug.warn("Ads error",e)}},{key:"listeners",value:function(){var e,t=this,n=this.player.elements.container;this.player.on("canplay",(function(){t.addCuePoints()})),this.player.on("ended",(function(){t.loader.contentComplete()})),this.player.on("timeupdate",(function(){e=t.player.currentTime})),this.player.on("seeked",(function(){var n=t.player.currentTime;_c(t.cuePoints)||t.cuePoints.forEach((function(i,r){e<i&&i<n&&(t.manager.discardAdBreak(),t.cuePoints.splice(r,1))}))})),window.addEventListener("resize",(function(){t.manager&&t.manager.resize(n.offsetWidth,n.offsetHeight,google.ima.ViewMode.NORMAL)}))}},{key:"play",value:function(){var e=this,t=this.player.elements.container;this.managerPromise||this.resumeContent(),this.managerPromise.then((function(){e.manager.setVolume(e.player.volume),e.elements.displayContainer.initialize();try{e.initialized||(e.manager.init(t.offsetWidth,t.offsetHeight,google.ima.ViewMode.NORMAL),e.manager.start()),e.initialized=!0}catch(t){e.onAdError(t)}})).catch((function(){}))}},{key:"resumeContent",value:function(){this.elements.container.style.zIndex="",this.playing=!1,fu(this.player.media.play())}},{key:"pauseContent",value:function(){this.elements.container.style.zIndex=3,this.playing=!0,this.player.media.pause()}},{key:"cancel",value:function(){this.initialized&&this.resumeContent(),this.trigger("error"),this.loadAds()}},{key:"loadAds",value:function(){var e=this;this.managerPromise.then((function(){e.manager&&e.manager.destroy(),e.managerPromise=new Promise((function(t){e.on("loaded",t),e.player.debug.log(e.manager)})),e.initialized=!1,e.requestAds()})).catch((function(){}))}},{key:"trigger",value:function(e){for(var t=this,n=arguments.length,i=new Array(n>1?n-1:0),r=1;r<n;r++)i[r-1]=arguments[r];var a=this.events[e];Pc(a)&&a.forEach((function(e){Cc(e)&&e.apply(t,i)}))}},{key:"on",value:function(e,t){return Pc(this.events[e])||(this.events[e]=[]),this.events[e].push(t),this}},{key:"startSafetyTimer",value:function(e,t){var n=this;this.player.debug.log("Safety timer invoked from: ".concat(t)),this.safetyTimer=setTimeout((function(){n.cancel(),n.clearSafetyTimer("startSafetyTimer()")}),e)}},{key:"clearSafetyTimer",value:function(e){Tc(this.safetyTimer)||(this.player.debug.log("Safety timer cleared from: ".concat(e)),clearTimeout(this.safetyTimer),this.safetyTimer=null)}},{key:"enabled",get:function(){var e=this.config;return this.player.isHTML5&&this.player.isVideo&&e.enabled&&(!_c(e.publisherId)||Rc(e.tagUrl))}},{key:"tagUrl",get:function(){var e=this.config;if(Rc(e.tagUrl))return e.tagUrl;var t={AV_PUBLISHERID:"58c25bb0073ef448b1087ad6",AV_CHANNELID:"5a0458dc28a06145e4519d21",AV_URL:window.location.hostname,cb:Date.now(),AV_WIDTH:640,AV_HEIGHT:480,AV_CDIM2:e.publisherId};return"".concat("https://go.aniview.com/api/adserver6/vast/","?").concat(_u(t))}}]),e}(),ah=function(e){var t=[];return e.split(/\r\n\r\n|\n\n|\r\r/).forEach((function(e){var n={};e.split(/\r\n|\n|\r/).forEach((function(e){if(Ec(n.startTime)){if(!_c(e.trim())&&_c(n.text)){var t=e.trim().split("#xywh="),i=ql(t,1);if(n.text=i[0],t[1]){var r=ql(t[1].split(","),4);n.x=r[0],n.y=r[1],n.w=r[2],n.h=r[3]}}}else{var a=e.match(/([0-9]{2})?:?([0-9]{2}):([0-9]{2}).([0-9]{2,3})( ?--> ?)([0-9]{2})?:?([0-9]{2}):([0-9]{2}).([0-9]{2,3})/);a&&(n.startTime=60*Number(a[1]||0)*60+60*Number(a[2])+Number(a[3])+Number("0.".concat(a[4])),n.endTime=60*Number(a[6]||0)*60+60*Number(a[7])+Number(a[8])+Number("0.".concat(a[9])))}})),n.text&&t.push(n)})),t},oh=function(e,t){var n={};return e>t.width/t.height?(n.width=t.width,n.height=1/e*t.width):(n.height=t.height,n.width=e*t.height),n},sh=function(){function e(t){Nl(this,e),this.player=t,this.thumbnails=[],this.loaded=!1,this.lastMouseMoveTime=Date.now(),this.mouseDown=!1,this.loadedImages=[],this.elements={thumb:{},scrubbing:{}},this.load()}return jl(e,[{key:"load",value:function(){var e=this;this.player.elements.display.seekTooltip&&(this.player.elements.display.seekTooltip.hidden=this.enabled),this.enabled&&this.getThumbnails().then((function(){e.enabled&&(e.render(),e.determineContainerAutoSizing(),e.loaded=!0)}))}},{key:"getThumbnails",value:function(){var e=this;return new Promise((function(t){var n=e.player.config.previewThumbnails.src;if(_c(n))throw new Error("Missing previewThumbnails.src config attribute");var i=function(){e.thumbnails.sort((function(e,t){return e.height-t.height})),e.player.debug.log("Preview thumbnails",e.thumbnails),t()};if(Cc(n))n((function(t){e.thumbnails=t,i()}));else{var r=(Ac(n)?[n]:n).map((function(t){return e.getThumbnail(t)}));Promise.all(r).then(i)}}))}},{key:"getThumbnail",value:function(e){var t=this;return new Promise((function(n){Pu(e).then((function(i){var r={frames:ah(i),height:null,urlPrefix:""};r.frames[0].text.startsWith("/")||r.frames[0].text.startsWith("http://")||r.frames[0].text.startsWith("https://")||(r.urlPrefix=e.substring(0,e.lastIndexOf("/")+1));var a=new Image;a.onload=function(){r.height=a.naturalHeight,r.width=a.naturalWidth,t.thumbnails.push(r),n()},a.src=r.urlPrefix+r.frames[0].text}))}))}},{key:"startMove",value:function(e){if(this.loaded&&Lc(e)&&["touchmove","mousemove"].includes(e.type)&&this.player.media.duration){if("touchmove"===e.type)this.seekTime=this.player.media.duration*(this.player.elements.inputs.seek.value/100);else{var t=this.player.elements.progress.getBoundingClientRect(),n=100/t.width*(e.pageX-t.left);this.seekTime=this.player.media.duration*(n/100),this.seekTime<0&&(this.seekTime=0),this.seekTime>this.player.media.duration-1&&(this.seekTime=this.player.media.duration-1),this.mousePosX=e.pageX,this.elements.thumb.time.innerText=Mu(this.seekTime)}this.showImageAtCurrentTime()}}},{key:"endMove",value:function(){this.toggleThumbContainer(!1,!0)}},{key:"startScrubbing",value:function(e){(Tc(e.button)||!1===e.button||0===e.button)&&(this.mouseDown=!0,this.player.media.duration&&(this.toggleScrubbingContainer(!0),this.toggleThumbContainer(!1,!0),this.showImageAtCurrentTime()))}},{key:"endScrubbing",value:function(){var e=this;this.mouseDown=!1,Math.ceil(this.lastTime)===Math.ceil(this.player.media.currentTime)?this.toggleScrubbingContainer(!1):cu.call(this.player,this.player.media,"timeupdate",(function(){e.mouseDown||e.toggleScrubbingContainer(!1)}))}},{key:"listeners",value:function(){var e=this;this.player.on("play",(function(){e.toggleThumbContainer(!1,!0)})),this.player.on("seeked",(function(){e.toggleThumbContainer(!1)})),this.player.on("timeupdate",(function(){e.lastTime=e.player.media.currentTime}))}},{key:"render",value:function(){this.elements.thumb.container=zc("div",{class:this.player.config.classNames.previewThumbnails.thumbContainer}),this.elements.thumb.imageContainer=zc("div",{class:this.player.config.classNames.previewThumbnails.imageContainer}),this.elements.thumb.container.appendChild(this.elements.thumb.imageContainer);var e=zc("div",{class:this.player.config.classNames.previewThumbnails.timeContainer});this.elements.thumb.time=zc("span",{},"00:00"),e.appendChild(this.elements.thumb.time),this.elements.thumb.container.appendChild(e),Ic(this.player.elements.progress)&&this.player.elements.progress.appendChild(this.elements.thumb.container),this.elements.scrubbing.container=zc("div",{class:this.player.config.classNames.previewThumbnails.scrubbingContainer}),this.player.elements.wrapper.appendChild(this.elements.scrubbing.container)}},{key:"destroy",value:function(){this.elements.thumb.container&&this.elements.thumb.container.remove(),this.elements.scrubbing.container&&this.elements.scrubbing.container.remove()}},{key:"showImageAtCurrentTime",value:function(){var e=this;this.mouseDown?this.setScrubbingContainerSize():this.setThumbContainerSizeAndPos();var t=this.thumbnails[0].frames.findIndex((function(t){return e.seekTime>=t.startTime&&e.seekTime<=t.endTime})),n=t>=0,i=0;this.mouseDown||this.toggleThumbContainer(n),n&&(this.thumbnails.forEach((function(n,r){e.loadedImages.includes(n.frames[t].text)&&(i=r)})),t!==this.showingThumb&&(this.showingThumb=t,this.loadImage(i)))}},{key:"loadImage",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,n=this.showingThumb,i=this.thumbnails[t],r=i.urlPrefix,a=i.frames[n],o=i.frames[n].text,s=r+o;if(this.currentImageElement&&this.currentImageElement.dataset.filename===o)this.showImage(this.currentImageElement,a,t,n,o,!1),this.currentImageElement.dataset.index=n,this.removeOldImages(this.currentImageElement);else{this.loadingImage&&this.usingSprites&&(this.loadingImage.onload=null);var l=new Image;l.src=s,l.dataset.index=n,l.dataset.filename=o,this.showingThumbFilename=o,this.player.debug.log("Loading image: ".concat(s)),l.onload=function(){return e.showImage(l,a,t,n,o,!0)},this.loadingImage=l,this.removeOldImages(l)}}},{key:"showImage",value:function(e,t,n,i,r){var a=!(arguments.length>5&&void 0!==arguments[5])||arguments[5];this.player.debug.log("Showing thumb: ".concat(r,". num: ").concat(i,". qual: ").concat(n,". newimg: ").concat(a)),this.setImageSizeAndOffset(e,t),a&&(this.currentImageContainer.appendChild(e),this.currentImageElement=e,this.loadedImages.includes(r)||this.loadedImages.push(r)),this.preloadNearby(i,!0).then(this.preloadNearby(i,!1)).then(this.getHigherQuality(n,e,t,r))}},{key:"removeOldImages",value:function(e){var t=this;Array.from(this.currentImageContainer.children).forEach((function(n){if("img"===n.tagName.toLowerCase()){var i=t.usingSprites?500:1e3;if(n.dataset.index!==e.dataset.index&&!n.dataset.deleting){n.dataset.deleting=!0;var r=t.currentImageContainer;setTimeout((function(){r.removeChild(n),t.player.debug.log("Removing thumb: ".concat(n.dataset.filename))}),i)}}}))}},{key:"preloadNearby",value:function(e){var t=this,n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];return new Promise((function(i){setTimeout((function(){var r=t.thumbnails[0].frames[e].text;if(t.showingThumbFilename===r){var a;a=n?t.thumbnails[0].frames.slice(e):t.thumbnails[0].frames.slice(0,e).reverse();var o=!1;a.forEach((function(e){var n=e.text;if(n!==r&&!t.loadedImages.includes(n)){o=!0,t.player.debug.log("Preloading thumb filename: ".concat(n));var a=t.thumbnails[0].urlPrefix+n,s=new Image;s.src=a,s.onload=function(){t.player.debug.log("Preloaded thumb filename: ".concat(n)),t.loadedImages.includes(n)||t.loadedImages.push(n),i()}}})),o||i()}}),300)}))}},{key:"getHigherQuality",value:function(e,t,n,i){var r=this;if(e<this.thumbnails.length-1){var a=t.naturalHeight;this.usingSprites&&(a=n.h),a<this.thumbContainerHeight&&setTimeout((function(){r.showingThumbFilename===i&&(r.player.debug.log("Showing higher quality thumb for: ".concat(i)),r.loadImage(e+1))}),300)}}},{key:"toggleThumbContainer",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=this.player.config.classNames.previewThumbnails.thumbContainerShown;this.elements.thumb.container.classList.toggle(n,e),!e&&t&&(this.showingThumb=null,this.showingThumbFilename=null)}},{key:"toggleScrubbingContainer",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=this.player.config.classNames.previewThumbnails.scrubbingContainerShown;this.elements.scrubbing.container.classList.toggle(t,e),e||(this.showingThumb=null,this.showingThumbFilename=null)}},{key:"determineContainerAutoSizing",value:function(){(this.elements.thumb.imageContainer.clientHeight>20||this.elements.thumb.imageContainer.clientWidth>20)&&(this.sizeSpecifiedInCSS=!0)}},{key:"setThumbContainerSizeAndPos",value:function(){if(this.sizeSpecifiedInCSS){if(this.elements.thumb.imageContainer.clientHeight>20&&this.elements.thumb.imageContainer.clientWidth<20){var e=Math.floor(this.elements.thumb.imageContainer.clientHeight*this.thumbAspectRatio);this.elements.thumb.imageContainer.style.width="".concat(e,"px")}else if(this.elements.thumb.imageContainer.clientHeight<20&&this.elements.thumb.imageContainer.clientWidth>20){var t=Math.floor(this.elements.thumb.imageContainer.clientWidth/this.thumbAspectRatio);this.elements.thumb.imageContainer.style.height="".concat(t,"px")}}else{var n=Math.floor(this.thumbContainerHeight*this.thumbAspectRatio);this.elements.thumb.imageContainer.style.height="".concat(this.thumbContainerHeight,"px"),this.elements.thumb.imageContainer.style.width="".concat(n,"px")}this.setThumbContainerPos()}},{key:"setThumbContainerPos",value:function(){var e=this.player.elements.progress.getBoundingClientRect(),t=this.player.elements.container.getBoundingClientRect(),n=this.elements.thumb.container,i=t.left-e.left+10,r=t.right-e.left-n.clientWidth-10,a=this.mousePosX-e.left-n.clientWidth/2;a<i&&(a=i),a>r&&(a=r),n.style.left="".concat(a,"px")}},{key:"setScrubbingContainerSize",value:function(){var e=oh(this.thumbAspectRatio,{width:this.player.media.clientWidth,height:this.player.media.clientHeight}),t=e.width,n=e.height;this.elements.scrubbing.container.style.width="".concat(t,"px"),this.elements.scrubbing.container.style.height="".concat(n,"px")}},{key:"setImageSizeAndOffset",value:function(e,t){if(this.usingSprites){var n=this.thumbContainerHeight/t.h;e.style.height="".concat(e.naturalHeight*n,"px"),e.style.width="".concat(e.naturalWidth*n,"px"),e.style.left="-".concat(t.x*n,"px"),e.style.top="-".concat(t.y*n,"px")}}},{key:"enabled",get:function(){return this.player.isHTML5&&this.player.isVideo&&this.player.config.previewThumbnails.enabled}},{key:"currentImageContainer",get:function(){return this.mouseDown?this.elements.scrubbing.container:this.elements.thumb.imageContainer}},{key:"usingSprites",get:function(){return Object.keys(this.thumbnails[0].frames[0]).includes("w")}},{key:"thumbAspectRatio",get:function(){return this.usingSprites?this.thumbnails[0].frames[0].w/this.thumbnails[0].frames[0].h:this.thumbnails[0].width/this.thumbnails[0].height}},{key:"thumbContainerHeight",get:function(){return this.mouseDown?oh(this.thumbAspectRatio,{width:this.player.media.clientWidth,height:this.player.media.clientHeight}).height:this.sizeSpecifiedInCSS?this.elements.thumb.imageContainer.clientHeight:Math.floor(this.player.media.clientWidth/this.thumbAspectRatio/4)}},{key:"currentImageElement",get:function(){return this.mouseDown?this.currentScrubbingImageElement:this.currentThumbnailImageElement},set:function(e){this.mouseDown?this.currentScrubbingImageElement=e:this.currentThumbnailImageElement=e}}]),e}(),lh={insertElements:function(e,t){var n=this;Ac(t)?Wc(e,this.media,{src:t}):Pc(t)&&t.forEach((function(t){Wc(e,n.media,t)}))},change:function(e){var t=this;Uc(e,"sources.length")?(yu.cancelRequests.call(this),this.destroy.call(this,(function(){t.options.quality=[],$c(t.media),t.media=null,Ic(t.elements.container)&&t.elements.container.removeAttribute("class");var n=e.sources,i=e.type,r=ql(n,1)[0],a=r.provider,o=void 0===a?Hu.html5:a,s=r.src,l="html5"===o?i:"div",c="html5"===o?{}:{src:s};Object.assign(t,{provider:o,type:i,supported:ru.check(i,o,t.config.playsinline),media:zc(l,c)}),t.elements.container.appendChild(t.media),xc(e.autoplay)&&(t.config.autoplay=e.autoplay),t.isHTML5&&(t.config.crossorigin&&t.media.setAttribute("crossorigin",""),t.config.autoplay&&t.media.setAttribute("autoplay",""),_c(e.poster)||(t.poster=e.poster),t.config.loop.active&&t.media.setAttribute("loop",""),t.config.muted&&t.media.setAttribute("muted",""),t.config.playsinline&&t.media.setAttribute("playsinline","")),Yu.addStyleHook.call(t),t.isHTML5&&lh.insertElements.call(t,"source",n),t.config.title=e.title,ih.setup.call(t),t.isHTML5&&Object.keys(e).includes("tracks")&&lh.insertElements.call(t,"track",e.tracks),(t.isHTML5||t.isEmbed&&!t.supported.ui)&&Yu.build.call(t),t.isHTML5&&t.media.load(),_c(e.previewThumbnails)||(Object.assign(t.config.previewThumbnails,e.previewThumbnails),t.previewThumbnails&&t.previewThumbnails.loaded&&(t.previewThumbnails.destroy(),t.previewThumbnails=null),t.config.previewThumbnails.enabled&&(t.previewThumbnails=new sh(t))),t.fullscreen.update()}),!0)):this.debug.warn("Invalid source format")}};var ch=function(){function e(t,n){var i=this;if(Nl(this,e),this.timers={},this.ready=!1,this.loading=!1,this.failed=!1,this.touch=ru.touch,this.media=t,Ac(this.media)&&(this.media=document.querySelectorAll(this.media)),(window.jQuery&&this.media instanceof jQuery||Oc(this.media)||Pc(this.media))&&(this.media=this.media[0]),this.config=Hc({},Fu,e.defaults,n||{},function(){try{return JSON.parse(i.media.getAttribute("data-plyr-config"))}catch(e){return{}}}()),this.elements={container:null,fullscreen:null,captions:null,buttons:{},display:{},progress:{},inputs:{},settings:{popup:null,menu:null,panels:{},buttons:{}}},this.captions={active:null,currentTrack:-1,meta:new WeakMap},this.fullscreen={active:!1},this.options={speed:[],quality:[]},this.debug=new Wu(this.config.debug),this.debug.log("Config",this.config),this.debug.log("Support",ru),!Tc(this.media)&&Ic(this.media))if(this.media.plyr)this.debug.warn("Target already setup");else if(this.config.enabled)if(ru.check().api){var r=this.media.cloneNode(!0);r.autoplay=!1,this.elements.original=r;var a=this.media.tagName.toLowerCase(),o=null,s=null;switch(a){case"div":if(o=this.media.querySelector("iframe"),Ic(o)){if(s=Ru(o.getAttribute("src")),this.provider=function(e){return/^(https?:\/\/)?(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.?be)\/.+$/.test(e)?Hu.youtube:/^https?:\/\/player.vimeo.com\/video\/\d{0,9}(?=\b|\/)/.test(e)?Hu.vimeo:null}(s.toString()),this.elements.container=this.media,this.media=o,this.elements.container.className="",s.search.length){var l=["1","true"];l.includes(s.searchParams.get("autoplay"))&&(this.config.autoplay=!0),l.includes(s.searchParams.get("loop"))&&(this.config.loop.active=!0),this.isYouTube?(this.config.playsinline=l.includes(s.searchParams.get("playsinline")),this.config.youtube.hl=s.searchParams.get("hl")):this.config.playsinline=!0}}else this.provider=this.media.getAttribute(this.config.attributes.embed.provider),this.media.removeAttribute(this.config.attributes.embed.provider);if(_c(this.provider)||!Object.keys(Hu).includes(this.provider))return void this.debug.error("Setup failed: Invalid provider");this.type=Vu;break;case"video":case"audio":this.type=a,this.provider=Hu.html5,this.media.hasAttribute("crossorigin")&&(this.config.crossorigin=!0),this.media.hasAttribute("autoplay")&&(this.config.autoplay=!0),(this.media.hasAttribute("playsinline")||this.media.hasAttribute("webkit-playsinline"))&&(this.config.playsinline=!0),this.media.hasAttribute("muted")&&(this.config.muted=!0),this.media.hasAttribute("loop")&&(this.config.loop.active=!0);break;default:return void this.debug.error("Setup failed: unsupported type")}this.supported=ru.check(this.type,this.provider,this.config.playsinline),this.supported.api?(this.eventListeners=[],this.listeners=new Gu(this),this.storage=new Cu(this),this.media.plyr=this,Ic(this.elements.container)||(this.elements.container=zc("div",{tabindex:0}),Bc(this.media,this.elements.container)),Yu.migrateStyles.call(this),Yu.addStyleHook.call(this),ih.setup.call(this),this.config.debug&&su.call(this,this.elements.container,this.config.events.join(" "),(function(e){i.debug.log("event: ".concat(e.type))})),this.fullscreen=new $u(this),(this.isHTML5||this.isEmbed&&!this.supported.ui)&&Yu.build.call(this),this.listeners.container(),this.listeners.global(),this.config.ads.enabled&&(this.ads=new rh(this)),this.isHTML5&&this.config.autoplay&&this.once("canplay",(function(){return fu(i.play())})),this.lastSeekTime=0,this.config.previewThumbnails.enabled&&(this.previewThumbnails=new sh(this))):this.debug.error("Setup failed: no support")}else this.debug.error("Setup failed: no support");else this.debug.error("Setup failed: disabled by config");else this.debug.error("Setup failed: no suitable element passed")}return jl(e,[{key:"play",value:function(){var e=this;return Cc(this.media.play)?(this.ads&&this.ads.enabled&&this.ads.managerPromise.then((function(){return e.ads.play()})).catch((function(){return fu(e.media.play())})),this.media.play()):null}},{key:"pause",value:function(){return this.playing&&Cc(this.media.pause)?this.media.pause():null}},{key:"togglePlay",value:function(e){return(xc(e)?e:!this.playing)?this.play():this.pause()}},{key:"stop",value:function(){this.isHTML5?(this.pause(),this.restart()):Cc(this.media.stop)&&this.media.stop()}},{key:"restart",value:function(){this.currentTime=0}},{key:"rewind",value:function(e){this.currentTime-=Ec(e)?e:this.config.seekTime}},{key:"forward",value:function(e){this.currentTime+=Ec(e)?e:this.config.seekTime}},{key:"increaseVolume",value:function(e){var t=this.media.muted?0:this.volume;this.volume=t+(Ec(e)?e:0)}},{key:"decreaseVolume",value:function(e){this.increaseVolume(-e)}},{key:"toggleCaptions",value:function(e){Du.toggle.call(this,e,!1)}},{key:"airplay",value:function(){ru.airplay&&this.media.webkitShowPlaybackTargetPicker()}},{key:"toggleControls",value:function(e){if(this.supported.ui&&!this.isAudio){var t=Jc(this.elements.container,this.config.classNames.hideControls),n=void 0===e?void 0:!e,i=Qc(this.elements.container,this.config.classNames.hideControls,n);if(i&&Pc(this.config.controls)&&this.config.controls.includes("settings")&&!_c(this.config.settings)&&ju.toggleMenu.call(this,!1),i!==t){var r=i?"controlshidden":"controlsshown";uu.call(this,this.media,r)}return!i}return!1}},{key:"on",value:function(e,t){su.call(this,this.elements.container,e,t)}},{key:"once",value:function(e,t){cu.call(this,this.elements.container,e,t)}},{key:"off",value:function(e,t){lu(this.elements.container,e,t)}},{key:"destroy",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];if(this.ready){var i=function(){document.body.style.overflow="",t.embed=null,n?(Object.keys(t.elements).length&&($c(t.elements.buttons.play),$c(t.elements.captions),$c(t.elements.controls),$c(t.elements.wrapper),t.elements.buttons.play=null,t.elements.captions=null,t.elements.controls=null,t.elements.wrapper=null),Cc(e)&&e()):(hu.call(t),yu.cancelRequests.call(t),Yc(t.elements.original,t.elements.container),uu.call(t,t.elements.original,"destroyed",!0),Cc(e)&&e.call(t.elements.original),t.ready=!1,setTimeout((function(){t.elements=null,t.media=null}),200))};this.stop(),clearTimeout(this.timers.loading),clearTimeout(this.timers.controls),clearTimeout(this.timers.resized),this.isHTML5?(Yu.toggleNativeControls.call(this,!0),i()):this.isYouTube?(clearInterval(this.timers.buffering),clearInterval(this.timers.playing),null!==this.embed&&Cc(this.embed.destroy)&&this.embed.destroy(),i()):this.isVimeo&&(null!==this.embed&&this.embed.unload().then(i),setTimeout(i,200))}}},{key:"supports",value:function(e){return ru.mime.call(this,e)}},{key:"isHTML5",get:function(){return this.provider===Hu.html5}},{key:"isEmbed",get:function(){return this.isYouTube||this.isVimeo}},{key:"isYouTube",get:function(){return this.provider===Hu.youtube}},{key:"isVimeo",get:function(){return this.provider===Hu.vimeo}},{key:"isVideo",get:function(){return this.type===Vu}},{key:"isAudio",get:function(){return this.type===Bu}},{key:"playing",get:function(){return Boolean(this.ready&&!this.paused&&!this.ended)}},{key:"paused",get:function(){return Boolean(this.media.paused)}},{key:"stopped",get:function(){return Boolean(this.paused&&0===this.currentTime)}},{key:"ended",get:function(){return Boolean(this.media.ended)}},{key:"currentTime",set:function(e){if(this.duration){var t=Ec(e)&&e>0;this.media.currentTime=t?Math.min(e,this.duration):0,this.debug.log("Seeking to ".concat(this.currentTime," seconds"))}},get:function(){return Number(this.media.currentTime)}},{key:"buffered",get:function(){var e=this.media.buffered;return Ec(e)?e:e&&e.length&&this.duration>0?e.end(0)/this.duration:0}},{key:"seeking",get:function(){return Boolean(this.media.seeking)}},{key:"duration",get:function(){var e=parseFloat(this.config.duration),t=(this.media||{}).duration,n=Ec(t)&&t!==1/0?t:0;return e||n}},{key:"volume",set:function(e){var t=e;Ac(t)&&(t=Number(t)),Ec(t)||(t=this.storage.get("volume")),Ec(t)||(t=this.config.volume),t>1&&(t=1),t<0&&(t=0),this.config.volume=t,this.media.volume=t,!_c(e)&&this.muted&&t>0&&(this.muted=!1)},get:function(){return Number(this.media.volume)}},{key:"muted",set:function(e){var t=e;xc(t)||(t=this.storage.get("muted")),xc(t)||(t=this.config.muted),this.config.muted=t,this.media.muted=t},get:function(){return Boolean(this.media.muted)}},{key:"hasAudio",get:function(){return!this.isHTML5||!!this.isAudio||Boolean(this.media.mozHasAudio)||Boolean(this.media.webkitAudioDecodedByteCount)||Boolean(this.media.audioTracks&&this.media.audioTracks.length)}},{key:"speed",set:function(e){var t=this,n=null;Ec(e)&&(n=e),Ec(n)||(n=this.storage.get("speed")),Ec(n)||(n=this.config.speed.selected);var i=this.minimumSpeed,r=this.maximumSpeed;n=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:255;return Math.min(Math.max(e,t),n)}(n,i,r),this.config.speed.selected=n,setTimeout((function(){t.media.playbackRate=n}),0)},get:function(){return Number(this.media.playbackRate)}},{key:"minimumSpeed",get:function(){return this.isYouTube?Math.min.apply(Math,Ul(this.options.speed)):this.isVimeo?.5:.0625}},{key:"maximumSpeed",get:function(){return this.isYouTube?Math.max.apply(Math,Ul(this.options.speed)):this.isVimeo?2:16}},{key:"quality",set:function(e){var t=this.config.quality,n=this.options.quality;if(n.length){var i=[!_c(e)&&Number(e),this.storage.get("quality"),t.selected,t.default].find(Ec),r=!0;if(!n.includes(i)){var a=function(e,t){return Pc(e)&&e.length?e.reduce((function(e,n){return Math.abs(n-t)<Math.abs(e-t)?n:e})):null}(n,i);this.debug.warn("Unsupported quality option: ".concat(i,", using ").concat(a," instead")),i=a,r=!1}t.selected=i,this.media.quality=i,r&&this.storage.set({quality:i})}},get:function(){return this.media.quality}},{key:"loop",set:function(e){var t=xc(e)?e:this.config.loop.active;this.config.loop.active=t,this.media.loop=t},get:function(){return Boolean(this.media.loop)}},{key:"source",set:function(e){lh.change.call(this,e)},get:function(){return this.media.currentSrc}},{key:"download",get:function(){var e=this.config.urls.download;return Rc(e)?e:this.source},set:function(e){Rc(e)&&(this.config.urls.download=e,ju.setDownloadUrl.call(this))}},{key:"poster",set:function(e){this.isVideo?Yu.setPoster.call(this,e,!1).catch((function(){})):this.debug.warn("Poster can only be set for video")},get:function(){return this.isVideo?this.media.getAttribute("poster")||this.media.getAttribute("data-poster"):null}},{key:"ratio",get:function(){if(!this.isVideo)return null;var e=mu(gu.call(this));return Pc(e)?e.join(":"):e},set:function(e){this.isVideo?Ac(e)&&pu(e)?(this.config.ratio=e,vu.call(this)):this.debug.error("Invalid aspect ratio specified (".concat(e,")")):this.debug.warn("Aspect ratio can only be set for video")}},{key:"autoplay",set:function(e){var t=xc(e)?e:this.config.autoplay;this.config.autoplay=t},get:function(){return Boolean(this.config.autoplay)}},{key:"currentTrack",set:function(e){Du.set.call(this,e,!1)},get:function(){var e=this.captions,t=e.toggled,n=e.currentTrack;return t?n:-1}},{key:"language",set:function(e){Du.setLanguage.call(this,e,!1)},get:function(){return(Du.getCurrentTrack.call(this)||{}).language}},{key:"pip",set:function(e){if(ru.pip){var t=xc(e)?e:!this.pip;Cc(this.media.webkitSetPresentationMode)&&this.media.webkitSetPresentationMode(t?qu:Uu),Cc(this.media.requestPictureInPicture)&&(!this.pip&&t?this.media.requestPictureInPicture():this.pip&&!t&&document.exitPictureInPicture())}},get:function(){return ru.pip?_c(this.media.webkitPresentationMode)?this.media===document.pictureInPictureElement:this.media.webkitPresentationMode===qu:null}}],[{key:"supported",value:function(e,t,n){return ru.check(e,t,n)}},{key:"loadSprite",value:function(e,t){return Ou(e,t)}},{key:"setup",value:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=null;return Ac(t)?i=Array.from(document.querySelectorAll(t)):Oc(t)?i=Array.from(t):Pc(t)&&(i=t.filter(Ic)),_c(i)?null:i.map((function(t){return new e(t,n)}))}}]),e}();ch.defaults=function(e){return JSON.parse(JSON.stringify(e))}(Fu);var uh={name:"VuePlyr",props:{options:{type:Object,required:!1,default:function(){return{}}}},data:function(){return{player:{}}},computed:{opts:function(){var e=this.options;return Object.prototype.hasOwnProperty.call(this.options,"hideYouTubeDOMError")||(e.hideYouTubeDOMError=!0),e}},mounted:function(){this.player=new ch(this.$el,this.opts)},beforeUnmount:function(){try{this.player.destroy()}catch(e){this.opts.hideYouTubeDOMError&&"The YouTube player is not attached to the DOM."===e.message||console.error(e)}},render:function(){var e=this.$slots.default;return"function"==typeof e?e()[0]:e},install:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};t.plyr&&(uh.props.options.default=function(){return kn({},t.plyr)}),e.component(uh.name,uh)}};/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (uh);
//# sourceMappingURL=vue-plyr.esm.js.map


/***/ }),

/***/ "./node_modules/vue/dist/vue.esm.js":
/*!******************************************!*\
  !*** ./node_modules/vue/dist/vue.esm.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*!
 * Vue.js v2.6.12
 * (c) 2014-2020 Evan You
 * Released under the MIT License.
 */
/*  */

var emptyObject = Object.freeze({});

// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.
function isUndef (v) {
  return v === undefined || v === null
}

function isDef (v) {
  return v !== undefined && v !== null
}

function isTrue (v) {
  return v === true
}

function isFalse (v) {
  return v === false
}

/**
 * Check if value is primitive.
 */
function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
var _toString = Object.prototype.toString;

function toRawType (value) {
  return _toString.call(value).slice(8, -1)
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function isRegExp (v) {
  return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
function isValidArrayIndex (val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}

function isPromise (val) {
  return (
    isDef(val) &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  )
}

/**
 * Convert a value to a string that is actually rendered.
 */
function toString (val) {
  return val == null
    ? ''
    : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Check if an attribute is a reserved attribute.
 */
var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

/**
 * Remove an item from an array.
 */
function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether an object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  var cache = Object.create(null);
  return (function cachedFn (str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str))
  })
}

/**
 * Camelize a hyphen-delimited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
});

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
});

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
});

/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */

/* istanbul ignore next */
function polyfillBind (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length;
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }

  boundFn._length = fn.length;
  return boundFn
}

function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}

var bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind;

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }
  return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  var res = {};
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res
}

/* eslint-disable no-unused-vars */

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
function noop (a, b, c) {}

/**
 * Always return false.
 */
var no = function (a, b, c) { return false; };

/* eslint-enable no-unused-vars */

/**
 * Return the same value.
 */
var identity = function (_) { return _; };

/**
 * Generate a string containing static keys from compiler modules.
 */
function genStaticKeys (modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime()
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

/**
 * Return the first index at which a loosely equal value can be
 * found in the array (if value is a plain object, the array must
 * contain an object of the same shape), or -1 if it is not present.
 */
function looseIndexOf (arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) { return i }
  }
  return -1
}

/**
 * Ensure a function is called only once.
 */
function once (fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  }
}

var SSR_ATTR = 'data-server-rendered';

var ASSET_TYPES = [
  'component',
  'directive',
  'filter'
];

var LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured',
  'serverPrefetch'
];

/*  */



var config = ({
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: "development" !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: "development" !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
});

/*  */

/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = new RegExp(("[^" + (unicodeRegExp.source) + ".$_\\d]"));
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  }
  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) { return }
      obj = obj[segments[i]];
    }
    return obj
  }
}

/*  */

// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined';
var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
var isPhantomJS = UA && /phantomjs/.test(UA);
var isFF = UA && UA.match(/firefox\/(\d+)/);

// Firefox has a "watch" function on Object.prototype...
var nativeWatch = ({}).watch;

var supportsPassive = false;
if (inBrowser) {
  try {
    var opts = {};
    Object.defineProperty(opts, 'passive', ({
      get: function get () {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    })); // https://github.com/facebook/flow/issues/285
    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
}

// this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV
var _isServer;
var isServerRendering = function () {
  if (_isServer === undefined) {
    /* istanbul ignore if */
    if (!inBrowser && !inWeex && typeof __webpack_require__.g !== 'undefined') {
      // detect presence of vue-server-renderer and avoid
      // Webpack shimming the process
      _isServer = __webpack_require__.g['process'] && __webpack_require__.g['process'].env.VUE_ENV === 'server';
    } else {
      _isServer = false;
    }
  }
  return _isServer
};

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

/* istanbul ignore next */
function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}

var hasSymbol =
  typeof Symbol !== 'undefined' && isNative(Symbol) &&
  typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

var _Set;
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = /*@__PURE__*/(function () {
    function Set () {
      this.set = Object.create(null);
    }
    Set.prototype.has = function has (key) {
      return this.set[key] === true
    };
    Set.prototype.add = function add (key) {
      this.set[key] = true;
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null);
    };

    return Set;
  }());
}

/*  */

var warn = noop;
var tip = noop;
var generateComponentTrace = (noop); // work around flow check
var formatComponentName = (noop);

if (true) {
  var hasConsole = typeof console !== 'undefined';
  var classifyRE = /(?:^|[-_])(\w)/g;
  var classify = function (str) { return str
    .replace(classifyRE, function (c) { return c.toUpperCase(); })
    .replace(/[-_]/g, ''); };

  warn = function (msg, vm) {
    var trace = vm ? generateComponentTrace(vm) : '';

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && (!config.silent)) {
      console.error(("[Vue warn]: " + msg + trace));
    }
  };

  tip = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.warn("[Vue tip]: " + msg + (
        vm ? generateComponentTrace(vm) : ''
      ));
    }
  };

  formatComponentName = function (vm, includeFile) {
    if (vm.$root === vm) {
      return '<Root>'
    }
    var options = typeof vm === 'function' && vm.cid != null
      ? vm.options
      : vm._isVue
        ? vm.$options || vm.constructor.options
        : vm;
    var name = options.name || options._componentTag;
    var file = options.__file;
    if (!name && file) {
      var match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (
      (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
      (file && includeFile !== false ? (" at " + file) : '')
    )
  };

  var repeat = function (str, n) {
    var res = '';
    while (n) {
      if (n % 2 === 1) { res += str; }
      if (n > 1) { str += str; }
      n >>= 1;
    }
    return res
  };

  generateComponentTrace = function (vm) {
    if (vm._isVue && vm.$parent) {
      var tree = [];
      var currentRecursiveSequence = 0;
      while (vm) {
        if (tree.length > 0) {
          var last = tree[tree.length - 1];
          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }
        tree.push(vm);
        vm = vm.$parent;
      }
      return '\n\nfound in\n\n' + tree
        .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
            ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
            : formatComponentName(vm))); })
        .join('\n')
    } else {
      return ("\n\n(found in " + (formatComponentName(vm)) + ")")
    }
  };
}

/*  */

var uid = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep () {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify () {
  // stabilize the subscriber list first
  var subs = this.subs.slice();
  if ( true && !config.async) {
    // subs aren't sorted in scheduler if not running async
    // we need to sort them now to make sure they fire in correct
    // order
    subs.sort(function (a, b) { return a.id - b.id; });
  }
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null;
var targetStack = [];

function pushTarget (target) {
  targetStack.push(target);
  Dep.target = target;
}

function popTarget () {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}

/*  */

var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  context,
  componentOptions,
  asyncFactory
) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.fnContext = undefined;
  this.fnOptions = undefined;
  this.fnScopeId = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
  this.asyncFactory = asyncFactory;
  this.asyncMeta = undefined;
  this.isAsyncPlaceholder = false;
};

var prototypeAccessors = { child: { configurable: true } };

// DEPRECATED: alias for componentInstance for backwards compat.
/* istanbul ignore next */
prototypeAccessors.child.get = function () {
  return this.componentInstance
};

Object.defineProperties( VNode.prototype, prototypeAccessors );

var createEmptyVNode = function (text) {
  if ( text === void 0 ) text = '';

  var node = new VNode();
  node.text = text;
  node.isComment = true;
  return node
};

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode (vnode) {
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

var methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dep.notify();
    return result
  });
});

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
var shouldObserve = true;

function toggleObserving (value) {
  shouldObserve = value;
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    if (hasProto) {
      protoAugment(value, arrayMethods);
    } else {
      copyAugment(value, arrayMethods, arrayKeys);
    }
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};

/**
 * Walk through all properties and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    defineReactive$$1(obj, keys[i]);
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe (value, asRootData) {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value);
  }
  if (asRootData && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive$$1 (
  obj,
  key,
  val,
  customSetter,
  shallow
) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if ( true && customSetter) {
        customSetter();
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) { return }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (target, key, val) {
  if ( true &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
     true && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    );
    return val
  }
  if (!ob) {
    target[key] = val;
    return val
  }
  defineReactive$$1(ob.value, key, val);
  ob.dep.notify();
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (target, key) {
  if ( true &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
  }
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return
  }
  var ob = (target).__ob__;
  if (target._isVue || (ob && ob.vmCount)) {
     true && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    );
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key];
  if (!ob) {
    return
  }
  ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
if (true) {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        "option \"" + key + "\" can only be used during instance " +
        'creation with the `new` keyword.'
      );
    }
    return defaultStrat(parent, child)
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  if (!from) { return to }
  var key, toVal, fromVal;

  var keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from);

  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    // in case the object is already observed...
    if (key === '__ob__') { continue }
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}

/**
 * Data
 */
function mergeDataOrFn (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal;
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal;
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
       true && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      );

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
};

/**
 * Hooks and props are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  var res = childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal;
  return res
    ? dedupeHooks(res)
    : res
}

function dedupeHooks (hooks) {
  var res = [];
  for (var i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }
  return res
}

LIFECYCLE_HOOKS.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (
  parentVal,
  childVal,
  vm,
  key
) {
  var res = Object.create(parentVal || null);
  if (childVal) {
     true && assertObjectType(key, childVal, vm);
    return extend(res, childVal)
  } else {
    return res
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (
  parentVal,
  childVal,
  vm,
  key
) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) { parentVal = undefined; }
  if (childVal === nativeWatch) { childVal = undefined; }
  /* istanbul ignore if */
  if (!childVal) { return Object.create(parentVal || null) }
  if (true) {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) { return childVal }
  var ret = {};
  extend(ret, parentVal);
  for (var key$1 in childVal) {
    var parent = ret[key$1];
    var child = childVal[key$1];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key$1] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child];
  }
  return ret
};

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal,
  childVal,
  vm,
  key
) {
  if (childVal && "development" !== 'production') {
    assertObjectType(key, childVal, vm);
  }
  if (!parentVal) { return childVal }
  var ret = Object.create(null);
  extend(ret, parentVal);
  if (childVal) { extend(ret, childVal); }
  return ret
};
strats.provide = mergeDataOrFn;

/**
 * Default strategy.
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
};

/**
 * Validate component names
 */
function checkComponents (options) {
  for (var key in options.components) {
    validateComponentName(key);
  }
}

function validateComponentName (name) {
  if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp.source) + "]*$")).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    );
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    );
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options, vm) {
  var props = options.props;
  if (!props) { return }
  var res = {};
  var i, val, name;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else if (true) {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val)
        ? val
        : { type: val };
    }
  } else if (true) {
    warn(
      "Invalid value for option \"props\": expected an Array or an Object, " +
      "but got " + (toRawType(props)) + ".",
      vm
    );
  }
  options.props = res;
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options, vm) {
  var inject = options.inject;
  if (!inject) { return }
  var normalized = options.inject = {};
  if (Array.isArray(inject)) {
    for (var i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] };
    }
  } else if (isPlainObject(inject)) {
    for (var key in inject) {
      var val = inject[key];
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val };
    }
  } else if (true) {
    warn(
      "Invalid value for option \"inject\": expected an Array or an Object, " +
      "but got " + (toRawType(inject)) + ".",
      vm
    );
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def$$1 = dirs[key];
      if (typeof def$$1 === 'function') {
        dirs[key] = { bind: def$$1, update: def$$1 };
      }
    }
  }
}

function assertObjectType (name, value, vm) {
  if (!isPlainObject(value)) {
    warn(
      "Invalid value for option \"" + name + "\": expected an Object, " +
      "but got " + (toRawType(value)) + ".",
      vm
    );
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  if (true) {
    checkComponents(child);
  }

  if (typeof child === 'function') {
    child = child.options;
  }

  normalizeProps(child, vm);
  normalizeInject(child, vm);
  normalizeDirectives(child);

  // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm);
    }
    if (child.mixins) {
      for (var i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
  }

  var options = {};
  var key;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type];
  // check local registration variations first
  if (hasOwn(assets, id)) { return assets[id] }
  var camelizedId = camelize(id);
  if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
  // fallback to prototype chain
  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
  if ( true && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    );
  }
  return res
}

/*  */



function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // boolean casting
  var booleanIndex = getTypeIndex(Boolean, prop.type);
  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      var stringIndex = getTypeIndex(String, prop.type);
      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true;
      }
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldObserve = shouldObserve;
    toggleObserving(true);
    observe(value);
    toggleObserving(prevShouldObserve);
  }
  if (
    true
  ) {
    assertProp(prop, key, value, vm, absent);
  }
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if ( true && isObject(def)) {
    warn(
      'Invalid default value for prop "' + key + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    );
  }
  // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger
  if (vm && vm.$options.propsData &&
    vm.$options.propsData[key] === undefined &&
    vm._props[key] !== undefined
  ) {
    return vm._props[key]
  }
  // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context
  return typeof def === 'function' && getType(prop.type) !== 'Function'
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    );
    return
  }
  if (value == null && !prop.required) {
    return
  }
  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }

  if (!valid) {
    warn(
      getInvalidTypeMessage(name, value, expectedTypes),
      vm
    );
    return
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      );
    }
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

function assertType (value, type) {
  var valid;
  var expectedType = getType(type);
  if (simpleCheckRE.test(expectedType)) {
    var t = typeof value;
    valid = t === expectedType.toLowerCase();
    // for primitive wrapper objects
    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : ''
}

function isSameType (a, b) {
  return getType(a) === getType(b)
}

function getTypeIndex (type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1
  }
  for (var i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i
    }
  }
  return -1
}

function getInvalidTypeMessage (name, value, expectedTypes) {
  var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
    " Expected " + (expectedTypes.map(capitalize).join(', '));
  var expectedType = expectedTypes[0];
  var receivedType = toRawType(value);
  var expectedValue = styleValue(value, expectedType);
  var receivedValue = styleValue(value, receivedType);
  // check if we need to specify expected value
  if (expectedTypes.length === 1 &&
      isExplicable(expectedType) &&
      !isBoolean(expectedType, receivedType)) {
    message += " with value " + expectedValue;
  }
  message += ", got " + receivedType + " ";
  // check if we need to specify received value
  if (isExplicable(receivedType)) {
    message += "with value " + receivedValue + ".";
  }
  return message
}

function styleValue (value, type) {
  if (type === 'String') {
    return ("\"" + value + "\"")
  } else if (type === 'Number') {
    return ("" + (Number(value)))
  } else {
    return ("" + value)
  }
}

function isExplicable (value) {
  var explicitTypes = ['string', 'number', 'boolean'];
  return explicitTypes.some(function (elem) { return value.toLowerCase() === elem; })
}

function isBoolean () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
}

/*  */

function handleError (err, vm, info) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  pushTarget();
  try {
    if (vm) {
      var cur = vm;
      while ((cur = cur.$parent)) {
        var hooks = cur.$options.errorCaptured;
        if (hooks) {
          for (var i = 0; i < hooks.length; i++) {
            try {
              var capture = hooks[i].call(cur, err, vm, info) === false;
              if (capture) { return }
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }
    globalHandleError(err, vm, info);
  } finally {
    popTarget();
  }
}

function invokeWithErrorHandling (
  handler,
  context,
  args,
  vm,
  info
) {
  var res;
  try {
    res = args ? handler.apply(context, args) : handler.call(context);
    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(function (e) { return handleError(e, vm, info + " (Promise/async)"); });
      // issue #9511
      // avoid catch triggering multiple times when nested calls
      res._handled = true;
    }
  } catch (e) {
    handleError(e, vm, info);
  }
  return res
}

function globalHandleError (err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info)
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler');
      }
    }
  }
  logError(err, vm, info);
}

function logError (err, vm, info) {
  if (true) {
    warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
  }
  /* istanbul ignore else */
  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err
  }
}

/*  */

var isUsingMicroTask = false;

var callbacks = [];
var pending = false;

function flushCallbacks () {
  pending = false;
  var copies = callbacks.slice(0);
  callbacks.length = 0;
  for (var i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

// Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
var timerFunc;

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  var p = Promise.resolve();
  timerFunc = function () {
    p.then(flushCallbacks);
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) { setTimeout(noop); }
  };
  isUsingMicroTask = true;
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  var counter = 1;
  var observer = new MutationObserver(flushCallbacks);
  var textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = function () {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
  isUsingMicroTask = true;
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = function () {
    setImmediate(flushCallbacks);
  };
} else {
  // Fallback to setTimeout.
  timerFunc = function () {
    setTimeout(flushCallbacks, 0);
  };
}

function nextTick (cb, ctx) {
  var _resolve;
  callbacks.push(function () {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });
  if (!pending) {
    pending = true;
    timerFunc();
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) {
      _resolve = resolve;
    })
  }
}

/*  */

var mark;
var measure;

if (true) {
  var perf = inBrowser && window.performance;
  /* istanbul ignore if */
  if (
    perf &&
    perf.mark &&
    perf.measure &&
    perf.clearMarks &&
    perf.clearMeasures
  ) {
    mark = function (tag) { return perf.mark(tag); };
    measure = function (name, startTag, endTag) {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag);
      // perf.clearMeasures(name)
    };
  }
}

/* not type checking this file because flow doesn't play well with Proxy */

var initProxy;

if (true) {
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  );

  var warnNonPresent = function (target, key) {
    warn(
      "Property or method \"" + key + "\" is not defined on the instance but " +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    );
  };

  var warnReservedPrefix = function (target, key) {
    warn(
      "Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " +
      'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
      'prevent conflicts with Vue internals. ' +
      'See: https://vuejs.org/v2/api/#data',
      target
    );
  };

  var hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
          return false
        } else {
          target[key] = value;
          return true
        }
      }
    });
  }

  var hasHandler = {
    has: function has (target, key) {
      var has = key in target;
      var isAllowed = allowedGlobals(key) ||
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
      if (!has && !isAllowed) {
        if (key in target.$data) { warnReservedPrefix(target, key); }
        else { warnNonPresent(target, key); }
      }
      return has || !isAllowed
    }
  };

  var getHandler = {
    get: function get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) { warnReservedPrefix(target, key); }
        else { warnNonPresent(target, key); }
      }
      return target[key]
    }
  };

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}

/*  */

var seenObjects = new _Set();

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
function traverse (val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse (val, seen) {
  var i, keys;
  var isA = Array.isArray(val);
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }
  if (val.__ob__) {
    var depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) { _traverse(val[i], seen); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { _traverse(val[keys[i]], seen); }
  }
}

/*  */

var normalizeEvent = cached(function (name) {
  var passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
  name = once$$1 ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once$$1,
    capture: capture,
    passive: passive
  }
});

function createFnInvoker (fns, vm) {
  function invoker () {
    var arguments$1 = arguments;

    var fns = invoker.fns;
    if (Array.isArray(fns)) {
      var cloned = fns.slice();
      for (var i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler");
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler")
    }
  }
  invoker.fns = fns;
  return invoker
}

function updateListeners (
  on,
  oldOn,
  add,
  remove$$1,
  createOnceHandler,
  vm
) {
  var name, def$$1, cur, old, event;
  for (name in on) {
    def$$1 = cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);
    if (isUndef(cur)) {
       true && warn(
        "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
        vm
      );
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm);
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture);
      }
      add(event.name, cur, event.capture, event.passive, event.params);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove$$1(event.name, oldOn[name], event.capture);
    }
  }
}

/*  */

function mergeVNodeHook (def, hookKey, hook) {
  if (def instanceof VNode) {
    def = def.data.hook || (def.data.hook = {});
  }
  var invoker;
  var oldHook = def[hookKey];

  function wrappedHook () {
    hook.apply(this, arguments);
    // important: remove merged hook to ensure it's called only once
    // and prevent memory leak
    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}

/*  */

function extractPropsFromVNodeData (
  data,
  Ctor,
  tag
) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (isUndef(propOptions)) {
    return
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  if (isDef(attrs) || isDef(props)) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      if (true) {
        var keyInLowerCase = key.toLowerCase();
        if (
          key !== keyInLowerCase &&
          attrs && hasOwn(attrs, keyInLowerCase)
        ) {
          tip(
            "Prop \"" + keyInLowerCase + "\" is passed to component " +
            (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
            " \"" + key + "\". " +
            "Note that HTML attributes are case-insensitive and camelCased " +
            "props need to use their kebab-case equivalents when using in-DOM " +
            "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
          );
        }
      }
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey, false);
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true
    }
  }
  return false
}

/*  */

// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:

// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.
function simpleNormalizeChildren (children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}

// 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.
function normalizeChildren (children) {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    : Array.isArray(children)
      ? normalizeArrayChildren(children)
      : undefined
}

function isTextNode (node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

function normalizeArrayChildren (children, nestedIndex) {
  var res = [];
  var i, c, lastIndex, last;
  for (i = 0; i < children.length; i++) {
    c = children[i];
    if (isUndef(c) || typeof c === 'boolean') { continue }
    lastIndex = res.length - 1;
    last = res[lastIndex];
    //  nested
    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + (c[0]).text);
          c.shift();
        }
        res.push.apply(res, c);
      }
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }
        res.push(c);
      }
    }
  }
  return res
}

/*  */

function initProvide (vm) {
  var provide = vm.$options.provide;
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide;
  }
}

function initInjections (vm) {
  var result = resolveInject(vm.$options.inject, vm);
  if (result) {
    toggleObserving(false);
    Object.keys(result).forEach(function (key) {
      /* istanbul ignore else */
      if (true) {
        defineReactive$$1(vm, key, result[key], function () {
          warn(
            "Avoid mutating an injected value directly since the changes will be " +
            "overwritten whenever the provided component re-renders. " +
            "injection being mutated: \"" + key + "\"",
            vm
          );
        });
      } else {}
    });
    toggleObserving(true);
  }
}

function resolveInject (inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    var result = Object.create(null);
    var keys = hasSymbol
      ? Reflect.ownKeys(inject)
      : Object.keys(inject);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      // #6574 in case the inject object is observed...
      if (key === '__ob__') { continue }
      var provideKey = inject[key].from;
      var source = vm;
      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey];
          break
        }
        source = source.$parent;
      }
      if (!source) {
        if ('default' in inject[key]) {
          var provideDefault = inject[key].default;
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault;
        } else if (true) {
          warn(("Injection \"" + key + "\" not found"), vm);
        }
      }
    }
    return result
  }
}

/*  */



/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
function resolveSlots (
  children,
  context
) {
  if (!children || !children.length) {
    return {}
  }
  var slots = {};
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    var data = child.data;
    // remove slot attribute if the node is resolved as a Vue slot node
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    }
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    if ((child.context === context || child.fnContext === context) &&
      data && data.slot != null
    ) {
      var name = data.slot;
      var slot = (slots[name] || (slots[name] = []));
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      (slots.default || (slots.default = [])).push(child);
    }
  }
  // ignore slots that contains only whitespace
  for (var name$1 in slots) {
    if (slots[name$1].every(isWhitespace)) {
      delete slots[name$1];
    }
  }
  return slots
}

function isWhitespace (node) {
  return (node.isComment && !node.asyncFactory) || node.text === ' '
}

/*  */

function normalizeScopedSlots (
  slots,
  normalSlots,
  prevSlots
) {
  var res;
  var hasNormalSlots = Object.keys(normalSlots).length > 0;
  var isStable = slots ? !!slots.$stable : !hasNormalSlots;
  var key = slots && slots.$key;
  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized
  } else if (
    isStable &&
    prevSlots &&
    prevSlots !== emptyObject &&
    key === prevSlots.$key &&
    !hasNormalSlots &&
    !prevSlots.$hasNormal
  ) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevSlots
  } else {
    res = {};
    for (var key$1 in slots) {
      if (slots[key$1] && key$1[0] !== '$') {
        res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
      }
    }
  }
  // expose normal slots on scopedSlots
  for (var key$2 in normalSlots) {
    if (!(key$2 in res)) {
      res[key$2] = proxyNormalSlot(normalSlots, key$2);
    }
  }
  // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error
  if (slots && Object.isExtensible(slots)) {
    (slots)._normalized = res;
  }
  def(res, '$stable', isStable);
  def(res, '$key', key);
  def(res, '$hasNormal', hasNormalSlots);
  return res
}

function normalizeScopedSlot(normalSlots, key, fn) {
  var normalized = function () {
    var res = arguments.length ? fn.apply(null, arguments) : fn({});
    res = res && typeof res === 'object' && !Array.isArray(res)
      ? [res] // single vnode
      : normalizeChildren(res);
    return res && (
      res.length === 0 ||
      (res.length === 1 && res[0].isComment) // #9658
    ) ? undefined
      : res
  };
  // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.
  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    });
  }
  return normalized
}

function proxyNormalSlot(slots, key) {
  return function () { return slots[key]; }
}

/*  */

/**
 * Runtime helper for rendering v-for lists.
 */
function renderList (
  val,
  render
) {
  var ret, i, l, keys, key;
  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    if (hasSymbol && val[Symbol.iterator]) {
      ret = [];
      var iterator = val[Symbol.iterator]();
      var result = iterator.next();
      while (!result.done) {
        ret.push(render(result.value, ret.length));
        result = iterator.next();
      }
    } else {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
  }
  if (!isDef(ret)) {
    ret = [];
  }
  (ret)._isVList = true;
  return ret
}

/*  */

/**
 * Runtime helper for rendering <slot>
 */
function renderSlot (
  name,
  fallback,
  props,
  bindObject
) {
  var scopedSlotFn = this.$scopedSlots[name];
  var nodes;
  if (scopedSlotFn) { // scoped slot
    props = props || {};
    if (bindObject) {
      if ( true && !isObject(bindObject)) {
        warn(
          'slot v-bind without argument expects an Object',
          this
        );
      }
      props = extend(extend({}, bindObject), props);
    }
    nodes = scopedSlotFn(props) || fallback;
  } else {
    nodes = this.$slots[name] || fallback;
  }

  var target = props && props.slot;
  if (target) {
    return this.$createElement('template', { slot: target }, nodes)
  } else {
    return nodes
  }
}

/*  */

/**
 * Runtime helper for resolving filters
 */
function resolveFilter (id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}

/*  */

function isKeyNotMatch (expect, actual) {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1
  } else {
    return expect !== actual
  }
}

/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */
function checkKeyCodes (
  eventKeyCode,
  key,
  builtInKeyCode,
  eventKeyName,
  builtInKeyName
) {
  var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName)
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode)
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
}

/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
function bindObjectProps (
  data,
  tag,
  value,
  asProp,
  isSync
) {
  if (value) {
    if (!isObject(value)) {
       true && warn(
        'v-bind without argument expects an Object or Array value',
        this
      );
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }
      var hash;
      var loop = function ( key ) {
        if (
          key === 'class' ||
          key === 'style' ||
          isReservedAttribute(key)
        ) {
          hash = data;
        } else {
          var type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key)
            ? data.domProps || (data.domProps = {})
            : data.attrs || (data.attrs = {});
        }
        var camelizedKey = camelize(key);
        var hyphenatedKey = hyphenate(key);
        if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
          hash[key] = value[key];

          if (isSync) {
            var on = data.on || (data.on = {});
            on[("update:" + key)] = function ($event) {
              value[key] = $event;
            };
          }
        }
      };

      for (var key in value) loop( key );
    }
  }
  return data
}

/*  */

/**
 * Runtime helper for rendering static trees.
 */
function renderStatic (
  index,
  isInFor
) {
  var cached = this._staticTrees || (this._staticTrees = []);
  var tree = cached[index];
  // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.
  if (tree && !isInFor) {
    return tree
  }
  // otherwise, render a fresh tree.
  tree = cached[index] = this.$options.staticRenderFns[index].call(
    this._renderProxy,
    null,
    this // for render fns generated for functional component templates
  );
  markStatic(tree, ("__static__" + index), false);
  return tree
}

/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */
function markOnce (
  tree,
  index,
  key
) {
  markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
  return tree
}

function markStatic (
  tree,
  key,
  isOnce
) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], (key + "_" + i), isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode (node, key, isOnce) {
  node.isStatic = true;
  node.key = key;
  node.isOnce = isOnce;
}

/*  */

function bindObjectListeners (data, value) {
  if (value) {
    if (!isPlainObject(value)) {
       true && warn(
        'v-on without argument expects an Object value',
        this
      );
    } else {
      var on = data.on = data.on ? extend({}, data.on) : {};
      for (var key in value) {
        var existing = on[key];
        var ours = value[key];
        on[key] = existing ? [].concat(existing, ours) : ours;
      }
    }
  }
  return data
}

/*  */

function resolveScopedSlots (
  fns, // see flow/vnode
  res,
  // the following are added in 2.6
  hasDynamicKeys,
  contentHashKey
) {
  res = res || { $stable: !hasDynamicKeys };
  for (var i = 0; i < fns.length; i++) {
    var slot = fns[i];
    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys);
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      if (slot.proxy) {
        slot.fn.proxy = true;
      }
      res[slot.key] = slot.fn;
    }
  }
  if (contentHashKey) {
    (res).$key = contentHashKey;
  }
  return res
}

/*  */

function bindDynamicKeys (baseObj, values) {
  for (var i = 0; i < values.length; i += 2) {
    var key = values[i];
    if (typeof key === 'string' && key) {
      baseObj[values[i]] = values[i + 1];
    } else if ( true && key !== '' && key !== null) {
      // null is a special value for explicitly removing a binding
      warn(
        ("Invalid value for dynamic directive argument (expected string or null): " + key),
        this
      );
    }
  }
  return baseObj
}

// helper to dynamically append modifier runtime markers to event names.
// ensure only append when value is already string, otherwise it will be cast
// to string and cause the type check to miss.
function prependModifier (value, symbol) {
  return typeof value === 'string' ? symbol + value : value
}

/*  */

function installRenderHelpers (target) {
  target._o = markOnce;
  target._n = toNumber;
  target._s = toString;
  target._l = renderList;
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  target._v = createTextVNode;
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
  target._d = bindDynamicKeys;
  target._p = prependModifier;
}

/*  */

function FunctionalRenderContext (
  data,
  props,
  children,
  parent,
  Ctor
) {
  var this$1 = this;

  var options = Ctor.options;
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  var contextVm;
  if (hasOwn(parent, '_uid')) {
    contextVm = Object.create(parent);
    // $flow-disable-line
    contextVm._original = parent;
  } else {
    // the context vm passed in is a functional context as well.
    // in this case we want to make sure we are able to get a hold to the
    // real context instance.
    contextVm = parent;
    // $flow-disable-line
    parent = parent._original;
  }
  var isCompiled = isTrue(options._compiled);
  var needNormalization = !isCompiled;

  this.data = data;
  this.props = props;
  this.children = children;
  this.parent = parent;
  this.listeners = data.on || emptyObject;
  this.injections = resolveInject(options.inject, parent);
  this.slots = function () {
    if (!this$1.$slots) {
      normalizeScopedSlots(
        data.scopedSlots,
        this$1.$slots = resolveSlots(children, parent)
      );
    }
    return this$1.$slots
  };

  Object.defineProperty(this, 'scopedSlots', ({
    enumerable: true,
    get: function get () {
      return normalizeScopedSlots(data.scopedSlots, this.slots())
    }
  }));

  // support for compiled functional template
  if (isCompiled) {
    // exposing $options for renderStatic()
    this.$options = options;
    // pre-resolve slots for renderSlot()
    this.$slots = this.slots();
    this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
  }

  if (options._scopeId) {
    this._c = function (a, b, c, d) {
      var vnode = createElement(contextVm, a, b, c, d, needNormalization);
      if (vnode && !Array.isArray(vnode)) {
        vnode.fnScopeId = options._scopeId;
        vnode.fnContext = parent;
      }
      return vnode
    };
  } else {
    this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
  }
}

installRenderHelpers(FunctionalRenderContext.prototype);

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  contextVm,
  children
) {
  var options = Ctor.options;
  var props = {};
  var propOptions = options.props;
  if (isDef(propOptions)) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject);
    }
  } else {
    if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
    if (isDef(data.props)) { mergeProps(props, data.props); }
  }

  var renderContext = new FunctionalRenderContext(
    data,
    props,
    children,
    contextVm,
    Ctor
  );

  var vnode = options.render.call(null, renderContext._c, renderContext);

  if (vnode instanceof VNode) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
  } else if (Array.isArray(vnode)) {
    var vnodes = normalizeChildren(vnode) || [];
    var res = new Array(vnodes.length);
    for (var i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
    }
    return res
  }
}

function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
  // #7817 clone node before setting fnContext, otherwise if the node is reused
  // (e.g. it was from a cached normal slot) the fnContext causes named slots
  // that should not be matched to match.
  var clone = cloneVNode(vnode);
  clone.fnContext = contextVm;
  clone.fnOptions = options;
  if (true) {
    (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
  }
  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot;
  }
  return clone
}

function mergeProps (to, from) {
  for (var key in from) {
    to[camelize(key)] = from[key];
  }
}

/*  */

/*  */

/*  */

/*  */

// inline hooks to be invoked on component VNodes during patch
var componentVNodeHooks = {
  init: function init (vnode, hydrating) {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      var child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance
      );
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },

  prepatch: function prepatch (oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    );
  },

  insert: function insert (vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true /* direct */);
      }
    }
  },

  destroy: function destroy (vnode) {
    var componentInstance = vnode.componentInstance;
    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true /* direct */);
      }
    }
  }
};

var hooksToMerge = Object.keys(componentVNodeHooks);

function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (isUndef(Ctor)) {
    return
  }

  var baseCtor = context.$options._base;

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  if (typeof Ctor !== 'function') {
    if (true) {
      warn(("Invalid Component definition: " + (String(Ctor))), context);
    }
    return
  }

  // async component
  var asyncFactory;
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {};

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  resolveConstructorOptions(Ctor);

  // transform component v-model data into props & events
  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  }

  // extract props
  var propsData = extractPropsFromVNodeData(data, Ctor, tag);

  // functional component
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    var slot = data.slot;
    data = {};
    if (slot) {
      data.slot = slot;
    }
  }

  // install component management hooks onto the placeholder node
  installComponentHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
    asyncFactory
  );

  return vnode
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent // activeInstance in lifecycle state
) {
  var options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent: parent
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnode.componentOptions.Ctor(options)
}

function installComponentHooks (data) {
  var hooks = data.hook || (data.hook = {});
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var existing = hooks[key];
    var toMerge = componentVNodeHooks[key];
    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
    }
  }
}

function mergeHook$1 (f1, f2) {
  var merged = function (a, b) {
    // flow complains about extra args which is why we use any
    f1(a, b);
    f2(a, b);
  };
  merged._merged = true;
  return merged
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data) {
  var prop = (options.model && options.model.prop) || 'value';
  var event = (options.model && options.model.event) || 'input'
  ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
  var on = data.on || (data.on = {});
  var existing = on[event];
  var callback = data.model.callback;
  if (isDef(existing)) {
    if (
      Array.isArray(existing)
        ? existing.indexOf(callback) === -1
        : existing !== callback
    ) {
      on[event] = [callback].concat(existing);
    }
  } else {
    on[event] = callback;
  }
}

/*  */

var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2;

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  context,
  tag,
  data,
  children,
  normalizationType,
  alwaysNormalize
) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement (
  context,
  tag,
  data,
  children,
  normalizationType
) {
  if (isDef(data) && isDef((data).__ob__)) {
     true && warn(
      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
      'Always create fresh vnode data objects in each render!',
      context
    );
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if ( true &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      );
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {};
    data.scopedSlots = { default: children[0] };
    children.length = 0;
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }
  var vnode, ns;
  if (typeof tag === 'string') {
    var Ctor;
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if ( true && isDef(data) && isDef(data.nativeOn)) {
        warn(
          ("The .native modifier for v-on is only valid on components but it was used on <" + tag + ">."),
          context
        );
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      );
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      );
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) { applyNS(vnode, ns); }
    if (isDef(data)) { registerDeepBindings(data); }
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns;
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined;
    force = true;
  }
  if (isDef(vnode.children)) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force);
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style);
  }
  if (isObject(data.class)) {
    traverse(data.class);
  }
}

/*  */

function initRender (vm) {
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null; // v-once cached trees
  var options = vm.$options;
  var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject;
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

  // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated
  var parentData = parentVnode && parentVnode.data;

  /* istanbul ignore else */
  if (true) {
    defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
      !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
    }, true);
    defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, function () {
      !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
    }, true);
  } else {}
}

var currentRenderingInstance = null;

function renderMixin (Vue) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype);

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var _parentVnode = ref._parentVnode;

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      );
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // render self
    var vnode;
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm;
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, "render");
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if ( true && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
        } catch (e) {
          handleError(e, vm, "renderError");
          vnode = vm._vnode;
        }
      } else {
        vnode = vm._vnode;
      }
    } finally {
      currentRenderingInstance = null;
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0];
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if ( true && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        );
      }
      vnode = createEmptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode
  };
}

/*  */

function ensureCtor (comp, base) {
  if (
    comp.__esModule ||
    (hasSymbol && comp[Symbol.toStringTag] === 'Module')
  ) {
    comp = comp.default;
  }
  return isObject(comp)
    ? base.extend(comp)
    : comp
}

function createAsyncPlaceholder (
  factory,
  data,
  context,
  children,
  tag
) {
  var node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = { data: data, context: context, children: children, tag: tag };
  return node
}

function resolveAsyncComponent (
  factory,
  baseCtor
) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp
  }

  if (isDef(factory.resolved)) {
    return factory.resolved
  }

  var owner = currentRenderingInstance;
  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // already pending
    factory.owners.push(owner);
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp
  }

  if (owner && !isDef(factory.owners)) {
    var owners = factory.owners = [owner];
    var sync = true;
    var timerLoading = null;
    var timerTimeout = null

    ;(owner).$on('hook:destroyed', function () { return remove(owners, owner); });

    var forceRender = function (renderCompleted) {
      for (var i = 0, l = owners.length; i < l; i++) {
        (owners[i]).$forceUpdate();
      }

      if (renderCompleted) {
        owners.length = 0;
        if (timerLoading !== null) {
          clearTimeout(timerLoading);
          timerLoading = null;
        }
        if (timerTimeout !== null) {
          clearTimeout(timerTimeout);
          timerTimeout = null;
        }
      }
    };

    var resolve = once(function (res) {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor);
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        forceRender(true);
      } else {
        owners.length = 0;
      }
    });

    var reject = once(function (reason) {
       true && warn(
        "Failed to resolve async component: " + (String(factory)) +
        (reason ? ("\nReason: " + reason) : '')
      );
      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender(true);
      }
    });

    var res = factory(resolve, reject);

    if (isObject(res)) {
      if (isPromise(res)) {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if (isPromise(res.component)) {
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);
          if (res.delay === 0) {
            factory.loading = true;
          } else {
            timerLoading = setTimeout(function () {
              timerLoading = null;
              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender(false);
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          timerTimeout = setTimeout(function () {
            timerTimeout = null;
            if (isUndef(factory.resolved)) {
              reject(
                 true
                  ? ("timeout (" + (res.timeout) + "ms)")
                  : 0
              );
            }
          }, res.timeout);
        }
      }
    }

    sync = false;
    // return in case resolved synchronously
    return factory.loading
      ? factory.loadingComp
      : factory.resolved
  }
}

/*  */

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

/*  */

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

/*  */

/*  */

function initEvents (vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

var target;

function add (event, fn) {
  target.$on(event, fn);
}

function remove$1 (event, fn) {
  target.$off(event, fn);
}

function createOnceHandler (event, fn) {
  var _target = target;
  return function onceHandler () {
    var res = fn.apply(null, arguments);
    if (res !== null) {
      _target.$off(event, onceHandler);
    }
  }
}

function updateComponentListeners (
  vm,
  listeners,
  oldListeners
) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
  target = undefined;
}

function eventsMixin (Vue) {
  var hookRE = /^hook:/;
  Vue.prototype.$on = function (event, fn) {
    var vm = this;
    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on () {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm
  };

  Vue.prototype.$off = function (event, fn) {
    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
        vm.$off(event[i$1], fn);
      }
      return vm
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm
    }
    if (!fn) {
      vm._events[event] = null;
      return vm
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break
      }
    }
    return vm
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    if (true) {
      var lowerCaseEvent = event.toLowerCase();
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          "Event \"" + lowerCaseEvent + "\" is emitted in component " +
          (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
          "Note that HTML attributes are case-insensitive and you cannot use " +
          "v-on to listen to camelCase events when using in-DOM templates. " +
          "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
        );
      }
    }
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      var info = "event handler for \"" + event + "\"";
      for (var i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info);
      }
    }
    return vm
  };
}

/*  */

var activeInstance = null;
var isUpdatingChildComponent = false;

function setActiveInstance(vm) {
  var prevActiveInstance = activeInstance;
  activeInstance = vm;
  return function () {
    activeInstance = prevActiveInstance;
  }
}

function initLifecycle (vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var restoreActiveInstance = setActiveInstance(vm);
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    restoreActiveInstance();
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null);
    // fire destroyed hook
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null;
    }
  };
}

function mountComponent (
  vm,
  el,
  hydrating
) {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
    if (true) {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        );
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        );
      }
    }
  }
  callHook(vm, 'beforeMount');

  var updateComponent;
  /* istanbul ignore if */
  if ( true && config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;
      var startTag = "vue-perf-start:" + id;
      var endTag = "vue-perf-end:" + id;

      mark(startTag);
      var vnode = vm._render();
      mark(endTag);
      measure(("vue " + name + " render"), startTag, endTag);

      mark(startTag);
      vm._update(vnode, hydrating);
      mark(endTag);
      measure(("vue " + name + " patch"), startTag, endTag);
    };
  } else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  new Watcher(vm, updateComponent, noop, {
    before: function before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate');
      }
    }
  }, true /* isRenderWatcher */);
  hydrating = false;

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }
  return vm
}

function updateChildComponent (
  vm,
  propsData,
  listeners,
  parentVnode,
  renderChildren
) {
  if (true) {
    isUpdatingChildComponent = true;
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.

  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.
  var newScopedSlots = parentVnode.data.scopedSlots;
  var oldScopedSlots = vm.$scopedSlots;
  var hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key)
  );

  // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.
  var needsForceUpdate = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    hasDynamicScopedSlot
  );

  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode;
  }
  vm.$options._renderChildren = renderChildren;

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject;
  vm.$listeners = listeners || emptyObject;

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false);
    var props = vm._props;
    var propKeys = vm.$options._propKeys || [];
    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      var propOptions = vm.$options.props; // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm);
    }
    toggleObserving(true);
    // keep a copy of raw propsData
    vm.$options.propsData = propsData;
  }

  // update listeners
  listeners = listeners || emptyObject;
  var oldListeners = vm.$options._parentListeners;
  vm.$options._parentListeners = listeners;
  updateComponentListeners(vm, listeners, oldListeners);

  // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  if (true) {
    isUpdatingChildComponent = false;
  }
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) { return true }
  }
  return false
}

function activateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = false;
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;
    for (var i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'activated');
  }
}

function deactivateChildComponent (vm, direct) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true;
    for (var i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated');
  }
}

function callHook (vm, hook) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  var handlers = vm.$options[hook];
  var info = hook + " hook";
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info);
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }
  popTarget();
}

/*  */

var MAX_UPDATE_COUNT = 100;

var queue = [];
var activatedChildren = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0;
  has = {};
  if (true) {
    circular = {};
  }
  waiting = flushing = false;
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
var currentFlushTimestamp = 0;

// Async edge case fix requires storing an event listener's attach timestamp.
var getNow = Date.now;

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  var performance = window.performance;
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = function () { return performance.now(); };
  }
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow();
  flushing = true;
  var watcher, id;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    if (watcher.before) {
      watcher.before();
    }
    id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if ( true && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        );
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  var activatedQueue = activatedChildren.slice();
  var updatedQueue = queue.slice();

  resetSchedulerState();

  // call component updated and activated hooks
  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }
}

function callUpdatedHooks (queue) {
  var i = queue.length;
  while (i--) {
    var watcher = queue[i];
    var vm = watcher.vm;
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
function queueActivatedComponent (vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks (queue) {
  for (var i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true /* true */);
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i > index && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(i + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;

      if ( true && !config.async) {
        flushSchedulerQueue();
        return
      }
      nextTick(flushSchedulerQueue);
    }
  }
}

/*  */



var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options,
  isRenderWatcher
) {
  this.vm = vm;
  if (isRenderWatcher) {
    vm._watcher = this;
  }
  vm._watchers.push(this);
  // options
  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
    this.before = options.before;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression =  true
    ? expOrFn.toString()
    : 0;
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
    if (!this.getter) {
      this.getter = noop;
       true && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      );
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get();
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get () {
  pushTarget(this);
  var value;
  var vm = this.vm;
  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
    } else {
      throw e
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    this.cleanupDeps();
  }
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get();
    if (
      value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
  var i = this.deps.length;
  while (i--) {
    this.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subscriber list.
 */
Watcher.prototype.teardown = function teardown () {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }
    var i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
    this.active = false;
  }
};

/*  */

var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState (vm) {
  vm._watchers = [];
  var opts = vm.$options;
  if (opts.props) { initProps(vm, opts.props); }
  if (opts.methods) { initMethods(vm, opts.methods); }
  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true /* asRootData */);
  }
  if (opts.computed) { initComputed(vm, opts.computed); }
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function initProps (vm, propsOptions) {
  var propsData = vm.$options.propsData || {};
  var props = vm._props = {};
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  var keys = vm.$options._propKeys = [];
  var isRoot = !vm.$parent;
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false);
  }
  var loop = function ( key ) {
    keys.push(key);
    var value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    if (true) {
      var hyphenatedKey = hyphenate(key);
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
          vm
        );
      }
      defineReactive$$1(props, key, value, function () {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            "Avoid mutating a prop directly since the value will be " +
            "overwritten whenever the parent component re-renders. " +
            "Instead, use a data or computed property based on the prop's " +
            "value. Prop being mutated: \"" + key + "\"",
            vm
          );
        }
      });
    } else {}
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, "_props", key);
    }
  };

  for (var key in propsOptions) loop( key );
  toggleObserving(true);
}

function initData (vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {};
  if (!isPlainObject(data)) {
    data = {};
     true && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    );
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;
  while (i--) {
    var key = keys[i];
    if (true) {
      if (methods && hasOwn(methods, key)) {
        warn(
          ("Method \"" + key + "\" has already been defined as a data property."),
          vm
        );
      }
    }
    if (props && hasOwn(props, key)) {
       true && warn(
        "The data property \"" + key + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      );
    } else if (!isReserved(key)) {
      proxy(vm, "_data", key);
    }
  }
  // observe data
  observe(data, true /* asRootData */);
}

function getData (data, vm) {
  // #7573 disable dep collection when invoking data getters
  pushTarget();
  try {
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, "data()");
    return {}
  } finally {
    popTarget();
  }
}

var computedWatcherOptions = { lazy: true };

function initComputed (vm, computed) {
  // $flow-disable-line
  var watchers = vm._computedWatchers = Object.create(null);
  // computed properties are just getters during SSR
  var isSSR = isServerRendering();

  for (var key in computed) {
    var userDef = computed[key];
    var getter = typeof userDef === 'function' ? userDef : userDef.get;
    if ( true && getter == null) {
      warn(
        ("Getter is missing for computed property \"" + key + "\"."),
        vm
      );
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      );
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else if (true) {
      if (key in vm.$data) {
        warn(("The computed property \"" + key + "\" is already defined in data."), vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
      }
    }
  }
}

function defineComputed (
  target,
  key,
  userDef
) {
  var shouldCache = !isServerRendering();
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }
  if ( true &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        ("Computed property \"" + key + "\" was assigned to but it has no setter."),
        this
      );
    };
  }
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter (key) {
  return function computedGetter () {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

function initMethods (vm, methods) {
  var props = vm.$options.props;
  for (var key in methods) {
    if (true) {
      if (typeof methods[key] !== 'function') {
        warn(
          "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
          "Did you reference the function correctly?",
          vm
        );
      }
      if (props && hasOwn(props, key)) {
        warn(
          ("Method \"" + key + "\" has already been defined as a prop."),
          vm
        );
      }
      if ((key in vm) && isReserved(key)) {
        warn(
          "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
          "Avoid defining component methods that start with _ or $."
        );
      }
    }
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}

function initWatch (vm, watch) {
  for (var key in watch) {
    var handler = watch[key];
    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher (
  vm,
  expOrFn,
  handler,
  options
) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(expOrFn, handler, options)
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () { return this._data };
  var propsDef = {};
  propsDef.get = function () { return this._props };
  if (true) {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      );
    };
    propsDef.set = function () {
      warn("$props is readonly.", this);
    };
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);

  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this;
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value);
      } catch (error) {
        handleError(error, vm, ("callback for immediate watcher \"" + (watcher.expression) + "\""));
      }
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  };
}

/*  */

var uid$3 = 0;

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid$3++;

    var startTag, endTag;
    /* istanbul ignore if */
    if ( true && config.performance && mark) {
      startTag = "vue-perf-start:" + (vm._uid);
      endTag = "vue-perf-end:" + (vm._uid);
      mark(startTag);
    }

    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }
    /* istanbul ignore else */
    if (true) {
      initProxy(vm);
    } else {}
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm); // resolve injections before data/props
    initState(vm);
    initProvide(vm); // resolve provide after data/props
    callHook(vm, 'created');

    /* istanbul ignore if */
    if ( true && config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure(("vue " + (vm._name) + " init"), startTag, endTag);
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent (vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options);
  // doing this because it's faster than dynamic enumeration.
  var parentVnode = options._parentVnode;
  opts.parent = options.parent;
  opts._parentVnode = parentVnode;

  var vnodeComponentOptions = parentVnode.componentOptions;
  opts.propsData = vnodeComponentOptions.propsData;
  opts._parentListeners = vnodeComponentOptions.listeners;
  opts._renderChildren = vnodeComponentOptions.children;
  opts._componentTag = vnodeComponentOptions.tag;

  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions (Ctor) {
  var options = Ctor.options;
  if (Ctor.super) {
    var superOptions = resolveConstructorOptions(Ctor.super);
    var cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions;
      // check if there are any late-modified/attached options (#4976)
      var modifiedOptions = resolveModifiedOptions(Ctor);
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor) {
  var modified;
  var latest = Ctor.options;
  var sealed = Ctor.sealedOptions;
  for (var key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) { modified = {}; }
      modified[key] = latest[key];
    }
  }
  return modified
}

function Vue (options) {
  if ( true &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

/*  */

function initUse (Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }
    installedPlugins.push(plugin);
    return this
  };
}

/*  */

function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this
  };
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    var name = extendOptions.name || Super.options.name;
    if ( true && name) {
      validateComponentName(name);
    }

    var Sub = function VueComponent (options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    );
    Sub['super'] = Super;

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps$1(Sub);
    }
    if (Sub.options.computed) {
      initComputed$1(Sub);
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use;

    // create asset registers, so extended classes
    // can have their private assets too.
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options);

    // cache constructor
    cachedCtors[SuperId] = Sub;
    return Sub
  };
}

function initProps$1 (Comp) {
  var props = Comp.options.props;
  for (var key in props) {
    proxy(Comp.prototype, "_props", key);
  }
}

function initComputed$1 (Comp) {
  var computed = Comp.options.computed;
  for (var key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}

/*  */

function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function (type) {
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if ( true && type === 'component') {
          validateComponentName(id);
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition
      }
    };
  });
}

/*  */



function getComponentName (opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches (pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache (keepAliveInstance, filter) {
  var cache = keepAliveInstance.cache;
  var keys = keepAliveInstance.keys;
  var _vnode = keepAliveInstance._vnode;
  for (var key in cache) {
    var cachedNode = cache[key];
    if (cachedNode) {
      var name = getComponentName(cachedNode.componentOptions);
      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

function pruneCacheEntry (
  cache,
  key,
  keys,
  current
) {
  var cached$$1 = cache[key];
  if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
    cached$$1.componentInstance.$destroy();
  }
  cache[key] = null;
  remove(keys, key);
}

var patternTypes = [String, RegExp, Array];

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },

  created: function created () {
    this.cache = Object.create(null);
    this.keys = [];
  },

  destroyed: function destroyed () {
    for (var key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },

  mounted: function mounted () {
    var this$1 = this;

    this.$watch('include', function (val) {
      pruneCache(this$1, function (name) { return matches(val, name); });
    });
    this.$watch('exclude', function (val) {
      pruneCache(this$1, function (name) { return !matches(val, name); });
    });
  },

  render: function render () {
    var slot = this.$slots.default;
    var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;
    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      var ref = this;
      var include = ref.include;
      var exclude = ref.exclude;
      if (
        // not included
        (include && (!name || !matches(include, name))) ||
        // excluded
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      var ref$1 = this;
      var cache = ref$1.cache;
      var keys = ref$1.keys;
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
        : vnode.key;
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance;
        // make current key freshest
        remove(keys, key);
        keys.push(key);
      } else {
        cache[key] = vnode;
        keys.push(key);
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
      }

      vnode.data.keepAlive = true;
    }
    return vnode || (slot && slot[0])
  }
};

var builtInComponents = {
  KeepAlive: KeepAlive
};

/*  */

function initGlobalAPI (Vue) {
  // config
  var configDef = {};
  configDef.get = function () { return config; };
  if (true) {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      );
    };
  }
  Object.defineProperty(Vue, 'config', configDef);

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive$$1
  };

  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  // 2.6 explicit observable API
  Vue.observable = function (obj) {
    observe(obj);
    return obj
  };

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue;

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue);

Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
});

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get: function get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
});

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
});

Vue.version = '2.6.12';

/*  */

// these are reserved for web because they are directly compiled away
// during template compilation
var isReservedAttr = makeMap('style,class');

// attributes that should be using props for binding
var acceptValue = makeMap('input,textarea,option,select,progress');
var mustUseProp = function (tag, type, attr) {
  return (
    (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
};

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

var convertEnumeratedValue = function (key, value) {
  return isFalsyAttrValue(value) || value === 'false'
    ? 'false'
    // allow arbitrary string value for contenteditable
    : key === 'contenteditable' && isValidContentEditableValue(value)
      ? value
      : 'true'
};

var isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
);

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
};

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : ''
};

var isFalsyAttrValue = function (val) {
  return val == null || val === false
};

/*  */

function genClassForVnode (vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;
    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return renderClass(data.staticClass, data.class)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class)
      ? [child.class, parent.class]
      : parent.class
  }
}

function renderClass (
  staticClass,
  dynamicClass
) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  if (Array.isArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  /* istanbul ignore next */
  return ''
}

function stringifyArray (value) {
  var res = '';
  var stringified;
  for (var i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) { res += ' '; }
      res += stringified;
    }
  }
  return res
}

function stringifyObject (value) {
  var res = '';
  for (var key in value) {
    if (value[key]) {
      if (res) { res += ' '; }
      res += key;
    }
  }
  return res
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

var isPreTag = function (tag) { return tag === 'pre'; };

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag)
};

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

var unknownElementCache = Object.create(null);
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

var isTextInputType = makeMap('text,number,password,search,email,tel,url');

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query (el) {
  if (typeof el === 'string') {
    var selected = document.querySelector(el);
    if (!selected) {
       true && warn(
        'Cannot find element: ' + el
      );
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

/*  */

function createElement$1 (tagName, vnode) {
  var elm = document.createElement(tagName);
  if (tagName !== 'select') {
    return elm
  }
  // false or null will remove the attribute but undefined will not
  if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
    elm.setAttribute('multiple', 'multiple');
  }
  return elm
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild (node, child) {
  node.removeChild(child);
}

function appendChild (node, child) {
  node.appendChild(child);
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text;
}

function setStyleScope (node, scopeId) {
  node.setAttribute(scopeId, '');
}

var nodeOps = /*#__PURE__*/Object.freeze({
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  setStyleScope: setStyleScope
});

/*  */

var ref = {
  create: function create (_, vnode) {
    registerRef(vnode);
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true);
  }
};

function registerRef (vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!isDef(key)) { return }

  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);

var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}

function sameInputType (a, b) {
  if (a.tag !== 'input') { return true }
  var i;
  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  var i, key;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) { map[key] = i; }
  }
  return map
}

function createPatchFunction (backend) {
  var i, j;
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove$$1 () {
      if (--remove$$1.listeners === 0) {
        removeNode(childElm);
      }
    }
    remove$$1.listeners = listeners;
    return remove$$1
  }

  function removeNode (el) {
    var parent = nodeOps.parentNode(el);
    // element may have already been removed due to v-html / v-text
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  function isUnknownElement$$1 (vnode, inVPre) {
    return (
      !inVPre &&
      !vnode.ns &&
      !(
        config.ignoredElements.length &&
        config.ignoredElements.some(function (ignore) {
          return isRegExp(ignore)
            ? ignore.test(vnode.tag)
            : ignore === vnode.tag
        })
      ) &&
      config.isUnknownElement(vnode.tag)
    )
  }

  var creatingElmInVPre = 0;

  function createElm (
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render!
      // now it's used as a new node, overwriting its elm would cause
      // potential patch errors down the road when it's used as an insertion
      // reference node. Instead, we clone the node on-demand before creating
      // associated DOM element for it.
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    vnode.isRootInsert = !nested; // for transition enter check
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      if (true) {
        if (data && data.pre) {
          creatingElmInVPre++;
        }
        if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          );
        }
      }

      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode);
      setScope(vnode);

      /* istanbul ignore if */
      {
        createChildren(vnode, children, insertedVnodeQueue);
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }
        insert(parentElm, vnode.elm, refElm);
      }

      if ( true && data && data.pre) {
        creatingElmInVPre--;
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;
    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false /* hydrating */);
      }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        insert(parentElm, vnode.elm, refElm);
        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }
        return true
      }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }
    vnode.elm = vnode.componentInstance.$el;
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode);
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
    var i;
    // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.
    var innerNode = vnode;
    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;
      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }
        insertedVnodeQueue.push(innerNode);
        break
      }
    }
    // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself
    insert(parentElm, vnode.elm, refElm);
  }

  function insert (parent, elm, ref$$1) {
    if (isDef(parent)) {
      if (isDef(ref$$1)) {
        if (nodeOps.parentNode(ref$$1) === parent) {
          nodeOps.insertBefore(parent, elm, ref$$1);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      if (true) {
        checkDuplicateKeys(children);
      }
      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
    }
  }

  function isPatchable (vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (isDef(i.create)) { i.create(emptyNode, vnode); }
      if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    var i;
    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      var ancestor = vnode;
      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i);
        }
        ancestor = ancestor.parent;
      }
    }
    // for slot content they should also get the scopeId from the host instance.
    if (isDef(i = activeInstance) &&
      i !== vnode.context &&
      i !== vnode.fnContext &&
      isDef(i = i.$options._scopeId)
    ) {
      nodeOps.setStyleScope(vnode.elm, i);
    }
  }

  function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
    }
  }

  function invokeDestroyHook (vnode) {
    var i, j;
    var data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes (vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else { // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      var i;
      var listeners = cbs.remove.length + 1;
      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly;

    if (true) {
      checkDuplicateKeys(newCh);
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
        if (isUndef(idxInOld)) { // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
        } else {
          vnodeToMove = oldCh[idxInOld];
          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function checkDuplicateKeys (children) {
    var seenKeys = {};
    for (var i = 0; i < children.length; i++) {
      var vnode = children[i];
      var key = vnode.key;
      if (isDef(key)) {
        if (seenKeys[key]) {
          warn(
            ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
            vnode.context
          );
        } else {
          seenKeys[key] = true;
        }
      }
    }
  }

  function findIdxInOld (node, oldCh, start, end) {
    for (var i = start; i < end; i++) {
      var c = oldCh[i];
      if (isDef(c) && sameVnode(node, c)) { return i }
    }
  }

  function patchVnode (
    oldVnode,
    vnode,
    insertedVnodeQueue,
    ownerArray,
    index,
    removeOnly
  ) {
    if (oldVnode === vnode) {
      return
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    var elm = vnode.elm = oldVnode.elm;

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
      }
      return
    }

    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance;
      return
    }

    var i;
    var data = vnode.data;
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
      if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
      } else if (isDef(ch)) {
        if (true) {
          checkDuplicateKeys(ch);
        }
        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var hydrationBailed = false;
  // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).
  var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

  // Note: this is a browser-only function so we can assume elms are DOM nodes.
  function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
    var i;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    inVPre = inVPre || (data && data.pre);
    vnode.elm = elm;

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true;
      return true
    }
    // assert node match
    if (true) {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false
      }
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if ( true &&
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('server innerHTML: ', i);
                console.warn('client innerHTML: ', elm.innerHTML);
              }
              return false
            }
          } else {
            // iterate and compare children lists
            var childrenMatch = true;
            var childNode = elm.firstChild;
            for (var i$1 = 0; i$1 < children.length; i$1++) {
              if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                childrenMatch = false;
                break
              }
              childNode = childNode.nextSibling;
            }
            // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.
            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if ( true &&
                typeof console !== 'undefined' &&
                !hydrationBailed
              ) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
              }
              return false
            }
          }
        }
      }
      if (isDef(data)) {
        var fullInvoke = false;
        for (var key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true;
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break
          }
        }
        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class']);
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }
    return true
  }

  function assertNodeMatch (node, vnode, inVPre) {
    if (isDef(vnode.tag)) {
      return vnode.tag.indexOf('vue-component') === 0 || (
        !isUnknownElement$$1(vnode, inVPre) &&
        vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
      )
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3)
    }
  }

  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
      return
    }

    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }
          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode
            } else if (true) {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              );
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }

        // replacing existing element
        var oldElm = oldVnode.elm;
        var parentElm = nodeOps.parentNode(oldElm);

        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        );

        // update parent placeholder node element, recursively
        if (isDef(vnode.parent)) {
          var ancestor = vnode.parent;
          var patchable = isPatchable(vnode);
          while (ancestor) {
            for (var i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor);
            }
            ancestor.elm = vnode.elm;
            if (patchable) {
              for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, ancestor);
              }
              // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.
              var insert = ancestor.data.hook.insert;
              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                  insert.fns[i$2]();
                }
              }
            } else {
              registerRef(ancestor);
            }
            ancestor = ancestor.parent;
          }
        }

        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm
  }
}

/*  */

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives (vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives (oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update (oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

  var dirsWithInsert = [];
  var dirsWithPostpatch = [];

  var key, oldDir, dir;
  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];
    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);
      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      dir.oldArg = oldDir.arg;
      callHook$1(dir, 'update', vnode, oldVnode);
      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };
    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1 (
  dirs,
  vm
) {
  var res = Object.create(null);
  if (!dirs) {
    // $flow-disable-line
    return res
  }
  var i, dir;
  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];
    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers;
    }
    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  }
  // $flow-disable-line
  return res
}

function getRawDirName (dir) {
  return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
}

function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
  var fn = dir.def && dir.def[hook];
  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
    }
  }
}

var baseModules = [
  ref,
  directives
];

/*  */

function updateAttrs (oldVnode, vnode) {
  var opts = vnode.componentOptions;
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
    return
  }
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  // #6666: IE/Edge forces progress value down to 1 before setting a max
  /* istanbul ignore if */
  if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value);
  }
  for (key in oldAttrs) {
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr (el, key, value) {
  if (el.tagName.indexOf('-') > -1) {
    baseSetAttr(el, key, value);
  } else if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // technically allowfullscreen is a boolean attribute for <iframe>,
      // but Flash expects a value of "true" when used on <embed> tag
      value = key === 'allowfullscreen' && el.tagName === 'EMBED'
        ? 'true'
        : key;
      el.setAttribute(key, value);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, convertEnumeratedValue(key, value));
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    baseSetAttr(el, key, value);
  }
}

function baseSetAttr (el, key, value) {
  if (isFalsyAttrValue(value)) {
    el.removeAttribute(key);
  } else {
    // #7138: IE10 & 11 fires input event when setting placeholder on
    // <textarea>... block the first input event and remove the blocker
    // immediately.
    /* istanbul ignore if */
    if (
      isIE && !isIE9 &&
      el.tagName === 'TEXTAREA' &&
      key === 'placeholder' && value !== '' && !el.__ieph
    ) {
      var blocker = function (e) {
        e.stopImmediatePropagation();
        el.removeEventListener('input', blocker);
      };
      el.addEventListener('input', blocker);
      // $flow-disable-line
      el.__ieph = true; /* IE placeholder patched */
    }
    el.setAttribute(key, value);
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

/*  */

function updateClass (oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (
    isUndef(data.staticClass) &&
    isUndef(data.class) && (
      isUndef(oldData) || (
        isUndef(oldData.staticClass) &&
        isUndef(oldData.class)
      )
    )
  ) {
    return
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

/*  */

var validDivisionCharRE = /[\w).+\-_$\]]/;

function parseFilters (exp) {
  var inSingle = false;
  var inDouble = false;
  var inTemplateString = false;
  var inRegex = false;
  var curly = 0;
  var square = 0;
  var paren = 0;
  var lastFilterIndex = 0;
  var c, prev, i, expression, filters;

  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
    } else if (
      c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        var j = i - 1;
        var p = (void 0);
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j);
          if (p !== ' ') { break }
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true;
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i]);
    }
  }

  return expression
}

function wrapFilter (exp, filter) {
  var i = filter.indexOf('(');
  if (i < 0) {
    // _f: resolveFilter
    return ("_f(\"" + filter + "\")(" + exp + ")")
  } else {
    var name = filter.slice(0, i);
    var args = filter.slice(i + 1);
    return ("_f(\"" + name + "\")(" + exp + (args !== ')' ? ',' + args : args))
  }
}

/*  */



/* eslint-disable no-unused-vars */
function baseWarn (msg, range) {
  console.error(("[Vue compiler]: " + msg));
}
/* eslint-enable no-unused-vars */

function pluckModuleFunction (
  modules,
  key
) {
  return modules
    ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
    : []
}

function addProp (el, name, value, range, dynamic) {
  (el.props || (el.props = [])).push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
  el.plain = false;
}

function addAttr (el, name, value, range, dynamic) {
  var attrs = dynamic
    ? (el.dynamicAttrs || (el.dynamicAttrs = []))
    : (el.attrs || (el.attrs = []));
  attrs.push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
  el.plain = false;
}

// add a raw attr (use this in preTransforms)
function addRawAttr (el, name, value, range) {
  el.attrsMap[name] = value;
  el.attrsList.push(rangeSetItem({ name: name, value: value }, range));
}

function addDirective (
  el,
  name,
  rawName,
  value,
  arg,
  isDynamicArg,
  modifiers,
  range
) {
  (el.directives || (el.directives = [])).push(rangeSetItem({
    name: name,
    rawName: rawName,
    value: value,
    arg: arg,
    isDynamicArg: isDynamicArg,
    modifiers: modifiers
  }, range));
  el.plain = false;
}

function prependModifierMarker (symbol, name, dynamic) {
  return dynamic
    ? ("_p(" + name + ",\"" + symbol + "\")")
    : symbol + name // mark the event as captured
}

function addHandler (
  el,
  name,
  value,
  modifiers,
  important,
  warn,
  range,
  dynamic
) {
  modifiers = modifiers || emptyObject;
  // warn prevent and passive modifier
  /* istanbul ignore if */
  if (
     true && warn &&
    modifiers.prevent && modifiers.passive
  ) {
    warn(
      'passive and prevent can\'t be used together. ' +
      'Passive handler can\'t prevent default event.',
      range
    );
  }

  // normalize click.right and click.middle since they don't actually fire
  // this is technically browser-specific, but at least for now browsers are
  // the only target envs that have right/middle clicks.
  if (modifiers.right) {
    if (dynamic) {
      name = "(" + name + ")==='click'?'contextmenu':(" + name + ")";
    } else if (name === 'click') {
      name = 'contextmenu';
      delete modifiers.right;
    }
  } else if (modifiers.middle) {
    if (dynamic) {
      name = "(" + name + ")==='click'?'mouseup':(" + name + ")";
    } else if (name === 'click') {
      name = 'mouseup';
    }
  }

  // check capture modifier
  if (modifiers.capture) {
    delete modifiers.capture;
    name = prependModifierMarker('!', name, dynamic);
  }
  if (modifiers.once) {
    delete modifiers.once;
    name = prependModifierMarker('~', name, dynamic);
  }
  /* istanbul ignore if */
  if (modifiers.passive) {
    delete modifiers.passive;
    name = prependModifierMarker('&', name, dynamic);
  }

  var events;
  if (modifiers.native) {
    delete modifiers.native;
    events = el.nativeEvents || (el.nativeEvents = {});
  } else {
    events = el.events || (el.events = {});
  }

  var newHandler = rangeSetItem({ value: value.trim(), dynamic: dynamic }, range);
  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers;
  }

  var handlers = events[name];
  /* istanbul ignore if */
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
  } else {
    events[name] = newHandler;
  }

  el.plain = false;
}

function getRawBindingAttr (
  el,
  name
) {
  return el.rawAttrsMap[':' + name] ||
    el.rawAttrsMap['v-bind:' + name] ||
    el.rawAttrsMap[name]
}

function getBindingAttr (
  el,
  name,
  getStatic
) {
  var dynamicValue =
    getAndRemoveAttr(el, ':' + name) ||
    getAndRemoveAttr(el, 'v-bind:' + name);
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    var staticValue = getAndRemoveAttr(el, name);
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

// note: this only removes the attr from the Array (attrsList) so that it
// doesn't get processed by processAttrs.
// By default it does NOT remove it from the map (attrsMap) because the map is
// needed during codegen.
function getAndRemoveAttr (
  el,
  name,
  removeFromMap
) {
  var val;
  if ((val = el.attrsMap[name]) != null) {
    var list = el.attrsList;
    for (var i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break
      }
    }
  }
  if (removeFromMap) {
    delete el.attrsMap[name];
  }
  return val
}

function getAndRemoveAttrByRegex (
  el,
  name
) {
  var list = el.attrsList;
  for (var i = 0, l = list.length; i < l; i++) {
    var attr = list[i];
    if (name.test(attr.name)) {
      list.splice(i, 1);
      return attr
    }
  }
}

function rangeSetItem (
  item,
  range
) {
  if (range) {
    if (range.start != null) {
      item.start = range.start;
    }
    if (range.end != null) {
      item.end = range.end;
    }
  }
  return item
}

/*  */

/**
 * Cross-platform code generation for component v-model
 */
function genComponentModel (
  el,
  value,
  modifiers
) {
  var ref = modifiers || {};
  var number = ref.number;
  var trim = ref.trim;

  var baseValueExpression = '$$v';
  var valueExpression = baseValueExpression;
  if (trim) {
    valueExpression =
      "(typeof " + baseValueExpression + " === 'string'" +
      "? " + baseValueExpression + ".trim()" +
      ": " + baseValueExpression + ")";
  }
  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }
  var assignment = genAssignmentCode(value, valueExpression);

  el.model = {
    value: ("(" + value + ")"),
    expression: JSON.stringify(value),
    callback: ("function (" + baseValueExpression + ") {" + assignment + "}")
  };
}

/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
function genAssignmentCode (
  value,
  assignment
) {
  var res = parseModel(value);
  if (res.key === null) {
    return (value + "=" + assignment)
  } else {
    return ("$set(" + (res.exp) + ", " + (res.key) + ", " + assignment + ")")
  }
}

/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */

var len, str, chr, index$1, expressionPos, expressionEndPos;



function parseModel (val) {
  // Fix https://github.com/vuejs/vue/pull/7730
  // allow v-model="obj.val " (trailing whitespace)
  val = val.trim();
  len = val.length;

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    index$1 = val.lastIndexOf('.');
    if (index$1 > -1) {
      return {
        exp: val.slice(0, index$1),
        key: '"' + val.slice(index$1 + 1) + '"'
      }
    } else {
      return {
        exp: val,
        key: null
      }
    }
  }

  str = val;
  index$1 = expressionPos = expressionEndPos = 0;

  while (!eof()) {
    chr = next();
    /* istanbul ignore if */
    if (isStringStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5B) {
      parseBracket(chr);
    }
  }

  return {
    exp: val.slice(0, expressionPos),
    key: val.slice(expressionPos + 1, expressionEndPos)
  }
}

function next () {
  return str.charCodeAt(++index$1)
}

function eof () {
  return index$1 >= len
}

function isStringStart (chr) {
  return chr === 0x22 || chr === 0x27
}

function parseBracket (chr) {
  var inBracket = 1;
  expressionPos = index$1;
  while (!eof()) {
    chr = next();
    if (isStringStart(chr)) {
      parseString(chr);
      continue
    }
    if (chr === 0x5B) { inBracket++; }
    if (chr === 0x5D) { inBracket--; }
    if (inBracket === 0) {
      expressionEndPos = index$1;
      break
    }
  }
}

function parseString (chr) {
  var stringQuote = chr;
  while (!eof()) {
    chr = next();
    if (chr === stringQuote) {
      break
    }
  }
}

/*  */

var warn$1;

// in some cases, the event used has to be determined at runtime
// so we used some reserved tokens during compile.
var RANGE_TOKEN = '__r';
var CHECKBOX_RADIO_TOKEN = '__c';

function model (
  el,
  dir,
  _warn
) {
  warn$1 = _warn;
  var value = dir.value;
  var modifiers = dir.modifiers;
  var tag = el.tag;
  var type = el.attrsMap.type;

  if (true) {
    // inputs with type="file" are read only and setting the input's
    // value will throw an error.
    if (tag === 'input' && type === 'file') {
      warn$1(
        "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
        "File inputs are read only. Use a v-on:change listener instead.",
        el.rawAttrsMap['v-model']
      );
    }
  }

  if (el.component) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (tag === 'select') {
    genSelect(el, value, modifiers);
  } else if (tag === 'input' && type === 'checkbox') {
    genCheckboxModel(el, value, modifiers);
  } else if (tag === 'input' && type === 'radio') {
    genRadioModel(el, value, modifiers);
  } else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers);
  } else if (!config.isReservedTag(tag)) {
    genComponentModel(el, value, modifiers);
    // component v-model doesn't need extra runtime
    return false
  } else if (true) {
    warn$1(
      "<" + (el.tag) + " v-model=\"" + value + "\">: " +
      "v-model is not supported on this element type. " +
      'If you are working with contenteditable, it\'s recommended to ' +
      'wrap a library dedicated for that purpose inside a custom component.',
      el.rawAttrsMap['v-model']
    );
  }

  // ensure runtime directive metadata
  return true
}

function genCheckboxModel (
  el,
  value,
  modifiers
) {
  var number = modifiers && modifiers.number;
  var valueBinding = getBindingAttr(el, 'value') || 'null';
  var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
  var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
  addProp(el, 'checked',
    "Array.isArray(" + value + ")" +
    "?_i(" + value + "," + valueBinding + ")>-1" + (
      trueValueBinding === 'true'
        ? (":(" + value + ")")
        : (":_q(" + value + "," + trueValueBinding + ")")
    )
  );
  addHandler(el, 'change',
    "var $$a=" + value + "," +
        '$$el=$event.target,' +
        "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
    'if(Array.isArray($$a)){' +
      "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
          '$$i=_i($$a,$$v);' +
      "if($$el.checked){$$i<0&&(" + (genAssignmentCode(value, '$$a.concat([$$v])')) + ")}" +
      "else{$$i>-1&&(" + (genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))')) + ")}" +
    "}else{" + (genAssignmentCode(value, '$$c')) + "}",
    null, true
  );
}

function genRadioModel (
  el,
  value,
  modifiers
) {
  var number = modifiers && modifiers.number;
  var valueBinding = getBindingAttr(el, 'value') || 'null';
  valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
  addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
  addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
}

function genSelect (
  el,
  value,
  modifiers
) {
  var number = modifiers && modifiers.number;
  var selectedVal = "Array.prototype.filter" +
    ".call($event.target.options,function(o){return o.selected})" +
    ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
    "return " + (number ? '_n(val)' : 'val') + "})";

  var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
  var code = "var $$selectedVal = " + selectedVal + ";";
  code = code + " " + (genAssignmentCode(value, assignment));
  addHandler(el, 'change', code, null, true);
}

function genDefaultModel (
  el,
  value,
  modifiers
) {
  var type = el.attrsMap.type;

  // warn if v-bind:value conflicts with v-model
  // except for inputs with v-bind:type
  if (true) {
    var value$1 = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];
    var typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
    if (value$1 && !typeBinding) {
      var binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
      warn$1(
        binding + "=\"" + value$1 + "\" conflicts with v-model on the same element " +
        'because the latter already expands to a value binding internally',
        el.rawAttrsMap[binding]
      );
    }
  }

  var ref = modifiers || {};
  var lazy = ref.lazy;
  var number = ref.number;
  var trim = ref.trim;
  var needCompositionGuard = !lazy && type !== 'range';
  var event = lazy
    ? 'change'
    : type === 'range'
      ? RANGE_TOKEN
      : 'input';

  var valueExpression = '$event.target.value';
  if (trim) {
    valueExpression = "$event.target.value.trim()";
  }
  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }

  var code = genAssignmentCode(value, valueExpression);
  if (needCompositionGuard) {
    code = "if($event.target.composing)return;" + code;
  }

  addProp(el, 'value', ("(" + value + ")"));
  addHandler(el, event, code, null, true);
  if (trim || number) {
    addHandler(el, 'blur', '$forceUpdate()');
  }
}

/*  */

// normalize v-model event tokens that can only be determined at runtime.
// it's important to place the event as the first in the array because
// the whole point is ensuring the v-model callback gets called before
// user-attached handlers.
function normalizeEvents (on) {
  /* istanbul ignore if */
  if (isDef(on[RANGE_TOKEN])) {
    // IE input[type=range] only supports `change` event
    var event = isIE ? 'change' : 'input';
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
    delete on[RANGE_TOKEN];
  }
  // This was originally intended to fix #4521 but no longer necessary
  // after 2.5. Keeping it for backwards compat with generated code from < 2.4
  /* istanbul ignore if */
  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
    delete on[CHECKBOX_RADIO_TOKEN];
  }
}

var target$1;

function createOnceHandler$1 (event, handler, capture) {
  var _target = target$1; // save current target element in closure
  return function onceHandler () {
    var res = handler.apply(null, arguments);
    if (res !== null) {
      remove$2(event, onceHandler, capture, _target);
    }
  }
}

// #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
// implementation and does not fire microtasks in between event propagation, so
// safe to exclude.
var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

function add$1 (
  name,
  handler,
  capture,
  passive
) {
  // async edge case #6566: inner click event triggers patch, event handler
  // attached to outer element during patch, and triggered again. This
  // happens because browsers fire microtask ticks between event propagation.
  // the solution is simple: we save the timestamp when a handler is attached,
  // and the handler would only fire if the event passed to it was fired
  // AFTER it was attached.
  if (useMicrotaskFix) {
    var attachedTimestamp = currentFlushTimestamp;
    var original = handler;
    handler = original._wrapper = function (e) {
      if (
        // no bubbling, should always fire.
        // this is just a safety net in case event.timeStamp is unreliable in
        // certain weird environments...
        e.target === e.currentTarget ||
        // event is fired after handler attachment
        e.timeStamp >= attachedTimestamp ||
        // bail for environments that have buggy event.timeStamp implementations
        // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
        // #9681 QtWebEngine event.timeStamp is negative value
        e.timeStamp <= 0 ||
        // #9448 bail if event is fired in another document in a multi-page
        // electron/nw.js app, since event.timeStamp will be using a different
        // starting reference
        e.target.ownerDocument !== document
      ) {
        return original.apply(this, arguments)
      }
    };
  }
  target$1.addEventListener(
    name,
    handler,
    supportsPassive
      ? { capture: capture, passive: passive }
      : capture
  );
}

function remove$2 (
  name,
  handler,
  capture,
  _target
) {
  (_target || target$1).removeEventListener(
    name,
    handler._wrapper || handler,
    capture
  );
}

function updateDOMListeners (oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  normalizeEvents(on);
  updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
  target$1 = undefined;
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

/*  */

var svgContainer;

function updateDOMProps (oldVnode, vnode) {
  if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
    return
  }
  var key, cur;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (!(key in props)) {
      elm[key] = '';
    }
  }

  for (key in props) {
    cur = props[key];
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) { vnode.children.length = 0; }
      if (cur === oldProps[key]) { continue }
      // #6601 work around Chrome version <= 55 bug where single textNode
      // replaced by innerHTML/textContent retains its parentNode property
      if (elm.childNodes.length === 1) {
        elm.removeChild(elm.childNodes[0]);
      }
    }

    if (key === 'value' && elm.tagName !== 'PROGRESS') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = isUndef(cur) ? '' : String(cur);
      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur;
      }
    } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
      // IE doesn't support innerHTML for SVG elements
      svgContainer = svgContainer || document.createElement('div');
      svgContainer.innerHTML = "<svg>" + cur + "</svg>";
      var svg = svgContainer.firstChild;
      while (elm.firstChild) {
        elm.removeChild(elm.firstChild);
      }
      while (svg.firstChild) {
        elm.appendChild(svg.firstChild);
      }
    } else if (
      // skip the update if old and new VDOM state is the same.
      // `value` is handled separately because the DOM value may be temporarily
      // out of sync with VDOM state due to focus, composition and modifiers.
      // This  #4521 by skipping the unnecessary `checked` update.
      cur !== oldProps[key]
    ) {
      // some property updates can throw
      // e.g. `value` on <progress> w/ non-finite value
      try {
        elm[key] = cur;
      } catch (e) {}
    }
  }
}

// check platforms/web/util/attrs.js acceptValue


function shouldUpdateValue (elm, checkVal) {
  return (!elm.composing && (
    elm.tagName === 'OPTION' ||
    isNotInFocusAndDirty(elm, checkVal) ||
    isDirtyWithModifiers(elm, checkVal)
  ))
}

function isNotInFocusAndDirty (elm, checkVal) {
  // return true when textbox (.number and .trim) loses focus and its value is
  // not equal to the updated value
  var notInFocus = true;
  // #6157
  // work around IE bug when accessing document.activeElement in an iframe
  try { notInFocus = document.activeElement !== elm; } catch (e) {}
  return notInFocus && elm.value !== checkVal
}

function isDirtyWithModifiers (elm, newVal) {
  var value = elm.value;
  var modifiers = elm._vModifiers; // injected by v-model runtime
  if (isDef(modifiers)) {
    if (modifiers.number) {
      return toNumber(value) !== toNumber(newVal)
    }
    if (modifiers.trim) {
      return value.trim() !== newVal.trim()
    }
  }
  return value !== newVal
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

/*  */

var parseStyleText = cached(function (cssText) {
  var res = {};
  var listDelimiter = /;(?![^(]*\))/g;
  var propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      var tmp = item.split(propertyDelimiter);
      tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return res
});

// merge static and dynamic style data on the same vnode
function normalizeStyleData (data) {
  var style = normalizeStyleBinding(data.style);
  // static style is pre-processed into an object during compilation
  // and is always a fresh object, so it's safe to merge into it
  return data.staticStyle
    ? extend(data.staticStyle, style)
    : style
}

// normalize possible array / string values into Object
function normalizeStyleBinding (bindingStyle) {
  if (Array.isArray(bindingStyle)) {
    return toObject(bindingStyle)
  }
  if (typeof bindingStyle === 'string') {
    return parseStyleText(bindingStyle)
  }
  return bindingStyle
}

/**
 * parent component style should be after child's
 * so that parent component's style could override it
 */
function getStyle (vnode, checkChild) {
  var res = {};
  var styleData;

  if (checkChild) {
    var childNode = vnode;
    while (childNode.componentInstance) {
      childNode = childNode.componentInstance._vnode;
      if (
        childNode && childNode.data &&
        (styleData = normalizeStyleData(childNode.data))
      ) {
        extend(res, styleData);
      }
    }
  }

  if ((styleData = normalizeStyleData(vnode.data))) {
    extend(res, styleData);
  }

  var parentNode = vnode;
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
      extend(res, styleData);
    }
  }
  return res
}

/*  */

var cssVarRE = /^--/;
var importantRE = /\s*!important$/;
var setProp = function (el, name, val) {
  /* istanbul ignore if */
  if (cssVarRE.test(name)) {
    el.style.setProperty(name, val);
  } else if (importantRE.test(val)) {
    el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
  } else {
    var normalizedName = normalize(name);
    if (Array.isArray(val)) {
      // Support values array created by autoprefixer, e.g.
      // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
      // Set them one by one, and the browser will only set those it can recognize
      for (var i = 0, len = val.length; i < len; i++) {
        el.style[normalizedName] = val[i];
      }
    } else {
      el.style[normalizedName] = val;
    }
  }
};

var vendorNames = ['Webkit', 'Moz', 'ms'];

var emptyStyle;
var normalize = cached(function (prop) {
  emptyStyle = emptyStyle || document.createElement('div').style;
  prop = camelize(prop);
  if (prop !== 'filter' && (prop in emptyStyle)) {
    return prop
  }
  var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < vendorNames.length; i++) {
    var name = vendorNames[i] + capName;
    if (name in emptyStyle) {
      return name
    }
  }
});

function updateStyle (oldVnode, vnode) {
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (isUndef(data.staticStyle) && isUndef(data.style) &&
    isUndef(oldData.staticStyle) && isUndef(oldData.style)
  ) {
    return
  }

  var cur, name;
  var el = vnode.elm;
  var oldStaticStyle = oldData.staticStyle;
  var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

  // if static style exists, stylebinding already merged into it when doing normalizeStyleData
  var oldStyle = oldStaticStyle || oldStyleBinding;

  var style = normalizeStyleBinding(vnode.data.style) || {};

  // store normalized style under a different key for next diff
  // make sure to clone it if it's reactive, since the user likely wants
  // to mutate it.
  vnode.data.normalizedStyle = isDef(style.__ob__)
    ? extend({}, style)
    : style;

  var newStyle = getStyle(vnode, true);

  for (name in oldStyle) {
    if (isUndef(newStyle[name])) {
      setProp(el, name, '');
    }
  }
  for (name in newStyle) {
    cur = newStyle[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      setProp(el, name, cur == null ? '' : cur);
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/*  */

var whitespaceRE = /\s+/;

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return
  }

  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); });
    } else {
      el.classList.remove(cls);
    }
    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    cur = cur.trim();
    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}

/*  */

function resolveTransition (def$$1) {
  if (!def$$1) {
    return
  }
  /* istanbul ignore else */
  if (typeof def$$1 === 'object') {
    var res = {};
    if (def$$1.css !== false) {
      extend(res, autoCssTransition(def$$1.name || 'v'));
    }
    extend(res, def$$1);
    return res
  } else if (typeof def$$1 === 'string') {
    return autoCssTransition(def$$1)
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    enterToClass: (name + "-enter-to"),
    enterActiveClass: (name + "-enter-active"),
    leaveClass: (name + "-leave"),
    leaveToClass: (name + "-leave-to"),
    leaveActiveClass: (name + "-leave-active")
  }
});

var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  ) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  ) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

// binding to window is necessary to make hot reload work in IE in strict mode
var raf = inBrowser
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : /* istanbul ignore next */ function (fn) { return fn(); };

function nextFrame (fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass (el, cls) {
  var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function () {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end();
      }
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo (el, expectedType) {
  var styles = window.getComputedStyle(el);
  // JSDOM may return undefined for transition properties
  var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
  var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
  var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
  var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null;
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0;
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  /* istanbul ignore next */
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }

  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

// Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
// in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down (i.e. acting
// as a floor function) causing unexpected behaviors
function toMs (s) {
  return Number(s.slice(0, -1).replace(',', '.')) * 1000
}

/*  */

function enter (vnode, toggleDisplay) {
  var el = vnode.elm;

  // call leave callback now
  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data)) {
    return
  }

  /* istanbul ignore if */
  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;
  var duration = data.duration;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;
  while (transitionNode && transitionNode.parent) {
    context = transitionNode.context;
    transitionNode = transitionNode.parent;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear && appearClass
    ? appearClass
    : enterClass;
  var activeClass = isAppear && appearActiveClass
    ? appearActiveClass
    : enterActiveClass;
  var toClass = isAppear && appearToClass
    ? appearToClass
    : enterToClass;

  var beforeEnterHook = isAppear
    ? (beforeAppear || beforeEnter)
    : beforeEnter;
  var enterHook = isAppear
    ? (typeof appear === 'function' ? appear : enter)
    : enter;
  var afterEnterHook = isAppear
    ? (afterAppear || afterEnter)
    : afterEnter;
  var enterCancelledHook = isAppear
    ? (appearCancelled || enterCancelled)
    : enterCancelled;

  var explicitEnterDuration = toNumber(
    isObject(duration)
      ? duration.enter
      : duration
  );

  if ( true && explicitEnterDuration != null) {
    checkDuration(explicitEnterDuration, 'enter', vnode);
  }

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(enterHook);

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode, 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];
      if (pendingNode &&
        pendingNode.tag === vnode.tag &&
        pendingNode.elm._leaveCb
      ) {
        pendingNode.elm._leaveCb();
      }
      enterHook && enterHook(el, cb);
    });
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      removeTransitionClass(el, startClass);
      if (!cb.cancelled) {
        addTransitionClass(el, toClass);
        if (!userWantsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration);
          } else {
            whenTransitionEnds(el, type, cb);
          }
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave (vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (isUndef(data) || el.nodeType !== 1) {
    return rm()
  }

  /* istanbul ignore if */
  if (isDef(el._leaveCb)) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;
  var duration = data.duration;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = getHookArgumentsLength(leave);

  var explicitLeaveDuration = toNumber(
    isObject(duration)
      ? duration.leave
      : duration
  );

  if ( true && isDef(explicitLeaveDuration)) {
    checkDuration(explicitLeaveDuration, 'leave', vnode);
  }

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show && el.parentNode) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled) {
          addTransitionClass(el, leaveToClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitLeaveDuration)) {
              setTimeout(cb, explicitLeaveDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

// only used in dev mode
function checkDuration (val, name, vnode) {
  if (typeof val !== 'number') {
    warn(
      "<transition> explicit " + name + " duration is not a valid number - " +
      "got " + (JSON.stringify(val)) + ".",
      vnode.context
    );
  } else if (isNaN(val)) {
    warn(
      "<transition> explicit " + name + " duration is NaN - " +
      'the duration expression might be incorrect.',
      vnode.context
    );
  }
}

function isValidDuration (val) {
  return typeof val === 'number' && !isNaN(val)
}

/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */
function getHookArgumentsLength (fn) {
  if (isUndef(fn)) {
    return false
  }
  var invokerFns = fn.fns;
  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(
      Array.isArray(invokerFns)
        ? invokerFns[0]
        : invokerFns
    )
  } else {
    return (fn._length || fn.length) > 1
  }
}

function _enter (_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = inBrowser ? {
  create: _enter,
  activate: _enter,
  remove: function remove$$1 (vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
];

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules);

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var directive = {
  inserted: function inserted (el, binding, vnode, oldVnode) {
    if (vnode.tag === 'select') {
      // #6903
      if (oldVnode.elm && !oldVnode.elm._vOptions) {
        mergeVNodeHook(vnode, 'postpatch', function () {
          directive.componentUpdated(el, binding, vnode);
        });
      } else {
        setSelected(el, binding, vnode.context);
      }
      el._vOptions = [].map.call(el.options, getValue);
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers;
      if (!binding.modifiers.lazy) {
        el.addEventListener('compositionstart', onCompositionStart);
        el.addEventListener('compositionend', onCompositionEnd);
        // Safari < 10.2 & UIWebView doesn't fire compositionend when
        // switching focus before confirming composition choice
        // this also fixes the issue where some browsers e.g. iOS Chrome
        // fires "change" instead of "input" on autocomplete.
        el.addEventListener('change', onCompositionEnd);
        /* istanbul ignore if */
        if (isIE9) {
          el.vmodel = true;
        }
      }
    }
  },

  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matching
      // option in the DOM.
      var prevOptions = el._vOptions;
      var curOptions = el._vOptions = [].map.call(el.options, getValue);
      if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
        // trigger change event if
        // no matching option found for at least one value
        var needReset = el.multiple
          ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
          : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
        if (needReset) {
          trigger(el, 'change');
        }
      }
    }
  }
};

function setSelected (el, binding, vm) {
  actuallySetSelected(el, binding, vm);
  /* istanbul ignore if */
  if (isIE || isEdge) {
    setTimeout(function () {
      actuallySetSelected(el, binding, vm);
    }, 0);
  }
}

function actuallySetSelected (el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;
  if (isMultiple && !Array.isArray(value)) {
     true && warn(
      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    );
    return
  }
  var selected, option;
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i];
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1;
      if (option.selected !== selected) {
        option.selected = selected;
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i;
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1;
  }
}

function hasNoMatchingOption (value, options) {
  return options.every(function (o) { return !looseEqual(o, value); })
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true;
}

function onCompositionEnd (e) {
  // prevent triggering an input event for no reason
  if (!e.target.composing) { return }
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger (el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.componentInstance._vnode)
    : vnode
}

var show = {
  bind: function bind (el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    var originalDisplay = el.__vOriginalDisplay =
      el.style.display === 'none' ? '' : el.style.display;
    if (value && transition$$1) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.style.display = originalDisplay;
      });
    } else {
      el.style.display = value ? originalDisplay : 'none';
    }
  },

  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (!value === !oldValue) { return }
    vnode = locateNode(vnode);
    var transition$$1 = vnode.data && vnode.data.transition;
    if (transition$$1) {
      vnode.data.show = true;
      if (value) {
        enter(vnode, function () {
          el.style.display = el.__vOriginalDisplay;
        });
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none';
    }
  },

  unbind: function unbind (
    el,
    binding,
    vnode,
    oldVnode,
    isDestroy
  ) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay;
    }
  }
};

var platformDirectives = {
  model: directive,
  show: show
};

/*  */

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
};

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }
  return data
}

function placeholder (h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    })
  }
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };

var isVShowDirective = function (d) { return d.name === 'show'; };

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render: function render (h) {
    var this$1 = this;

    var children = this.$slots.default;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(isNotTextNode);
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if ( true && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if ( true &&
      mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      );
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    var id = "__transition-" + (this._uid) + "-";
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(isVShowDirective)) {
      child.data.show = true;
    }

    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild) &&
      // #6687 component root is a comment node
      !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
    ) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data);
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        });
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild
        }
        var delayedLeave;
        var performLeave = function () { delayedLeave(); };
        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
      }
    }

    return rawChild
  }
};

/*  */

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  beforeMount: function beforeMount () {
    var this$1 = this;

    var update = this._update;
    this._update = function (vnode, hydrating) {
      var restoreActiveInstance = setActiveInstance(this$1);
      // force removing pass
      this$1.__patch__(
        this$1._vnode,
        this$1.kept,
        false, // hydrating
        true // removeOnly (!important, avoids unnecessary moves)
      );
      this$1._vnode = this$1.kept;
      restoreActiveInstance();
      update.call(this$1, vnode, hydrating);
    };
  },

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c);
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData;
        } else if (true) {
          var opts = c.componentOptions;
          var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
          warn(("<transition-group> children must be keyed: <" + name + ">"));
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1];
        c$1.data.transition = transitionData;
        c$1.data.pos = c$1.elm.getBoundingClientRect();
        if (map[c$1.key]) {
          kept.push(c$1);
        } else {
          removed.push(c$1);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children)
  },

  updated: function updated () {
    var children = this.prevChildren;
    var moveClass = this.moveClass || ((this.name || 'v') + '-move');
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs);
    children.forEach(recordPosition);
    children.forEach(applyTranslation);

    // force reflow to put everything in position
    // assign to this to avoid being removed in tree-shaking
    // $flow-disable-line
    this._reflow = document.body.offsetHeight;

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm;
        var s = el.style;
        addTransitionClass(el, moveClass);
        s.transform = s.WebkitTransform = s.transitionDuration = '';
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (e && e.target !== el) {
            return
          }
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb);
            el._moveCb = null;
            removeTransitionClass(el, moveClass);
          }
        });
      }
    });
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      /* istanbul ignore if */
      if (this._hasMove) {
        return this._hasMove
      }
      // Detect whether an element with the move class applied has
      // CSS transitions. Since the element may be inside an entering
      // transition at this very moment, we make a clone of it and remove
      // all other transition classes applied to ensure only the move class
      // is applied.
      var clone = el.cloneNode();
      if (el._transitionClasses) {
        el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
      }
      addClass(clone, moveClass);
      clone.style.display = 'none';
      this.$el.appendChild(clone);
      var info = getTransitionInfo(clone);
      this.$el.removeChild(clone);
      return (this._hasMove = info.hasTransform)
    }
  }
};

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb();
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb();
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect();
}

function applyTranslation (c) {
  var oldPos = c.data.pos;
  var newPos = c.data.newPos;
  var dx = oldPos.left - newPos.left;
  var dy = oldPos.top - newPos.top;
  if (dx || dy) {
    c.data.moved = true;
    var s = c.elm.style;
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
    s.transitionDuration = '0s';
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};

/*  */

// install platform specific utils
Vue.config.mustUseProp = mustUseProp;
Vue.config.isReservedTag = isReservedTag;
Vue.config.isReservedAttr = isReservedAttr;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.isUnknownElement = isUnknownElement;

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives);
extend(Vue.options.components, platformComponents);

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop;

// public mount method
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && inBrowser ? query(el) : undefined;
  return mountComponent(this, el, hydrating)
};

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(function () {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue);
      } else if (
        true
      ) {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        );
      }
    }
    if ( true &&
      config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        "You are running Vue in development mode.\n" +
        "Make sure to turn on production mode when deploying for production.\n" +
        "See more tips at https://vuejs.org/guide/deployment.html"
      );
    }
  }, 0);
}

/*  */

var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

var buildRegex = cached(function (delimiters) {
  var open = delimiters[0].replace(regexEscapeRE, '\\$&');
  var close = delimiters[1].replace(regexEscapeRE, '\\$&');
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
});



function parseText (
  text,
  delimiters
) {
  var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
  if (!tagRE.test(text)) {
    return
  }
  var tokens = [];
  var rawTokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, tokenValue;
  while ((match = tagRE.exec(text))) {
    index = match.index;
    // push text token
    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index));
      tokens.push(JSON.stringify(tokenValue));
    }
    // tag token
    var exp = parseFilters(match[1].trim());
    tokens.push(("_s(" + exp + ")"));
    rawTokens.push({ '@binding': exp });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex));
    tokens.push(JSON.stringify(tokenValue));
  }
  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  }
}

/*  */

function transformNode (el, options) {
  var warn = options.warn || baseWarn;
  var staticClass = getAndRemoveAttr(el, 'class');
  if ( true && staticClass) {
    var res = parseText(staticClass, options.delimiters);
    if (res) {
      warn(
        "class=\"" + staticClass + "\": " +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.',
        el.rawAttrsMap['class']
      );
    }
  }
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass);
  }
  var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
  if (classBinding) {
    el.classBinding = classBinding;
  }
}

function genData (el) {
  var data = '';
  if (el.staticClass) {
    data += "staticClass:" + (el.staticClass) + ",";
  }
  if (el.classBinding) {
    data += "class:" + (el.classBinding) + ",";
  }
  return data
}

var klass$1 = {
  staticKeys: ['staticClass'],
  transformNode: transformNode,
  genData: genData
};

/*  */

function transformNode$1 (el, options) {
  var warn = options.warn || baseWarn;
  var staticStyle = getAndRemoveAttr(el, 'style');
  if (staticStyle) {
    /* istanbul ignore if */
    if (true) {
      var res = parseText(staticStyle, options.delimiters);
      if (res) {
        warn(
          "style=\"" + staticStyle + "\": " +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div style="{{ val }}">, use <div :style="val">.',
          el.rawAttrsMap['style']
        );
      }
    }
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
  }

  var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
  if (styleBinding) {
    el.styleBinding = styleBinding;
  }
}

function genData$1 (el) {
  var data = '';
  if (el.staticStyle) {
    data += "staticStyle:" + (el.staticStyle) + ",";
  }
  if (el.styleBinding) {
    data += "style:(" + (el.styleBinding) + "),";
  }
  return data
}

var style$1 = {
  staticKeys: ['staticStyle'],
  transformNode: transformNode$1,
  genData: genData$1
};

/*  */

var decoder;

var he = {
  decode: function decode (html) {
    decoder = decoder || document.createElement('div');
    decoder.innerHTML = html;
    return decoder.textContent
  }
};

/*  */

var isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr'
);

// Elements that you can, intentionally, leave open
// (and which close themselves)
var canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
);

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
var isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track'
);

/**
 * Not type-checking this file because it's mostly vendor code.
 */

// Regular Expressions for parsing tags and attributes
var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*";
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
var startTagOpen = new RegExp(("^<" + qnameCapture));
var startTagClose = /^\s*(\/?)>/;
var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
var doctype = /^<!DOCTYPE [^>]+>/i;
// #7298: escape - to avoid being passed as HTML comment when inlined in page
var comment = /^<!\--/;
var conditionalComment = /^<!\[/;

// Special Elements (can contain anything)
var isPlainTextElement = makeMap('script,style,textarea', true);
var reCache = {};

var decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t',
  '&#39;': "'"
};
var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;

// #5992
var isIgnoreNewlineTag = makeMap('pre,textarea', true);
var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };

function decodeAttr (value, shouldDecodeNewlines) {
  var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
  return value.replace(re, function (match) { return decodingMap[match]; })
}

function parseHTML (html, options) {
  var stack = [];
  var expectHTML = options.expectHTML;
  var isUnaryTag$$1 = options.isUnaryTag || no;
  var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
  var index = 0;
  var last, lastTag;
  while (html) {
    last = html;
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        // Comment:
        if (comment.test(html)) {
          var commentEnd = html.indexOf('-->');

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
            }
            advance(commentEnd + 3);
            continue
          }
        }

        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          var conditionalEnd = html.indexOf(']>');

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2);
            continue
          }
        }

        // Doctype:
        var doctypeMatch = html.match(doctype);
        if (doctypeMatch) {
          advance(doctypeMatch[0].length);
          continue
        }

        // End tag:
        var endTagMatch = html.match(endTag);
        if (endTagMatch) {
          var curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[1], curIndex, index);
          continue
        }

        // Start tag:
        var startTagMatch = parseStartTag();
        if (startTagMatch) {
          handleStartTag(startTagMatch);
          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1);
          }
          continue
        }
      }

      var text = (void 0), rest = (void 0), next = (void 0);
      if (textEnd >= 0) {
        rest = html.slice(textEnd);
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1);
          if (next < 0) { break }
          textEnd += next;
          rest = html.slice(textEnd);
        }
        text = html.substring(0, textEnd);
      }

      if (textEnd < 0) {
        text = html;
      }

      if (text) {
        advance(text.length);
      }

      if (options.chars && text) {
        options.chars(text, index - text.length, index);
      }
    } else {
      var endTagLength = 0;
      var stackedTag = lastTag.toLowerCase();
      var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
      var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length;
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
        }
        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1);
        }
        if (options.chars) {
          options.chars(text);
        }
        return ''
      });
      index += html.length - rest$1.length;
      html = rest$1;
      parseEndTag(stackedTag, index - endTagLength, index);
    }

    if (html === last) {
      options.chars && options.chars(html);
      if ( true && !stack.length && options.warn) {
        options.warn(("Mal-formatted tag at end of template: \"" + html + "\""), { start: index + html.length });
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag();

  function advance (n) {
    index += n;
    html = html.substring(n);
  }

  function parseStartTag () {
    var start = html.match(startTagOpen);
    if (start) {
      var match = {
        tagName: start[1],
        attrs: [],
        start: index
      };
      advance(start[0].length);
      var end, attr;
      while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
        attr.start = index;
        advance(attr[0].length);
        attr.end = index;
        match.attrs.push(attr);
      }
      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match
      }
    }
  }

  function handleStartTag (match) {
    var tagName = match.tagName;
    var unarySlash = match.unarySlash;

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag);
      }
      if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
        parseEndTag(tagName);
      }
    }

    var unary = isUnaryTag$$1(tagName) || !!unarySlash;

    var l = match.attrs.length;
    var attrs = new Array(l);
    for (var i = 0; i < l; i++) {
      var args = match.attrs[i];
      var value = args[3] || args[4] || args[5] || '';
      var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
        ? options.shouldDecodeNewlinesForHref
        : options.shouldDecodeNewlines;
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      };
      if ( true && options.outputSourceRange) {
        attrs[i].start = args.start + args[0].match(/^\s*/).length;
        attrs[i].end = args.end;
      }
    }

    if (!unary) {
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
      lastTag = tagName;
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

  function parseEndTag (tagName, start, end) {
    var pos, lowerCasedTagName;
    if (start == null) { start = index; }
    if (end == null) { end = index; }

    // Find the closest opened tag of the same type
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase();
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0;
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) {
        if ( true &&
          (i > pos || !tagName) &&
          options.warn
        ) {
          options.warn(
            ("tag <" + (stack[i].tag) + "> has no matching end tag."),
            { start: stack[i].start, end: stack[i].end }
          );
        }
        if (options.end) {
          options.end(stack[i].tag, start, end);
        }
      }

      // Remove the open elements from the stack
      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end);
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end);
      }
      if (options.end) {
        options.end(tagName, start, end);
      }
    }
  }
}

/*  */

var onRE = /^@|^v-on:/;
var dirRE = /^v-|^@|^:|^#/;
var forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
var stripParensRE = /^\(|\)$/g;
var dynamicArgRE = /^\[.*\]$/;

var argRE = /:(.*)$/;
var bindRE = /^:|^\.|^v-bind:/;
var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;

var slotRE = /^v-slot(:|$)|^#/;

var lineBreakRE = /[\r\n]/;
var whitespaceRE$1 = /\s+/g;

var invalidAttributeRE = /[\s"'<>\/=]/;

var decodeHTMLCached = cached(he.decode);

var emptySlotScopeToken = "_empty_";

// configurable state
var warn$2;
var delimiters;
var transforms;
var preTransforms;
var postTransforms;
var platformIsPreTag;
var platformMustUseProp;
var platformGetTagNamespace;
var maybeComponent;

function createASTElement (
  tag,
  attrs,
  parent
) {
  return {
    type: 1,
    tag: tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    rawAttrsMap: {},
    parent: parent,
    children: []
  }
}

/**
 * Convert HTML string to AST.
 */
function parse (
  template,
  options
) {
  warn$2 = options.warn || baseWarn;

  platformIsPreTag = options.isPreTag || no;
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no;
  var isReservedTag = options.isReservedTag || no;
  maybeComponent = function (el) { return !!el.component || !isReservedTag(el.tag); };

  transforms = pluckModuleFunction(options.modules, 'transformNode');
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

  delimiters = options.delimiters;

  var stack = [];
  var preserveWhitespace = options.preserveWhitespace !== false;
  var whitespaceOption = options.whitespace;
  var root;
  var currentParent;
  var inVPre = false;
  var inPre = false;
  var warned = false;

  function warnOnce (msg, range) {
    if (!warned) {
      warned = true;
      warn$2(msg, range);
    }
  }

  function closeElement (element) {
    trimEndingWhitespace(element);
    if (!inVPre && !element.processed) {
      element = processElement(element, options);
    }
    // tree management
    if (!stack.length && element !== root) {
      // allow root elements with v-if, v-else-if and v-else
      if (root.if && (element.elseif || element.else)) {
        if (true) {
          checkRootConstraints(element);
        }
        addIfCondition(root, {
          exp: element.elseif,
          block: element
        });
      } else if (true) {
        warnOnce(
          "Component template should contain exactly one root element. " +
          "If you are using v-if on multiple elements, " +
          "use v-else-if to chain them instead.",
          { start: element.start }
        );
      }
    }
    if (currentParent && !element.forbidden) {
      if (element.elseif || element.else) {
        processIfConditions(element, currentParent);
      } else {
        if (element.slotScope) {
          // scoped slot
          // keep it in the children list so that v-else(-if) conditions can
          // find it as the prev node.
          var name = element.slotTarget || '"default"'
          ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
        }
        currentParent.children.push(element);
        element.parent = currentParent;
      }
    }

    // final children cleanup
    // filter out scoped slots
    element.children = element.children.filter(function (c) { return !(c).slotScope; });
    // remove trailing whitespace node again
    trimEndingWhitespace(element);

    // check pre state
    if (element.pre) {
      inVPre = false;
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false;
    }
    // apply post-transforms
    for (var i = 0; i < postTransforms.length; i++) {
      postTransforms[i](element, options);
    }
  }

  function trimEndingWhitespace (el) {
    // remove trailing whitespace node
    if (!inPre) {
      var lastNode;
      while (
        (lastNode = el.children[el.children.length - 1]) &&
        lastNode.type === 3 &&
        lastNode.text === ' '
      ) {
        el.children.pop();
      }
    }
  }

  function checkRootConstraints (el) {
    if (el.tag === 'slot' || el.tag === 'template') {
      warnOnce(
        "Cannot use <" + (el.tag) + "> as component root element because it may " +
        'contain multiple nodes.',
        { start: el.start }
      );
    }
    if (el.attrsMap.hasOwnProperty('v-for')) {
      warnOnce(
        'Cannot use v-for on stateful component root element because ' +
        'it renders multiple elements.',
        el.rawAttrsMap['v-for']
      );
    }
  }

  parseHTML(template, {
    warn: warn$2,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,
    start: function start (tag, attrs, unary, start$1, end) {
      // check namespace.
      // inherit parent ns if there is one
      var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

      // handle IE svg bug
      /* istanbul ignore if */
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs);
      }

      var element = createASTElement(tag, attrs, currentParent);
      if (ns) {
        element.ns = ns;
      }

      if (true) {
        if (options.outputSourceRange) {
          element.start = start$1;
          element.end = end;
          element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) {
            cumulated[attr.name] = attr;
            return cumulated
          }, {});
        }
        attrs.forEach(function (attr) {
          if (invalidAttributeRE.test(attr.name)) {
            warn$2(
              "Invalid dynamic argument expression: attribute names cannot contain " +
              "spaces, quotes, <, >, / or =.",
              {
                start: attr.start + attr.name.indexOf("["),
                end: attr.start + attr.name.length
              }
            );
          }
        });
      }

      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true;
         true && warn$2(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          "<" + tag + ">" + ', as they will not be parsed.',
          { start: element.start }
        );
      }

      // apply pre-transforms
      for (var i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element;
      }

      if (!inVPre) {
        processPre(element);
        if (element.pre) {
          inVPre = true;
        }
      }
      if (platformIsPreTag(element.tag)) {
        inPre = true;
      }
      if (inVPre) {
        processRawAttrs(element);
      } else if (!element.processed) {
        // structural directives
        processFor(element);
        processIf(element);
        processOnce(element);
      }

      if (!root) {
        root = element;
        if (true) {
          checkRootConstraints(root);
        }
      }

      if (!unary) {
        currentParent = element;
        stack.push(element);
      } else {
        closeElement(element);
      }
    },

    end: function end (tag, start, end$1) {
      var element = stack[stack.length - 1];
      // pop stack
      stack.length -= 1;
      currentParent = stack[stack.length - 1];
      if ( true && options.outputSourceRange) {
        element.end = end$1;
      }
      closeElement(element);
    },

    chars: function chars (text, start, end) {
      if (!currentParent) {
        if (true) {
          if (text === template) {
            warnOnce(
              'Component template requires a root element, rather than just text.',
              { start: start }
            );
          } else if ((text = text.trim())) {
            warnOnce(
              ("text \"" + text + "\" outside root element will be ignored."),
              { start: start }
            );
          }
        }
        return
      }
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE &&
        currentParent.tag === 'textarea' &&
        currentParent.attrsMap.placeholder === text
      ) {
        return
      }
      var children = currentParent.children;
      if (inPre || text.trim()) {
        text = isTextTag(currentParent) ? text : decodeHTMLCached(text);
      } else if (!children.length) {
        // remove the whitespace-only node right after an opening tag
        text = '';
      } else if (whitespaceOption) {
        if (whitespaceOption === 'condense') {
          // in condense mode, remove the whitespace node if it contains
          // line break, otherwise condense to a single space
          text = lineBreakRE.test(text) ? '' : ' ';
        } else {
          text = ' ';
        }
      } else {
        text = preserveWhitespace ? ' ' : '';
      }
      if (text) {
        if (!inPre && whitespaceOption === 'condense') {
          // condense consecutive whitespaces into single space
          text = text.replace(whitespaceRE$1, ' ');
        }
        var res;
        var child;
        if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
          child = {
            type: 2,
            expression: res.expression,
            tokens: res.tokens,
            text: text
          };
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          child = {
            type: 3,
            text: text
          };
        }
        if (child) {
          if ( true && options.outputSourceRange) {
            child.start = start;
            child.end = end;
          }
          children.push(child);
        }
      }
    },
    comment: function comment (text, start, end) {
      // adding anything as a sibling to the root node is forbidden
      // comments should still be allowed, but ignored
      if (currentParent) {
        var child = {
          type: 3,
          text: text,
          isComment: true
        };
        if ( true && options.outputSourceRange) {
          child.start = start;
          child.end = end;
        }
        currentParent.children.push(child);
      }
    }
  });
  return root
}

function processPre (el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true;
  }
}

function processRawAttrs (el) {
  var list = el.attrsList;
  var len = list.length;
  if (len) {
    var attrs = el.attrs = new Array(len);
    for (var i = 0; i < len; i++) {
      attrs[i] = {
        name: list[i].name,
        value: JSON.stringify(list[i].value)
      };
      if (list[i].start != null) {
        attrs[i].start = list[i].start;
        attrs[i].end = list[i].end;
      }
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true;
  }
}

function processElement (
  element,
  options
) {
  processKey(element);

  // determine whether this is a plain element after
  // removing structural attributes
  element.plain = (
    !element.key &&
    !element.scopedSlots &&
    !element.attrsList.length
  );

  processRef(element);
  processSlotContent(element);
  processSlotOutlet(element);
  processComponent(element);
  for (var i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element;
  }
  processAttrs(element);
  return element
}

function processKey (el) {
  var exp = getBindingAttr(el, 'key');
  if (exp) {
    if (true) {
      if (el.tag === 'template') {
        warn$2(
          "<template> cannot be keyed. Place the key on real elements instead.",
          getRawBindingAttr(el, 'key')
        );
      }
      if (el.for) {
        var iterator = el.iterator2 || el.iterator1;
        var parent = el.parent;
        if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
          warn$2(
            "Do not use v-for index as key on <transition-group> children, " +
            "this is the same as not using keys.",
            getRawBindingAttr(el, 'key'),
            true /* tip */
          );
        }
      }
    }
    el.key = exp;
  }
}

function processRef (el) {
  var ref = getBindingAttr(el, 'ref');
  if (ref) {
    el.ref = ref;
    el.refInFor = checkInFor(el);
  }
}

function processFor (el) {
  var exp;
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    var res = parseFor(exp);
    if (res) {
      extend(el, res);
    } else if (true) {
      warn$2(
        ("Invalid v-for expression: " + exp),
        el.rawAttrsMap['v-for']
      );
    }
  }
}



function parseFor (exp) {
  var inMatch = exp.match(forAliasRE);
  if (!inMatch) { return }
  var res = {};
  res.for = inMatch[2].trim();
  var alias = inMatch[1].trim().replace(stripParensRE, '');
  var iteratorMatch = alias.match(forIteratorRE);
  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, '').trim();
    res.iterator1 = iteratorMatch[1].trim();
    if (iteratorMatch[2]) {
      res.iterator2 = iteratorMatch[2].trim();
    }
  } else {
    res.alias = alias;
  }
  return res
}

function processIf (el) {
  var exp = getAndRemoveAttr(el, 'v-if');
  if (exp) {
    el.if = exp;
    addIfCondition(el, {
      exp: exp,
      block: el
    });
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }
    var elseif = getAndRemoveAttr(el, 'v-else-if');
    if (elseif) {
      el.elseif = elseif;
    }
  }
}

function processIfConditions (el, parent) {
  var prev = findPrevElement(parent.children);
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    });
  } else if (true) {
    warn$2(
      "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
      "used on element <" + (el.tag) + "> without corresponding v-if.",
      el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']
    );
  }
}

function findPrevElement (children) {
  var i = children.length;
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if ( true && children[i].text !== ' ') {
        warn$2(
          "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
          "will be ignored.",
          children[i]
        );
      }
      children.pop();
    }
  }
}

function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = [];
  }
  el.ifConditions.push(condition);
}

function processOnce (el) {
  var once$$1 = getAndRemoveAttr(el, 'v-once');
  if (once$$1 != null) {
    el.once = true;
  }
}

// handle content being passed to a component as slot,
// e.g. <template slot="xxx">, <div slot-scope="xxx">
function processSlotContent (el) {
  var slotScope;
  if (el.tag === 'template') {
    slotScope = getAndRemoveAttr(el, 'scope');
    /* istanbul ignore if */
    if ( true && slotScope) {
      warn$2(
        "the \"scope\" attribute for scoped slots have been deprecated and " +
        "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " +
        "can also be used on plain elements in addition to <template> to " +
        "denote scoped slots.",
        el.rawAttrsMap['scope'],
        true
      );
    }
    el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
  } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
    /* istanbul ignore if */
    if ( true && el.attrsMap['v-for']) {
      warn$2(
        "Ambiguous combined usage of slot-scope and v-for on <" + (el.tag) + "> " +
        "(v-for takes higher priority). Use a wrapper <template> for the " +
        "scoped slot to make it clearer.",
        el.rawAttrsMap['slot-scope'],
        true
      );
    }
    el.slotScope = slotScope;
  }

  // slot="xxx"
  var slotTarget = getBindingAttr(el, 'slot');
  if (slotTarget) {
    el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
    el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']);
    // preserve slot as an attribute for native shadow DOM compat
    // only for non-scoped slots.
    if (el.tag !== 'template' && !el.slotScope) {
      addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'));
    }
  }

  // 2.6 v-slot syntax
  {
    if (el.tag === 'template') {
      // v-slot on <template>
      var slotBinding = getAndRemoveAttrByRegex(el, slotRE);
      if (slotBinding) {
        if (true) {
          if (el.slotTarget || el.slotScope) {
            warn$2(
              "Unexpected mixed usage of different slot syntaxes.",
              el
            );
          }
          if (el.parent && !maybeComponent(el.parent)) {
            warn$2(
              "<template v-slot> can only appear at the root level inside " +
              "the receiving component",
              el
            );
          }
        }
        var ref = getSlotName(slotBinding);
        var name = ref.name;
        var dynamic = ref.dynamic;
        el.slotTarget = name;
        el.slotTargetDynamic = dynamic;
        el.slotScope = slotBinding.value || emptySlotScopeToken; // force it into a scoped slot for perf
      }
    } else {
      // v-slot on component, denotes default slot
      var slotBinding$1 = getAndRemoveAttrByRegex(el, slotRE);
      if (slotBinding$1) {
        if (true) {
          if (!maybeComponent(el)) {
            warn$2(
              "v-slot can only be used on components or <template>.",
              slotBinding$1
            );
          }
          if (el.slotScope || el.slotTarget) {
            warn$2(
              "Unexpected mixed usage of different slot syntaxes.",
              el
            );
          }
          if (el.scopedSlots) {
            warn$2(
              "To avoid scope ambiguity, the default slot should also use " +
              "<template> syntax when there are other named slots.",
              slotBinding$1
            );
          }
        }
        // add the component's children to its default slot
        var slots = el.scopedSlots || (el.scopedSlots = {});
        var ref$1 = getSlotName(slotBinding$1);
        var name$1 = ref$1.name;
        var dynamic$1 = ref$1.dynamic;
        var slotContainer = slots[name$1] = createASTElement('template', [], el);
        slotContainer.slotTarget = name$1;
        slotContainer.slotTargetDynamic = dynamic$1;
        slotContainer.children = el.children.filter(function (c) {
          if (!c.slotScope) {
            c.parent = slotContainer;
            return true
          }
        });
        slotContainer.slotScope = slotBinding$1.value || emptySlotScopeToken;
        // remove children as they are returned from scopedSlots now
        el.children = [];
        // mark el non-plain so data gets generated
        el.plain = false;
      }
    }
  }
}

function getSlotName (binding) {
  var name = binding.name.replace(slotRE, '');
  if (!name) {
    if (binding.name[0] !== '#') {
      name = 'default';
    } else if (true) {
      warn$2(
        "v-slot shorthand syntax requires a slot name.",
        binding
      );
    }
  }
  return dynamicArgRE.test(name)
    // dynamic [name]
    ? { name: name.slice(1, -1), dynamic: true }
    // static name
    : { name: ("\"" + name + "\""), dynamic: false }
}

// handle <slot/> outlets
function processSlotOutlet (el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name');
    if ( true && el.key) {
      warn$2(
        "`key` does not work on <slot> because slots are abstract outlets " +
        "and can possibly expand into multiple elements. " +
        "Use the key on a wrapping element instead.",
        getRawBindingAttr(el, 'key')
      );
    }
  }
}

function processComponent (el) {
  var binding;
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding;
  }
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true;
  }
}

function processAttrs (el) {
  var list = el.attrsList;
  var i, l, name, rawName, value, modifiers, syncGen, isDynamic;
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name;
    value = list[i].value;
    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true;
      // modifiers
      modifiers = parseModifiers(name.replace(dirRE, ''));
      // support .foo shorthand syntax for the .prop modifier
      if (modifiers) {
        name = name.replace(modifierRE, '');
      }
      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '');
        value = parseFilters(value);
        isDynamic = dynamicArgRE.test(name);
        if (isDynamic) {
          name = name.slice(1, -1);
        }
        if (
           true &&
          value.trim().length === 0
        ) {
          warn$2(
            ("The value for a v-bind expression cannot be empty. Found in \"v-bind:" + name + "\"")
          );
        }
        if (modifiers) {
          if (modifiers.prop && !isDynamic) {
            name = camelize(name);
            if (name === 'innerHtml') { name = 'innerHTML'; }
          }
          if (modifiers.camel && !isDynamic) {
            name = camelize(name);
          }
          if (modifiers.sync) {
            syncGen = genAssignmentCode(value, "$event");
            if (!isDynamic) {
              addHandler(
                el,
                ("update:" + (camelize(name))),
                syncGen,
                null,
                false,
                warn$2,
                list[i]
              );
              if (hyphenate(name) !== camelize(name)) {
                addHandler(
                  el,
                  ("update:" + (hyphenate(name))),
                  syncGen,
                  null,
                  false,
                  warn$2,
                  list[i]
                );
              }
            } else {
              // handler w/ dynamic event name
              addHandler(
                el,
                ("\"update:\"+(" + name + ")"),
                syncGen,
                null,
                false,
                warn$2,
                list[i],
                true // dynamic
              );
            }
          }
        }
        if ((modifiers && modifiers.prop) || (
          !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
        )) {
          addProp(el, name, value, list[i], isDynamic);
        } else {
          addAttr(el, name, value, list[i], isDynamic);
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '');
        isDynamic = dynamicArgRE.test(name);
        if (isDynamic) {
          name = name.slice(1, -1);
        }
        addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic);
      } else { // normal directives
        name = name.replace(dirRE, '');
        // parse arg
        var argMatch = name.match(argRE);
        var arg = argMatch && argMatch[1];
        isDynamic = false;
        if (arg) {
          name = name.slice(0, -(arg.length + 1));
          if (dynamicArgRE.test(arg)) {
            arg = arg.slice(1, -1);
            isDynamic = true;
          }
        }
        addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
        if ( true && name === 'model') {
          checkForAliasModel(el, value);
        }
      }
    } else {
      // literal attribute
      if (true) {
        var res = parseText(value, delimiters);
        if (res) {
          warn$2(
            name + "=\"" + value + "\": " +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.',
            list[i]
          );
        }
      }
      addAttr(el, name, JSON.stringify(value), list[i]);
      // #6887 firefox doesn't update muted state if set via attribute
      // even immediately after element creation
      if (!el.component &&
          name === 'muted' &&
          platformMustUseProp(el.tag, el.attrsMap.type, name)) {
        addProp(el, name, 'true', list[i]);
      }
    }
  }
}

function checkInFor (el) {
  var parent = el;
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent;
  }
  return false
}

function parseModifiers (name) {
  var match = name.match(modifierRE);
  if (match) {
    var ret = {};
    match.forEach(function (m) { ret[m.slice(1)] = true; });
    return ret
  }
}

function makeAttrsMap (attrs) {
  var map = {};
  for (var i = 0, l = attrs.length; i < l; i++) {
    if (
       true &&
      map[attrs[i].name] && !isIE && !isEdge
    ) {
      warn$2('duplicate attribute: ' + attrs[i].name, attrs[i]);
    }
    map[attrs[i].name] = attrs[i].value;
  }
  return map
}

// for script (e.g. type="x/template") or style, do not decode content
function isTextTag (el) {
  return el.tag === 'script' || el.tag === 'style'
}

function isForbiddenTag (el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}

var ieNSBug = /^xmlns:NS\d+/;
var ieNSPrefix = /^NS\d+:/;

/* istanbul ignore next */
function guardIESVGBug (attrs) {
  var res = [];
  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '');
      res.push(attr);
    }
  }
  return res
}

function checkForAliasModel (el, value) {
  var _el = el;
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn$2(
        "<" + (el.tag) + " v-model=\"" + value + "\">: " +
        "You are binding v-model directly to a v-for iteration alias. " +
        "This will not be able to modify the v-for source array because " +
        "writing to the alias is like modifying a function local variable. " +
        "Consider using an array of objects and use v-model on an object property instead.",
        el.rawAttrsMap['v-model']
      );
    }
    _el = _el.parent;
  }
}

/*  */

function preTransformNode (el, options) {
  if (el.tag === 'input') {
    var map = el.attrsMap;
    if (!map['v-model']) {
      return
    }

    var typeBinding;
    if (map[':type'] || map['v-bind:type']) {
      typeBinding = getBindingAttr(el, 'type');
    }
    if (!map.type && !typeBinding && map['v-bind']) {
      typeBinding = "(" + (map['v-bind']) + ").type";
    }

    if (typeBinding) {
      var ifCondition = getAndRemoveAttr(el, 'v-if', true);
      var ifConditionExtra = ifCondition ? ("&&(" + ifCondition + ")") : "";
      var hasElse = getAndRemoveAttr(el, 'v-else', true) != null;
      var elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true);
      // 1. checkbox
      var branch0 = cloneASTElement(el);
      // process for on the main node
      processFor(branch0);
      addRawAttr(branch0, 'type', 'checkbox');
      processElement(branch0, options);
      branch0.processed = true; // prevent it from double-processed
      branch0.if = "(" + typeBinding + ")==='checkbox'" + ifConditionExtra;
      addIfCondition(branch0, {
        exp: branch0.if,
        block: branch0
      });
      // 2. add radio else-if condition
      var branch1 = cloneASTElement(el);
      getAndRemoveAttr(branch1, 'v-for', true);
      addRawAttr(branch1, 'type', 'radio');
      processElement(branch1, options);
      addIfCondition(branch0, {
        exp: "(" + typeBinding + ")==='radio'" + ifConditionExtra,
        block: branch1
      });
      // 3. other
      var branch2 = cloneASTElement(el);
      getAndRemoveAttr(branch2, 'v-for', true);
      addRawAttr(branch2, ':type', typeBinding);
      processElement(branch2, options);
      addIfCondition(branch0, {
        exp: ifCondition,
        block: branch2
      });

      if (hasElse) {
        branch0.else = true;
      } else if (elseIfCondition) {
        branch0.elseif = elseIfCondition;
      }

      return branch0
    }
  }
}

function cloneASTElement (el) {
  return createASTElement(el.tag, el.attrsList.slice(), el.parent)
}

var model$1 = {
  preTransformNode: preTransformNode
};

var modules$1 = [
  klass$1,
  style$1,
  model$1
];

/*  */

function text (el, dir) {
  if (dir.value) {
    addProp(el, 'textContent', ("_s(" + (dir.value) + ")"), dir);
  }
}

/*  */

function html (el, dir) {
  if (dir.value) {
    addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"), dir);
  }
}

var directives$1 = {
  model: model,
  text: text,
  html: html
};

/*  */

var baseOptions = {
  expectHTML: true,
  modules: modules$1,
  directives: directives$1,
  isPreTag: isPreTag,
  isUnaryTag: isUnaryTag,
  mustUseProp: mustUseProp,
  canBeLeftOpenTag: canBeLeftOpenTag,
  isReservedTag: isReservedTag,
  getTagNamespace: getTagNamespace,
  staticKeys: genStaticKeys(modules$1)
};

/*  */

var isStaticKey;
var isPlatformReservedTag;

var genStaticKeysCached = cached(genStaticKeys$1);

/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
function optimize (root, options) {
  if (!root) { return }
  isStaticKey = genStaticKeysCached(options.staticKeys || '');
  isPlatformReservedTag = options.isReservedTag || no;
  // first pass: mark all non-static nodes.
  markStatic$1(root);
  // second pass: mark static roots.
  markStaticRoots(root, false);
}

function genStaticKeys$1 (keys) {
  return makeMap(
    'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
    (keys ? ',' + keys : '')
  )
}

function markStatic$1 (node) {
  node.static = isStatic(node);
  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (
      !isPlatformReservedTag(node.tag) &&
      node.tag !== 'slot' &&
      node.attrsMap['inline-template'] == null
    ) {
      return
    }
    for (var i = 0, l = node.children.length; i < l; i++) {
      var child = node.children[i];
      markStatic$1(child);
      if (!child.static) {
        node.static = false;
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        var block = node.ifConditions[i$1].block;
        markStatic$1(block);
        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}

function markStaticRoots (node, isInFor) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor;
    }
    // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.
    if (node.static && node.children.length && !(
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      node.staticRoot = true;
      return
    } else {
      node.staticRoot = false;
    }
    if (node.children) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }
    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        markStaticRoots(node.ifConditions[i$1].block, isInFor);
      }
    }
  }
}

function isStatic (node) {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}

function isDirectChildOfTemplateFor (node) {
  while (node.parent) {
    node = node.parent;
    if (node.tag !== 'template') {
      return false
    }
    if (node.for) {
      return true
    }
  }
  return false
}

/*  */

var fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
var fnInvokeRE = /\([^)]*?\);*$/;
var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

// KeyboardEvent.keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
};

// KeyboardEvent.key aliases
var keyNames = {
  // #7880: IE11 and Edge use `Esc` for Escape key name.
  esc: ['Esc', 'Escape'],
  tab: 'Tab',
  enter: 'Enter',
  // #9112: IE11 uses `Spacebar` for Space key name.
  space: [' ', 'Spacebar'],
  // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
  up: ['Up', 'ArrowUp'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
  down: ['Down', 'ArrowDown'],
  // #9112: IE11 uses `Del` for Delete key name.
  'delete': ['Backspace', 'Delete', 'Del']
};

// #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once
var genGuard = function (condition) { return ("if(" + condition + ")return null;"); };

var modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard("$event.target !== $event.currentTarget"),
  ctrl: genGuard("!$event.ctrlKey"),
  shift: genGuard("!$event.shiftKey"),
  alt: genGuard("!$event.altKey"),
  meta: genGuard("!$event.metaKey"),
  left: genGuard("'button' in $event && $event.button !== 0"),
  middle: genGuard("'button' in $event && $event.button !== 1"),
  right: genGuard("'button' in $event && $event.button !== 2")
};

function genHandlers (
  events,
  isNative
) {
  var prefix = isNative ? 'nativeOn:' : 'on:';
  var staticHandlers = "";
  var dynamicHandlers = "";
  for (var name in events) {
    var handlerCode = genHandler(events[name]);
    if (events[name] && events[name].dynamic) {
      dynamicHandlers += name + "," + handlerCode + ",";
    } else {
      staticHandlers += "\"" + name + "\":" + handlerCode + ",";
    }
  }
  staticHandlers = "{" + (staticHandlers.slice(0, -1)) + "}";
  if (dynamicHandlers) {
    return prefix + "_d(" + staticHandlers + ",[" + (dynamicHandlers.slice(0, -1)) + "])"
  } else {
    return prefix + staticHandlers
  }
}

function genHandler (handler) {
  if (!handler) {
    return 'function(){}'
  }

  if (Array.isArray(handler)) {
    return ("[" + (handler.map(function (handler) { return genHandler(handler); }).join(',')) + "]")
  }

  var isMethodPath = simplePathRE.test(handler.value);
  var isFunctionExpression = fnExpRE.test(handler.value);
  var isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));

  if (!handler.modifiers) {
    if (isMethodPath || isFunctionExpression) {
      return handler.value
    }
    return ("function($event){" + (isFunctionInvocation ? ("return " + (handler.value)) : handler.value) + "}") // inline statement
  } else {
    var code = '';
    var genModifierCode = '';
    var keys = [];
    for (var key in handler.modifiers) {
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key];
        // left/right
        if (keyCodes[key]) {
          keys.push(key);
        }
      } else if (key === 'exact') {
        var modifiers = (handler.modifiers);
        genModifierCode += genGuard(
          ['ctrl', 'shift', 'alt', 'meta']
            .filter(function (keyModifier) { return !modifiers[keyModifier]; })
            .map(function (keyModifier) { return ("$event." + keyModifier + "Key"); })
            .join('||')
        );
      } else {
        keys.push(key);
      }
    }
    if (keys.length) {
      code += genKeyFilter(keys);
    }
    // Make sure modifiers like prevent and stop get executed after key filtering
    if (genModifierCode) {
      code += genModifierCode;
    }
    var handlerCode = isMethodPath
      ? ("return " + (handler.value) + "($event)")
      : isFunctionExpression
        ? ("return (" + (handler.value) + ")($event)")
        : isFunctionInvocation
          ? ("return " + (handler.value))
          : handler.value;
    return ("function($event){" + code + handlerCode + "}")
  }
}

function genKeyFilter (keys) {
  return (
    // make sure the key filters only apply to KeyboardEvents
    // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
    // key events that do not have keyCode property...
    "if(!$event.type.indexOf('key')&&" +
    (keys.map(genFilterCode).join('&&')) + ")return null;"
  )
}

function genFilterCode (key) {
  var keyVal = parseInt(key, 10);
  if (keyVal) {
    return ("$event.keyCode!==" + keyVal)
  }
  var keyCode = keyCodes[key];
  var keyName = keyNames[key];
  return (
    "_k($event.keyCode," +
    (JSON.stringify(key)) + "," +
    (JSON.stringify(keyCode)) + "," +
    "$event.key," +
    "" + (JSON.stringify(keyName)) +
    ")"
  )
}

/*  */

function on (el, dir) {
  if ( true && dir.modifiers) {
    warn("v-on without argument does not support modifiers.");
  }
  el.wrapListeners = function (code) { return ("_g(" + code + "," + (dir.value) + ")"); };
}

/*  */

function bind$1 (el, dir) {
  el.wrapData = function (code) {
    return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
  };
}

/*  */

var baseDirectives = {
  on: on,
  bind: bind$1,
  cloak: noop
};

/*  */





var CodegenState = function CodegenState (options) {
  this.options = options;
  this.warn = options.warn || baseWarn;
  this.transforms = pluckModuleFunction(options.modules, 'transformCode');
  this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
  this.directives = extend(extend({}, baseDirectives), options.directives);
  var isReservedTag = options.isReservedTag || no;
  this.maybeComponent = function (el) { return !!el.component || !isReservedTag(el.tag); };
  this.onceId = 0;
  this.staticRenderFns = [];
  this.pre = false;
};



function generate (
  ast,
  options
) {
  var state = new CodegenState(options);
  var code = ast ? genElement(ast, state) : '_c("div")';
  return {
    render: ("with(this){return " + code + "}"),
    staticRenderFns: state.staticRenderFns
  }
}

function genElement (el, state) {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre;
  }

  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  } else {
    // component or element
    var code;
    if (el.component) {
      code = genComponent(el.component, el, state);
    } else {
      var data;
      if (!el.plain || (el.pre && state.maybeComponent(el))) {
        data = genData$2(el, state);
      }

      var children = el.inlineTemplate ? null : genChildren(el, state, true);
      code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
    }
    // module transforms
    for (var i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code);
    }
    return code
  }
}

// hoist static sub-trees out
function genStatic (el, state) {
  el.staticProcessed = true;
  // Some elements (templates) need to behave differently inside of a v-pre
  // node.  All pre nodes are static roots, so we can use this as a location to
  // wrap a state change and reset it upon exiting the pre node.
  var originalPreState = state.pre;
  if (el.pre) {
    state.pre = el.pre;
  }
  state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
  state.pre = originalPreState;
  return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
}

// v-once
function genOnce (el, state) {
  el.onceProcessed = true;
  if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.staticInFor) {
    var key = '';
    var parent = el.parent;
    while (parent) {
      if (parent.for) {
        key = parent.key;
        break
      }
      parent = parent.parent;
    }
    if (!key) {
       true && state.warn(
        "v-once can only be used inside v-for that is keyed. ",
        el.rawAttrsMap['v-once']
      );
      return genElement(el, state)
    }
    return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + "," + key + ")")
  } else {
    return genStatic(el, state)
  }
}

function genIf (
  el,
  state,
  altGen,
  altEmpty
) {
  el.ifProcessed = true; // avoid recursion
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

function genIfConditions (
  conditions,
  state,
  altGen,
  altEmpty
) {
  if (!conditions.length) {
    return altEmpty || '_e()'
  }

  var condition = conditions.shift();
  if (condition.exp) {
    return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
  } else {
    return ("" + (genTernaryExp(condition.block)))
  }

  // v-if with v-once should generate code like (a)?_m(0):_m(1)
  function genTernaryExp (el) {
    return altGen
      ? altGen(el, state)
      : el.once
        ? genOnce(el, state)
        : genElement(el, state)
  }
}

function genFor (
  el,
  state,
  altGen,
  altHelper
) {
  var exp = el.for;
  var alias = el.alias;
  var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
  var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

  if ( true &&
    state.maybeComponent(el) &&
    el.tag !== 'slot' &&
    el.tag !== 'template' &&
    !el.key
  ) {
    state.warn(
      "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
      "v-for should have explicit keys. " +
      "See https://vuejs.org/guide/list.html#key for more info.",
      el.rawAttrsMap['v-for'],
      true /* tip */
    );
  }

  el.forProcessed = true; // avoid recursion
  return (altHelper || '_l') + "((" + exp + ")," +
    "function(" + alias + iterator1 + iterator2 + "){" +
      "return " + ((altGen || genElement)(el, state)) +
    '})'
}

function genData$2 (el, state) {
  var data = '{';

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  var dirs = genDirectives(el, state);
  if (dirs) { data += dirs + ','; }

  // key
  if (el.key) {
    data += "key:" + (el.key) + ",";
  }
  // ref
  if (el.ref) {
    data += "ref:" + (el.ref) + ",";
  }
  if (el.refInFor) {
    data += "refInFor:true,";
  }
  // pre
  if (el.pre) {
    data += "pre:true,";
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += "tag:\"" + (el.tag) + "\",";
  }
  // module data generation functions
  for (var i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el);
  }
  // attributes
  if (el.attrs) {
    data += "attrs:" + (genProps(el.attrs)) + ",";
  }
  // DOM props
  if (el.props) {
    data += "domProps:" + (genProps(el.props)) + ",";
  }
  // event handlers
  if (el.events) {
    data += (genHandlers(el.events, false)) + ",";
  }
  if (el.nativeEvents) {
    data += (genHandlers(el.nativeEvents, true)) + ",";
  }
  // slot target
  // only for non-scoped slots
  if (el.slotTarget && !el.slotScope) {
    data += "slot:" + (el.slotTarget) + ",";
  }
  // scoped slots
  if (el.scopedSlots) {
    data += (genScopedSlots(el, el.scopedSlots, state)) + ",";
  }
  // component v-model
  if (el.model) {
    data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
  }
  // inline-template
  if (el.inlineTemplate) {
    var inlineTemplate = genInlineTemplate(el, state);
    if (inlineTemplate) {
      data += inlineTemplate + ",";
    }
  }
  data = data.replace(/,$/, '') + '}';
  // v-bind dynamic argument wrap
  // v-bind with dynamic arguments must be applied using the same v-bind object
  // merge helper so that class/style/mustUseProp attrs are handled correctly.
  if (el.dynamicAttrs) {
    data = "_b(" + data + ",\"" + (el.tag) + "\"," + (genProps(el.dynamicAttrs)) + ")";
  }
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data);
  }
  // v-on data wrap
  if (el.wrapListeners) {
    data = el.wrapListeners(data);
  }
  return data
}

function genDirectives (el, state) {
  var dirs = el.directives;
  if (!dirs) { return }
  var res = 'directives:[';
  var hasRuntime = false;
  var i, l, dir, needRuntime;
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i];
    needRuntime = true;
    var gen = state.directives[dir.name];
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn);
    }
    if (needRuntime) {
      hasRuntime = true;
      res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:" + (dir.isDynamicArg ? dir.arg : ("\"" + (dir.arg) + "\""))) : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}

function genInlineTemplate (el, state) {
  var ast = el.children[0];
  if ( true && (
    el.children.length !== 1 || ast.type !== 1
  )) {
    state.warn(
      'Inline-template components must have exactly one child element.',
      { start: el.start }
    );
  }
  if (ast && ast.type === 1) {
    var inlineRenderFns = generate(ast, state.options);
    return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
  }
}

function genScopedSlots (
  el,
  slots,
  state
) {
  // by default scoped slots are considered "stable", this allows child
  // components with only scoped slots to skip forced updates from parent.
  // but in some cases we have to bail-out of this optimization
  // for example if the slot contains dynamic names, has v-if or v-for on them...
  var needsForceUpdate = el.for || Object.keys(slots).some(function (key) {
    var slot = slots[key];
    return (
      slot.slotTargetDynamic ||
      slot.if ||
      slot.for ||
      containsSlotChild(slot) // is passing down slot from parent which may be dynamic
    )
  });

  // #9534: if a component with scoped slots is inside a conditional branch,
  // it's possible for the same component to be reused but with different
  // compiled slot content. To avoid that, we generate a unique key based on
  // the generated code of all the slot contents.
  var needsKey = !!el.if;

  // OR when it is inside another scoped slot or v-for (the reactivity may be
  // disconnected due to the intermediate scope variable)
  // #9438, #9506
  // TODO: this can be further optimized by properly analyzing in-scope bindings
  // and skip force updating ones that do not actually use scope variables.
  if (!needsForceUpdate) {
    var parent = el.parent;
    while (parent) {
      if (
        (parent.slotScope && parent.slotScope !== emptySlotScopeToken) ||
        parent.for
      ) {
        needsForceUpdate = true;
        break
      }
      if (parent.if) {
        needsKey = true;
      }
      parent = parent.parent;
    }
  }

  var generatedSlots = Object.keys(slots)
    .map(function (key) { return genScopedSlot(slots[key], state); })
    .join(',');

  return ("scopedSlots:_u([" + generatedSlots + "]" + (needsForceUpdate ? ",null,true" : "") + (!needsForceUpdate && needsKey ? (",null,false," + (hash(generatedSlots))) : "") + ")")
}

function hash(str) {
  var hash = 5381;
  var i = str.length;
  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return hash >>> 0
}

function containsSlotChild (el) {
  if (el.type === 1) {
    if (el.tag === 'slot') {
      return true
    }
    return el.children.some(containsSlotChild)
  }
  return false
}

function genScopedSlot (
  el,
  state
) {
  var isLegacySyntax = el.attrsMap['slot-scope'];
  if (el.if && !el.ifProcessed && !isLegacySyntax) {
    return genIf(el, state, genScopedSlot, "null")
  }
  if (el.for && !el.forProcessed) {
    return genFor(el, state, genScopedSlot)
  }
  var slotScope = el.slotScope === emptySlotScopeToken
    ? ""
    : String(el.slotScope);
  var fn = "function(" + slotScope + "){" +
    "return " + (el.tag === 'template'
      ? el.if && isLegacySyntax
        ? ("(" + (el.if) + ")?" + (genChildren(el, state) || 'undefined') + ":undefined")
        : genChildren(el, state) || 'undefined'
      : genElement(el, state)) + "}";
  // reverse proxy v-slot without scope on this.$slots
  var reverseProxy = slotScope ? "" : ",proxy:true";
  return ("{key:" + (el.slotTarget || "\"default\"") + ",fn:" + fn + reverseProxy + "}")
}

function genChildren (
  el,
  state,
  checkSkip,
  altGenElement,
  altGenNode
) {
  var children = el.children;
  if (children.length) {
    var el$1 = children[0];
    // optimize single v-for
    if (children.length === 1 &&
      el$1.for &&
      el$1.tag !== 'template' &&
      el$1.tag !== 'slot'
    ) {
      var normalizationType = checkSkip
        ? state.maybeComponent(el$1) ? ",1" : ",0"
        : "";
      return ("" + ((altGenElement || genElement)(el$1, state)) + normalizationType)
    }
    var normalizationType$1 = checkSkip
      ? getNormalizationType(children, state.maybeComponent)
      : 0;
    var gen = altGenNode || genNode;
    return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType$1 ? ("," + normalizationType$1) : ''))
  }
}

// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
function getNormalizationType (
  children,
  maybeComponent
) {
  var res = 0;
  for (var i = 0; i < children.length; i++) {
    var el = children[i];
    if (el.type !== 1) {
      continue
    }
    if (needsNormalization(el) ||
        (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
      res = 2;
      break
    }
    if (maybeComponent(el) ||
        (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
      res = 1;
    }
  }
  return res
}

function needsNormalization (el) {
  return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
}

function genNode (node, state) {
  if (node.type === 1) {
    return genElement(node, state)
  } else if (node.type === 3 && node.isComment) {
    return genComment(node)
  } else {
    return genText(node)
  }
}

function genText (text) {
  return ("_v(" + (text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
}

function genComment (comment) {
  return ("_e(" + (JSON.stringify(comment.text)) + ")")
}

function genSlot (el, state) {
  var slotName = el.slotName || '"default"';
  var children = genChildren(el, state);
  var res = "_t(" + slotName + (children ? ("," + children) : '');
  var attrs = el.attrs || el.dynamicAttrs
    ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(function (attr) { return ({
        // slot props are camelized
        name: camelize(attr.name),
        value: attr.value,
        dynamic: attr.dynamic
      }); }))
    : null;
  var bind$$1 = el.attrsMap['v-bind'];
  if ((attrs || bind$$1) && !children) {
    res += ",null";
  }
  if (attrs) {
    res += "," + attrs;
  }
  if (bind$$1) {
    res += (attrs ? '' : ',null') + "," + bind$$1;
  }
  return res + ')'
}

// componentName is el.component, take it as argument to shun flow's pessimistic refinement
function genComponent (
  componentName,
  el,
  state
) {
  var children = el.inlineTemplate ? null : genChildren(el, state, true);
  return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")")
}

function genProps (props) {
  var staticProps = "";
  var dynamicProps = "";
  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    var value = transformSpecialNewlines(prop.value);
    if (prop.dynamic) {
      dynamicProps += (prop.name) + "," + value + ",";
    } else {
      staticProps += "\"" + (prop.name) + "\":" + value + ",";
    }
  }
  staticProps = "{" + (staticProps.slice(0, -1)) + "}";
  if (dynamicProps) {
    return ("_d(" + staticProps + ",[" + (dynamicProps.slice(0, -1)) + "])")
  } else {
    return staticProps
  }
}

// #3895, #4268
function transformSpecialNewlines (text) {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/*  */



// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed
var prohibitedKeywordRE = new RegExp('\\b' + (
  'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
  'super,throw,while,yield,delete,export,import,return,switch,default,' +
  'extends,finally,continue,debugger,function,arguments'
).split(',').join('\\b|\\b') + '\\b');

// these unary operators should not be used as property/method names
var unaryOperatorsRE = new RegExp('\\b' + (
  'delete,typeof,void'
).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');

// strip strings in expressions
var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

// detect problematic expressions in a template
function detectErrors (ast, warn) {
  if (ast) {
    checkNode(ast, warn);
  }
}

function checkNode (node, warn) {
  if (node.type === 1) {
    for (var name in node.attrsMap) {
      if (dirRE.test(name)) {
        var value = node.attrsMap[name];
        if (value) {
          var range = node.rawAttrsMap[name];
          if (name === 'v-for') {
            checkFor(node, ("v-for=\"" + value + "\""), warn, range);
          } else if (name === 'v-slot' || name[0] === '#') {
            checkFunctionParameterExpression(value, (name + "=\"" + value + "\""), warn, range);
          } else if (onRE.test(name)) {
            checkEvent(value, (name + "=\"" + value + "\""), warn, range);
          } else {
            checkExpression(value, (name + "=\"" + value + "\""), warn, range);
          }
        }
      }
    }
    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], warn);
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, warn, node);
  }
}

function checkEvent (exp, text, warn, range) {
  var stripped = exp.replace(stripStringRE, '');
  var keywordMatch = stripped.match(unaryOperatorsRE);
  if (keywordMatch && stripped.charAt(keywordMatch.index - 1) !== '$') {
    warn(
      "avoid using JavaScript unary operator as property name: " +
      "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim()),
      range
    );
  }
  checkExpression(exp, text, warn, range);
}

function checkFor (node, text, warn, range) {
  checkExpression(node.for || '', text, warn, range);
  checkIdentifier(node.alias, 'v-for alias', text, warn, range);
  checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range);
  checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range);
}

function checkIdentifier (
  ident,
  type,
  text,
  warn,
  range
) {
  if (typeof ident === 'string') {
    try {
      new Function(("var " + ident + "=_"));
    } catch (e) {
      warn(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())), range);
    }
  }
}

function checkExpression (exp, text, warn, range) {
  try {
    new Function(("return " + exp));
  } catch (e) {
    var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
    if (keywordMatch) {
      warn(
        "avoid using JavaScript keyword as property name: " +
        "\"" + (keywordMatch[0]) + "\"\n  Raw expression: " + (text.trim()),
        range
      );
    } else {
      warn(
        "invalid expression: " + (e.message) + " in\n\n" +
        "    " + exp + "\n\n" +
        "  Raw expression: " + (text.trim()) + "\n",
        range
      );
    }
  }
}

function checkFunctionParameterExpression (exp, text, warn, range) {
  try {
    new Function(exp, '');
  } catch (e) {
    warn(
      "invalid function parameter expression: " + (e.message) + " in\n\n" +
      "    " + exp + "\n\n" +
      "  Raw expression: " + (text.trim()) + "\n",
      range
    );
  }
}

/*  */

var range = 2;

function generateCodeFrame (
  source,
  start,
  end
) {
  if ( start === void 0 ) start = 0;
  if ( end === void 0 ) end = source.length;

  var lines = source.split(/\r?\n/);
  var count = 0;
  var res = [];
  for (var i = 0; i < lines.length; i++) {
    count += lines[i].length + 1;
    if (count >= start) {
      for (var j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) { continue }
        res.push(("" + (j + 1) + (repeat$1(" ", 3 - String(j + 1).length)) + "|  " + (lines[j])));
        var lineLength = lines[j].length;
        if (j === i) {
          // push underline
          var pad = start - (count - lineLength) + 1;
          var length = end > count ? lineLength - pad : end - start;
          res.push("   |  " + repeat$1(" ", pad) + repeat$1("^", length));
        } else if (j > i) {
          if (end > count) {
            var length$1 = Math.min(end - count, lineLength);
            res.push("   |  " + repeat$1("^", length$1));
          }
          count += lineLength + 1;
        }
      }
      break
    }
  }
  return res.join('\n')
}

function repeat$1 (str, n) {
  var result = '';
  if (n > 0) {
    while (true) { // eslint-disable-line
      if (n & 1) { result += str; }
      n >>>= 1;
      if (n <= 0) { break }
      str += str;
    }
  }
  return result
}

/*  */



function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({ err: err, code: code });
    return noop
  }
}

function createCompileToFunctionFn (compile) {
  var cache = Object.create(null);

  return function compileToFunctions (
    template,
    options,
    vm
  ) {
    options = extend({}, options);
    var warn$$1 = options.warn || warn;
    delete options.warn;

    /* istanbul ignore if */
    if (true) {
      // detect possible CSP restriction
      try {
        new Function('return 1');
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn$$1(
            'It seems you are using the standalone build of Vue.js in an ' +
            'environment with Content Security Policy that prohibits unsafe-eval. ' +
            'The template compiler cannot work in this environment. Consider ' +
            'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
            'templates into render functions.'
          );
        }
      }
    }

    // check cache
    var key = options.delimiters
      ? String(options.delimiters) + template
      : template;
    if (cache[key]) {
      return cache[key]
    }

    // compile
    var compiled = compile(template, options);

    // check compilation errors/tips
    if (true) {
      if (compiled.errors && compiled.errors.length) {
        if (options.outputSourceRange) {
          compiled.errors.forEach(function (e) {
            warn$$1(
              "Error compiling template:\n\n" + (e.msg) + "\n\n" +
              generateCodeFrame(template, e.start, e.end),
              vm
            );
          });
        } else {
          warn$$1(
            "Error compiling template:\n\n" + template + "\n\n" +
            compiled.errors.map(function (e) { return ("- " + e); }).join('\n') + '\n',
            vm
          );
        }
      }
      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach(function (e) { return tip(e.msg, vm); });
        } else {
          compiled.tips.forEach(function (msg) { return tip(msg, vm); });
        }
      }
    }

    // turn code into functions
    var res = {};
    var fnGenErrors = [];
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
      return createFunction(code, fnGenErrors)
    });

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use
    /* istanbul ignore if */
    if (true) {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn$$1(
          "Failed to generate render function:\n\n" +
          fnGenErrors.map(function (ref) {
            var err = ref.err;
            var code = ref.code;

            return ((err.toString()) + " in\n\n" + code + "\n");
        }).join('\n'),
          vm
        );
      }
    }

    return (cache[key] = res)
  }
}

/*  */

function createCompilerCreator (baseCompile) {
  return function createCompiler (baseOptions) {
    function compile (
      template,
      options
    ) {
      var finalOptions = Object.create(baseOptions);
      var errors = [];
      var tips = [];

      var warn = function (msg, range, tip) {
        (tip ? tips : errors).push(msg);
      };

      if (options) {
        if ( true && options.outputSourceRange) {
          // $flow-disable-line
          var leadingSpaceLength = template.match(/^\s*/)[0].length;

          warn = function (msg, range, tip) {
            var data = { msg: msg };
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength;
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength;
              }
            }
            (tip ? tips : errors).push(data);
          };
        }
        // merge custom modules
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules);
        }
        // merge custom directives
        if (options.directives) {
          finalOptions.directives = extend(
            Object.create(baseOptions.directives || null),
            options.directives
          );
        }
        // copy other options
        for (var key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key];
          }
        }
      }

      finalOptions.warn = warn;

      var compiled = baseCompile(template.trim(), finalOptions);
      if (true) {
        detectErrors(compiled.ast, warn);
      }
      compiled.errors = errors;
      compiled.tips = tips;
      return compiled
    }

    return {
      compile: compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

/*  */

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
var createCompiler = createCompilerCreator(function baseCompile (
  template,
  options
) {
  var ast = parse(template.trim(), options);
  if (options.optimize !== false) {
    optimize(ast, options);
  }
  var code = generate(ast, options);
  return {
    ast: ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
});

/*  */

var ref$1 = createCompiler(baseOptions);
var compile = ref$1.compile;
var compileToFunctions = ref$1.compileToFunctions;

/*  */

// check whether current browser encodes a char inside attribute values
var div;
function getShouldDecode (href) {
  div = div || document.createElement('div');
  div.innerHTML = href ? "<a href=\"\n\"/>" : "<div a=\"\n\"/>";
  return div.innerHTML.indexOf('&#10;') > 0
}

// #3663: IE encodes newlines inside attribute values while other browsers don't
var shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
// #6828: chrome encodes content in a[href]
var shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false;

/*  */

var idToTemplate = cached(function (id) {
  var el = query(id);
  return el && el.innerHTML
});

var mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && query(el);

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
     true && warn(
      "Do not mount Vue to <html> or <body> - mount to normal elements instead."
    );
    return this
  }

  var options = this.$options;
  // resolve template/el and convert to render function
  if (!options.render) {
    var template = options.template;
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template);
          /* istanbul ignore if */
          if ( true && !template) {
            warn(
              ("Template element not found or is empty: " + (options.template)),
              this
            );
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML;
      } else {
        if (true) {
          warn('invalid template option:' + template, this);
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el);
    }
    if (template) {
      /* istanbul ignore if */
      if ( true && config.performance && mark) {
        mark('compile');
      }

      var ref = compileToFunctions(template, {
        outputSourceRange: "development" !== 'production',
        shouldDecodeNewlines: shouldDecodeNewlines,
        shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      options.render = render;
      options.staticRenderFns = staticRenderFns;

      /* istanbul ignore if */
      if ( true && config.performance && mark) {
        mark('compile end');
        measure(("vue " + (this._name) + " compile"), 'compile', 'compile end');
      }
    }
  }
  return mount.call(this, el, hydrating)
};

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el) {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    var container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Vue);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	// It's empty as some runtime module handles the default behavior
/******/ 	__webpack_require__.x = x => {};
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// Promise = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"/js/app": 0
/******/ 		};
/******/ 		
/******/ 		var deferredModules = [
/******/ 			["./resources/js/app.js"],
/******/ 			["./resources/sass/app.scss"],
/******/ 			["./resources/sass/settings_piano.scss"]
/******/ 		];
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		var checkDeferredModules = x => {};
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime, executeModules] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0, resolves = [];
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					resolves.push(installedChunks[chunkId][0]);
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			while(resolves.length) {
/******/ 				resolves.shift()();
/******/ 			}
/******/ 		
/******/ 			// add entry modules from loaded chunk to deferred list
/******/ 			if(executeModules) deferredModules.push.apply(deferredModules, executeModules);
/******/ 		
/******/ 			// run deferred modules when all chunks ready
/******/ 			return checkDeferredModules();
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 		
/******/ 		function checkDeferredModulesImpl() {
/******/ 			var result;
/******/ 			for(var i = 0; i < deferredModules.length; i++) {
/******/ 				var deferredModule = deferredModules[i];
/******/ 				var fulfilled = true;
/******/ 				for(var j = 1; j < deferredModule.length; j++) {
/******/ 					var depId = deferredModule[j];
/******/ 					if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferredModules.splice(i--, 1);
/******/ 					result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 				}
/******/ 			}
/******/ 			if(deferredModules.length === 0) {
/******/ 				__webpack_require__.x();
/******/ 				__webpack_require__.x = x => {};
/******/ 			}
/******/ 			return result;
/******/ 		}
/******/ 		var startup = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			// reset startup function so it can be called again when more startup code is added
/******/ 			__webpack_require__.x = startup || (x => {});
/******/ 			return (checkDeferredModules = checkDeferredModulesImpl)();
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// run startup
/******/ 	__webpack_require__.x();
/******/ })()
;