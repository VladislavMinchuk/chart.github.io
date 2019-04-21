class Chart {
  constructor(options) {
    this.animationTime = options.animationTime || 500;
    this.stepPointsX = options.stepPointsX || 50;
    this.chartsColors = options.chartsColors || ['#f00', '#0f0', '#00f', '#333']; // color for each chart
    this.mapColors = new Map(); // map to link color and currency ()
    this.setNamesCurrency = new Set(); // set for save state checked currency

    this.init(options);
  }

  init(options) {
    this.findELements(options);
    this.events();
  }

  findELements(options) {
    this.mainWrapper = document.querySelector(options.mainWrapper);
    this.chartSvgElement = this.mainWrapper.querySelector(options.chartSvg);
    this.dateListOutput = this.mainWrapper.querySelector(options.dateList);
    this.currencyListOutput = this.mainWrapper.querySelector(options.currencyList);
    this.currencySelectOutput = this.mainWrapper.querySelector(options.currencySelect);
  }

  ajaxGetRequest(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.send();

      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) {
          return;
        }

        if (xhr.status != 200) {
          reject(xhr.statusText);
        } else {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        }
      };
    });
  }

  // select DOM element build handler
  selectBuildHandler(responseObj) {
    let counter = 0;

    for (let key in responseObj.rates) {
      if (Object.hasOwnProperty.call(responseObj.rates, key)) {
        this.mapColors.set(key, this.chartsColors[counter]);
        this.currencySelectOutput.innerHTML += `<option value=${key}>${key}</option>`;
        counter += 1;
      }
    }
  }

  events() {
    const self = this;

    // ajax request for build select DOM element
    this.ajaxGetRequest('https://api.exchangeratesapi.io/latest?symbols=CZK,JPY,PHP,RUB')
      .then(response => {
        this.selectBuildHandler(response); // call build handler
      })
      .catch(error => console.log(error));

    this.currencySelectOutput.addEventListener('input', function() {
      self.selectEvent(this);
    });

    this.currencyListOutput.addEventListener('click', function(e) {
      if (e.target.className === 'delete-btn') {
        self.deleteChartItem(e.target.getAttribute('data-id'));
        this.removeChild(e.target.parentNode);
      }
    });
  }

  selectEvent(select, event) {
    // if current currency is't in the Set (setNamesCurrency) => need ajax request
    if (!this.setNamesCurrency.has(select.value)) {
      this.ajaxGetRequest(
        `https://api.exchangeratesapi.io/history?start_at=2005-12-31&end_at=2018-12-31&symbols=${
          select.value
        }`
      )
        .then(responseObj => this.charBuild(responseObj, select.value)) // handler for build chart
        .catch(error => console.log(error));

      this.setNamesCurrency.add(select.value); // add currency to Set
    }
  }

  // handler for build chart
  charBuild(response, currency) {
    const groupSvgElem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const pointsArr = [];
    const setDatePoints = [];
    let circles;
    let path;
    let day;
    let month;

    groupSvgElem.setAttribute('id', `${currency}-group`);

    for (let key in response.rates) {
      if (Object.prototype.hasOwnProperty.call(response.rates, key)) {
        const dateParts = key.split('-');

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

    this.pointChartBuild(pointsArr.sort((a, b) => a - b), groupSvgElem, currency); // sort points array
  }

  buildDateList(dateArray) {
    const { length } = dateArray;

    this.dateListOutput.classList.add('active');

    for (let i = 0; i < length; i++) {
      const listItem = document.createElement('li');
      listItem.innerHTML = dateArray[i];
      this.dateListOutput.appendChild(listItem);
    }
  }

  pointChartBuild(pointsArr, groupSvgElem, currency) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const chartHeight = this.chartSvgElement.clientHeight;
    let pointX = 0;
    let points = 0;
    let firstPoint;

    pointsArr.forEach(item => {
      if (!pointX) {
        firstPoint = chartHeight - item;
        pointX = this.stepPointsX;
      } else {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

        circle.setAttribute('r', '3');
        circle.setAttribute('fill', 'blue');
        circle.setAttribute('cx', `${pointX}`);
        circle.setAttribute('cy', `${chartHeight - item}`);
        circle.setAttribute('data-text', `${item}`);
        groupSvgElem.appendChild(circle);

        setTimeout(() => {
          this.chartSvgElement.appendChild(groupSvgElem);
        }, this.animationTime);

        points += `${pointX} ${chartHeight - item} `;
        pointX += this.stepPointsX;

        // mouseenter circle for show point
        circle.addEventListener('mouseenter', function() {
          this.setAttribute('r', '5');
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', `${this.getAttribute('cx')}`);
          text.setAttribute('y', `${chartHeight - item - 10}`);
          text.setAttribute('class', 'currency-value');

          text.innerHTML = item.toFixed(1);
          groupSvgElem.appendChild(text);
        });

        // mouseenter circle for hide point
        circle.addEventListener('mouseleave', function() {
          this.setAttribute('r', '3');
          groupSvgElem.querySelector('text.currency-value').remove();
        });
      }
    });

    path.setAttribute('id', `${currency}`);
    path.setAttribute('d', `M0 ${firstPoint} L ${points}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this.mapColors.get(`${currency}`));
    path.setAttribute('stroke-width', '2');

    this.chartSvgElement.appendChild(path);

    this.setAnimatePath(path);
    this.buildList(currency, this.mapColors.get(`${currency}`));
  }

  setAnimatePath(path) {
    const svgPath = path;
    const pathLength = path.getTotalLength();
    svgPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
    svgPath.style.strokeDashoffset = pathLength;
    svgPath.getBoundingClientRect();
    svgPath.style.setProperty(
      'transition',
      `stroke-dashoffset ${this.animationTime / 1000}s linear`
    );
    svgPath.style.strokeDashoffset = '0';
  }

  buildList(iDitem, colorChart) {
    const listItem = document.createElement('LI');
    const colorBlock = document.createElement('SPAN');
    const deleteButton = document.createElement('BUTTON');

    listItem.innerHTML = iDitem;
    this.currencyListOutput.appendChild(listItem);
    listItem.appendChild(colorBlock);
    listItem.appendChild(deleteButton);
    deleteButton.classList.add('delete-btn');
    deleteButton.setAttribute('data-id', `${iDitem}`);
    colorBlock.style.background = colorChart;
  }

  deleteChartItem(id) {
    const removeELems = {
      path: document.getElementById(`${id}`),
      groupPoints: document.getElementById(`${id}-group`),
    };

    for (let key in removeELems) {
      if (Object.prototype.hasOwnProperty.call(removeELems, key)) {
        this.chartSvgElement.removeChild(removeELems[key]);
        this.setNamesCurrency.delete(`${id}`);
        this.currencySelectOutput.options.selectedIndex = 0;
      }
    }
  }
}

const newChart = new Chart({
  mainWrapper: '.main-container',
  chartSvg: '#chart',
  dateList: '#date-list',
  currencyList: '#currency-list',
  currencySelect: '#currency-select',
  animationTime: 1000,
  stepPointsX: 60,
  chartsColors: ['#8ca0f5', '#61dff7', '#efee83', '#ef9483'],
});
