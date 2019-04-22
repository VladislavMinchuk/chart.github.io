/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

window.onload = function () {
  document.querySelector('.loader-wrapper').classList.add('loaded');

  var Chart = function () {
    function Chart(options) {
      _classCallCheck(this, Chart);

      this.animationTime = options.animationTime || 500;
      this.stepPointsX = options.stepPointsX || 50;
      this.chartsColors = options.chartsColors || ['#f00', '#0f0', '#00f', '#333']; // color for each chart
      this.mapColors = new Map(); // map to link color and currency ()
      this.setNamesCurrency = new Set(); // set for save state checked currency

      this.init(options);
    }

    _createClass(Chart, [{
      key: 'init',
      value: function init(options) {
        this.findELements(options);
        this.events();
      }
    }, {
      key: 'findELements',
      value: function findELements(options) {
        this.mainWrapper = document.querySelector(options.mainWrapper);
        this.chartSvgElement = this.mainWrapper.querySelector(options.chartSvg);
        this.dateListOutput = this.mainWrapper.querySelector(options.dateList);
        this.currencyListOutput = this.mainWrapper.querySelector(options.currencyList);
        this.currencySelectOutput = this.mainWrapper.querySelector(options.currencySelect);
      }
    }, {
      key: 'ajaxGetRequest',
      value: function ajaxGetRequest(url) {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url, true);
          xhr.send();

          xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) {
              return;
            }

            if (xhr.status != 200) {
              reject(xhr.statusText);
            } else {
              var response = JSON.parse(xhr.responseText);
              resolve(response);
            }
          };
        });
      }

      // select DOM element build handler

    }, {
      key: 'selectBuildHandler',
      value: function selectBuildHandler(responseObj) {
        var counter = 0;

        for (var key in responseObj.rates) {
          if (Object.hasOwnProperty.call(responseObj.rates, key)) {
            this.mapColors.set(key, this.chartsColors[counter]);
            this.currencySelectOutput.innerHTML += '<option value=' + key + '>' + key + '</option>';
            counter += 1;
          }
        }
      }
    }, {
      key: 'events',
      value: function events() {
        var _this = this;

        var self = this;

        // ajax request for build select DOM element
        this.ajaxGetRequest('https://api.exchangeratesapi.io/latest?symbols=CZK,JPY,PHP,RUB').then(function (response) {
          _this.selectBuildHandler(response); // call build handler
        }).catch(function (error) {
          return console.log(error);
        });

        this.currencySelectOutput.addEventListener('input', function () {
          self.selectEvent(this);
        });

        this.currencyListOutput.addEventListener('click', function (e) {
          if (e.target.className === 'delete-btn') {
            self.deleteChartItem(e.target.getAttribute('data-id'));
            this.removeChild(e.target.parentNode);
          }
        });
      }
    }, {
      key: 'selectEvent',
      value: function selectEvent(select, event) {
        var _this2 = this;

        // if current currency is't in the Set (setNamesCurrency) => need ajax request
        if (!this.setNamesCurrency.has(select.value)) {
          this.ajaxGetRequest('https://api.exchangeratesapi.io/history?start_at=2005-12-31&end_at=2018-12-31&symbols=' + select.value).then(function (responseObj) {
            return _this2.charBuild(responseObj, select.value);
          }) // handler for build chart
          .catch(function (error) {
            return console.log(error);
          });

          this.setNamesCurrency.add(select.value); // add currency to Set
        }
      }

      // handler for build chart

    }, {
      key: 'charBuild',
      value: function charBuild(response, currency) {
        var groupSvgElem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var pointsArr = [];
        var setDatePoints = [];
        var circles = void 0;
        var path = void 0;
        var day = void 0;
        var month = void 0;

        groupSvgElem.setAttribute('id', currency + '-group');

        for (var key in response.rates) {
          if (Object.prototype.hasOwnProperty.call(response.rates, key)) {
            var dateParts = key.split('-');

            day = parseInt(dateParts[2], 10);
            month = parseInt(dateParts[1], 10);

            if (day === 1 && month === 8) {
              pointsArr.push(response.rates[key][currency]);
              setDatePoints.push(key);
            }
          }
        }

        if (!this.dateListOutput.childNodes.length) {
          setDatePoints.sort();
          this.buildDateList(setDatePoints);
        }

        this.pointChartBuild(pointsArr.sort(function (a, b) {
          return a - b;
        }), groupSvgElem, currency); // sort points array
      }
    }, {
      key: 'buildDateList',
      value: function buildDateList(dateArray) {
        var length = dateArray.length;


        this.dateListOutput.classList.add('active');

        for (var i = 0; i < length; i++) {
          var listItem = document.createElement('li');
          listItem.innerHTML = dateArray[i];
          this.dateListOutput.appendChild(listItem);
        }
      }
    }, {
      key: 'pointChartBuild',
      value: function pointChartBuild(pointsArr, groupSvgElem, currency) {
        var _this3 = this;

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var chartHeight = this.chartSvgElement.clientHeight;
        var pointX = 0;
        var points = 0;
        var firstPoint = void 0;

        pointsArr.forEach(function (item) {
          if (!pointX) {
            firstPoint = chartHeight - item;
            pointX = _this3.stepPointsX;
          } else {
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

            circle.setAttribute('r', '3');
            circle.setAttribute('fill', 'blue');
            circle.setAttribute('cx', '' + pointX);
            circle.setAttribute('cy', '' + (chartHeight - item));
            circle.setAttribute('data-text', '' + item);
            groupSvgElem.appendChild(circle);

            setTimeout(function () {
              _this3.chartSvgElement.appendChild(groupSvgElem);
            }, _this3.animationTime);

            points += pointX + ' ' + (chartHeight - item) + ' ';
            pointX += _this3.stepPointsX;

            // mouseenter circle for show point
            circle.addEventListener('mouseenter', function () {
              this.setAttribute('r', '5');
              var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
              text.setAttribute('x', '' + this.getAttribute('cx'));
              text.setAttribute('y', '' + (chartHeight - item - 10));
              text.setAttribute('class', 'currency-value');

              text.innerHTML = item.toFixed(1);
              groupSvgElem.appendChild(text);
            });

            // mouseenter circle for hide point
            circle.addEventListener('mouseleave', function () {
              this.setAttribute('r', '3');
              groupSvgElem.querySelector('text.currency-value').remove();
            });
          }
        });

        path.setAttribute('id', '' + currency);
        path.setAttribute('d', 'M0 ' + firstPoint + ' L ' + points);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', this.mapColors.get('' + currency));
        path.setAttribute('stroke-width', '2');

        this.chartSvgElement.appendChild(path);

        this.setAnimatePath(path);
        this.buildList(currency, this.mapColors.get('' + currency));
      }
    }, {
      key: 'setAnimatePath',
      value: function setAnimatePath(path) {
        var svgPath = path;
        var pathLength = path.getTotalLength();
        svgPath.style.strokeDasharray = pathLength + ' ' + pathLength;
        svgPath.style.strokeDashoffset = pathLength;
        svgPath.getBoundingClientRect();
        svgPath.style.setProperty('transition', 'stroke-dashoffset ' + this.animationTime / 1000 + 's linear');
        svgPath.style.strokeDashoffset = '0';
      }
    }, {
      key: 'buildList',
      value: function buildList(iDitem, colorChart) {
        var listItem = document.createElement('LI');
        var colorBlock = document.createElement('SPAN');
        var deleteButton = document.createElement('BUTTON');

        listItem.innerHTML = iDitem;
        this.currencyListOutput.appendChild(listItem);
        listItem.appendChild(colorBlock);
        listItem.appendChild(deleteButton);
        deleteButton.classList.add('delete-btn');
        deleteButton.setAttribute('data-id', '' + iDitem);
        colorBlock.style.background = colorChart;
      }
    }, {
      key: 'deleteChartItem',
      value: function deleteChartItem(id) {
        var removeELems = {
          path: document.getElementById('' + id),
          groupPoints: document.getElementById(id + '-group')
        };

        for (var key in removeELems) {
          if (Object.prototype.hasOwnProperty.call(removeELems, key)) {
            this.chartSvgElement.removeChild(removeELems[key]);
            this.setNamesCurrency.delete('' + id);
            this.currencySelectOutput.options.selectedIndex = 0;
          }
        }
      }
    }]);

    return Chart;
  }();

  var newChart = new Chart({
    mainWrapper: '.main-container',
    chartSvg: '#chart',
    dateList: '#date-list',
    currencyList: '#currency-list',
    currencySelect: '#currency-select',
    animationTime: 1000,
    stepPointsX: 60,
    chartsColors: ['#8ca0f5', '#61dff7', '#efee83', '#ef9483']
  });
};

/***/ })
/******/ ]);
//# sourceMappingURL=script.js.map