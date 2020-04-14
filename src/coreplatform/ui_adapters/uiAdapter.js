/**
 * The UI-Adapter organizes the UI-structure, more specifically the representation of an
 * active smart service and it's C-minions.
 * Every variant of this adapter should implement a representation for a smart service and
 * its corresponding C-minions.
 *
 * It allocates each Cmin their space on screen and manages current output seen by the user.
 *
 * This adapter allows to use the same interface for service specific Core-UI communication on
 * different UI platforms, e.g. PC and mobile. Non DOM UI is also compatible, as long as the
 * output can be controlled with javascript
 * @interface
 */

const $ = require('jquery');

class InvalidIdError extends Error {
    constructor(message) {
        super(message);
    }
}

class InvalidArgumentError extends Error {
    constructor(message) {
        super(message);
    }
}

class NotImplementedError extends Error {
    constructor(message) {
        super(message);
    }
}

class uiAdapter {
    /**
     * Create the UI Adapter and setup all necessary UI elements (e.g. DOM)
     * @param {*} needed_methods
     */
    constructor() {

    };

    /**
     * Take the configuration object defining the smart service and create visualization accordingly
     * @param {*} config The smart service configuration to be shown
     */

    async showService(config) {


    }

    /**
     * Notify the user with a message
     * @param {string} sourceId The ID of the callee
     * @param {string} message The notification message
     */

    sendNotification(sourceId, message) {

    }

    /**
     * This is the main interface for information and data flow to the user.
     * 
     * @param {number} sourceId The ID of the data source's minion
     * @param {*} data The input in the chosen data format
     */
    addData(sourceId, data) {

    }

    /**
     * Request a input by the user 
     * @param {string} sourceId The ID of the callee
     * @param {string} type The type of the requested input
     * @param {string} prompt A short prompt describing what is needed
     * @param {function} callback A callback function for the user input
     */
    requestInput(sourceId, type, prompt, callback) {
        switch (type) {
            case "integer":
                throw new NotImplementedError("UIadapter method request input not implemented");
            case "string":
                throw new NotImplementedError("UIadapter method request input not implemented");
            case "binary":
                throw new NotImplementedError("UIadapter method request input not implemented");
            case "decision":
                throw new NotImplementedError("UIadapter method request input not implemented");
            default:
                throw new InvalidArgumentError("Unknown type for input: " + type);
        }
    }

    /**
     * Clear everything UI related
     */
    clearUI() {

    }

    /**
     * Check the compatibility of the adapter with the requirements of the smart service
     * @param {*} config Configuration json of the service to check compatibility
     */
    verifyCompatibility(config) {
        return 2;
    }
}

/**
 * Concrete implementation of the uiAdapter for a DOM interface in browsers.
 * This class mainly uses material design lite components ("https://code.getmdl.io")
 * 
 * All C-minions are allocated a container in the form of a div with class="mdl-card"
 * They are all inserted into an mdl-grid layout that keeps the proportional
 * 
 * The cards are constructed like this:
 * __________________________
 *|                          |
 *|   Media area             |
 *|                          |
 *|                          |
 *|                          |
 *|                          |
 * ___________________________
 *| (Icon)  Minion name  ^ _ |
  ___________________________
 *|      Short description   |
 *|                          |
  ____________________________
 * 
 * @class
 */
class domAdapter extends uiAdapter {

    // Dependencies

    static get GRAPH_LIBRARY() {
        return "https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"
    }

    static get PLOT_LIBRARY() {
        return "https://cdn.jsdelivr.net/npm/apexcharts"
    }

    static get VIDEO_LIBRARY() {
        return "https://www.youtube.com/iframe_api"
    }

    static get MATERIAL_DESIGN_LITE() {
        return "https://code.getmdl.io/1.3.0/material.min.js";
    }

    static get STYLESHEETS() {
        return ["https://code.getmdl.io/1.3.0/material.light_blue-light_green.min.css", "https://fonts.googleapis.com/icon?family=Material+Icons"];
    }

    /**
     * Initialize the adapter with the UI space it should occupy, e.g. all but the header
     * @param {HTMLElement} visualizationSpace 
     */
    constructor(visualizationSpace) {
        super();
        this.visualizationSpace = visualizationSpace;

        //promises for dynamic library loading
        this.promises = {};

        // references to all minion container card
        this.cards = {};

        // callbacks for new data input through the addData function
        this.callbacks = {};

        // references for all charts used
        this.charts = {};

        // count of cards currently shown on screen
        this.active_cards = 0;

    }



    /**
     * Show the user a selection of smart services specified by their IDs
     * 
     * @param {*} configurations The SSCs to be visualized
     * @param {*} startService Callback to the tucana framework to start a service
     */
    showService(startService) {
        // for each SSC create a card
        
            startService('EVARESTHMIB');

    }

    /**
     * Show the user a selection of smart services specified by their IDs
     * 
     * @param {*} configurations The SSCs to be visualized
     * @param {*} startService Callback to the tucana framework to start a service
     */
    showServiceSelection(configurations, startService) {
        var selection_grid = document.createElement("div");
        selection_grid.className = "mdl-grid";

        var i = 0;
        var _this = this;

        // for each SSC create a card

        configurations.smartServiceConfigurationItemIds.forEach(function (config) {
            
            var card = document.createElement("div");
            card.className = "mdl-card selection-card mdl-cell mdl-cell--top";
            if (i == 0) {
                card.className += " mdl-cell--6-col";
            } else {
                card.className += " mdl-cell--3-col";
            }
            var media = document.createElement("div");
            media.className = "mdl-card__media";
            var img = document.createElement("img");
            img.style.width = "100%";
            img.src = "./showcases/EVAREST-HMI/images/shopping.jpg";
            media.appendChild(img);
            card.appendChild(media);

            _this.addCardTitle(card, 'EVAREST Demonstrator', 'EVAREST Demonstrator' + "-presentation", false);
            _this.addCardText(card, 'This service shows interaction between producer and provider at EVAREST Data Marketplace along with smart contract visualization.', true);
            _this.addCardAction(card, "start", function () {
                

                this.name = localStorage.getItem("name")
                if(localStorage.getItem("role")){
                    if(localStorage.getItem("producer") == "true"){
                        console.log(localStorage.getItem("producer"));
                        _this.userType = 'producer'
                    }
                    else if(localStorage.getItem("provider") == "true"){
                        console.log(localStorage.getItem("producer"));
                        _this.userType = 'provider'
                    }
                    else {_this.userType = 'guest'}
                }
                else{_this.userType = 'guest'}
                
                if (_this.userType == 'producer') {
                    //window.open('','_self').close()
                    window.open("showcases/EVAREST-HMI/html/main.html?role=producer?name=" + this.name);
                }
                else if (_this.userType == 'provider') {
                      //window.open('','_self').close();
                      window.open("showcases/EVAREST-HMI/html/main10.html?role=provider?name=" + this.name);
                }
                else if (_this.userType == 'guest') {
                    window.open("showcases/EVAREST-HMI/html/main20.html?role=guest?name=" + this.name);
                } 
                //_this.clearView();
                startService(config.id);
                console.log("configuration started")
            });


            i += 1;
            selection_grid.appendChild(card);


        });
        if (typeof componentHandler !== "object") {
            this.loadDependency(domAdapter.MATERIAL_DESIGN_LITE, function () {
                _this.visualizationSpace.appendChild(selection_grid);
                componentHandler.upgradeDom();
            });
        } else {
            _this.visualizationSpace.appendChild(selection_grid);
            componentHandler.upgradeDom();
        }
    }

    /**
     * The initialization method to show a service
     * All C-minions are allocated a container in the form of a div with class="mdl-card"
     * They are all inserted into an mdl-grid layout that keeps the proportional
     * 
     * The cards are constructed like this:
     * __________________________
     *|                          |
     *|   Media area             |
     *|                          |
     *|                          |
     *|                          |
     *|                          |
     * ___________________________
     *| (Icon)  Minion name  ^ _ |
      ___________________________
     *|      Short description   |
     *|                          |
      ____________________________
     * @param {*} config The smart service configuration
     * @param {*} endService Callback to end the service
     */

    showService(config, endService) {
        const _this = this;
        //await this.loadStylesheets(domAdapter.STYLESHEETS);
        // the container for the service
        
        /*
        var container = document.createElement("div");
        container.className = "service-container";

        // unique id
        var instance_number = 0;
        while (document.querySelector("#container-" + config.name + instance_number)) {
            instance_number += 1;
        }
        _this.id = "container-" + config.name + instance_number;
        //container.id = _this.id;


        // A sidebar to offer control over the service (end, settings,...)
        var sidebar = document.createElement("div");
        sidebar.className = "service-sidebar"
        var endbutton = document.createElement("button");
        endbutton.className = "mdl-button mdl-button--icon mdl-js-button";
        endbutton.innerHTML = "<i class='material-icons'>cancel</i>";
        endbutton.onclick = function () {
            endService();
            _this.clearUI();
        }

        var settingbutton = document.createElement("button");
        settingbutton.className = "mdl-button mdl-button--icon mdl-js-button";
        settingbutton.innerHTML = "<i class='material-icons'>settings</i>";

        var settings = document.createElement("div");
        this.settings = settings;
        settings.id = "service-settings";

        settings.style.display = "none";

        settingbutton.onclick = function () {
            if (settings.style.display === "none") {
                settings.style.display = "block";
            } else {
                settings.style.display = "none";
            }
        }

        var actions = document.createElement("div");
        actions.appendChild(endbutton);
        actions.appendChild(settingbutton);
        sidebar.appendChild(actions);
        sidebar.appendChild(settings);

        // create the header
        var header = document.createElement("h3");
        header.className = "service-header";
        header.innerText = config.name;
        sidebar.appendChild(header);

        // Each container has a button in the sidebar to show and hide it
        // The first card is always a summary with a graph representation of the service
        var summary_button = document.createElement("button");
        summary_button.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent minion-button";
        summary_button.innerText = "Summary";
        sidebar.appendChild(summary_button);
        summary_button.onclick = function () {
            _this.cardAction("descriptionMinion");
        }.bind(_this);

        container.append(sidebar);

        // The grid layout that organizes all minion containers
        var card_grid = document.createElement("div");
        card_grid.className = "mdl-grid";
        _this.card_grid = card_grid;
        container.appendChild(card_grid);


        // Create a card that summarizes the service
        var descriptionCard = _this.createCard("Summary", config.descriptionText, "descriptionMinion", true);
        _this.makeServiceGraph(descriptionCard, config);

        _this.cards["descriptionMinion"] = descriptionCard;
        card_grid.appendChild(descriptionCard);

        // A visual container for each C-minion is created

        config.configuration.forEach(function (minion) {
            switch (minion.type) {
                case "C":
                    break;
                default:
                    return;
            }

            // A controlling button is added to the sidebar
            var minion_button = document.createElement("button");
            minion_button.onclick = function () {
                _this.cardAction(minion.instanceId);
            }.bind(_this);
            minion_button.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent minion-button";
            minion_button.innerText = minion.name;
            sidebar.appendChild(minion_button);

            // If available the description for this minion is used
            var description;
            if (minion.hasOwnProperty("description")) {
                description = minion.description;
            } else {
                description = "This is a TUCANA minion";
            }

            // A card div is made and inserted into the grid
            var card = _this.createCard(minion.name, description, minion.instanceId);
            _this.cards[minion.instanceId] = card;
            card_grid.appendChild(card);


        }.bind(_this));

        // Notification DOM elements
        var notification = document.createElement("div");
        notification.className = "mdl-js-snackbar mdl-snackbar";
        notification.id = "tucana-snackbar";
        var notif_text = document.createElement("div");
        notif_text.className = "mdl-snackbar__text";
        var notif_action = document.createElement("button");
        notif_action.className = "mdl-snackbar__action";
        notif_action.type = "button";

        notification.appendChild(notif_text);
        notification.appendChild(notif_action);
        document.body.appendChild(notification);

        // If material design has not been loaded yet load it here and apply its styles
        // after it is loaded (upgradeDom)
        if (typeof componentHandler !== "object") {
            this.loadDependency(domAdapter.MATERIAL_DESIGN_LITE, function () {
                _this.visualizationSpace.appendChild(container);
                componentHandler.upgradeDom();
            });
        } else {
            _this.visualizationSpace.appendChild(container);
            componentHandler.upgradeDom();
        }*/
    }

    sendNotification(sourceId, message) {
        this.checkId(sourceId);

        var snackbarContainer = document.querySelector('#tucana-snackbar');
        var data = {
            message: message,
            timeout: 2000
        };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
    }

    /**
     * This is the main interface for information and data flow to the user.
     * The data is forwarded to the callback created by the visualization (e.g. linechart) 
     */
    addData(sourceId, data) {
        if (this.callbacks.hasOwnProperty(sourceId)) {
            this.callbacks[sourceId](data);
        }
    }

    requestInput(sourceId, type, description, callback) {
        this.checkId(sourceId);

        switch (type) {
            case "binary": {
                this.addSetting(sourceId, type, description, callback);
                break;
            };
        case "action": {
            this.addCardAction(this.cards[sourceId], description, callback);
            break;
        }
        }
    }

    /**
     * Clear everything UI related
     */
    clearUI() {
        document.getElementById(this.id).remove();
        delete this.cards
        delete this.charts
        delete this.active_cards
        delete this.callbacks
        delete this.promises
    }

    /**
     * Cleanup after service selection so the {@link domAdapter#showService} can operate on a clean state
     */
    clearView() {
        this.cards = {};
        this.active_cards = 0;
        this.callbacks = {};
        var selection_grid = document.body.querySelector(".mdl-grid");
        selection_grid.parentNode.removeChild(selection_grid);
    }

    verifyCompatibility(config) {
        //TODO
        return true
    }

    /**
     * 
     * @param {string} id The ID of the callee
     * @param {string} videoid Id of the requested Youtube video
     * @param {boolean} autoplay Automatically start playing the video
     * @param {number} start Timestamp when to start the video
     * @param {function} callback Optional callback for possible data input
     */
    showYoutubeVideo(id, videoid, autoplay = false, start = 0, callback = null) {
        
        // Check id and presence of Youtube dependecy
        this.checkId(id)
        if (typeof YT !== "object") {
            this.loadDependency(domAdapter.VIDEO_LIBRARY, () => {
                this.showYoutubeVideo.apply(this, arguments)
            });
            return
        }
        var cardmedia = this.cards[id].querySelector(".card-media");

        window.onYouTubeIframeAPIReady = function () {
            let player = new YT.Player(cardmedia, {
                videoId: videoid,
                start: start,
                events: {
                    onReady: onPlayerReady
                }
            });
        }
        if (callback) {
            this.callbacks[id] = callback;
        }

        function onPlayerReady(event) {
            if (autoplay) {
                event.target.seekTo(start, true);
                event.target.playVideo()
            }
        };
    }

    /**
     * 
     * @param {string} id The ID of the callee
     * @param {string} url URL of the page to embed
     * @param {number} height Percentage of iframe height in form of a number in [0,1]
     * @param {boolean} popup Add a popup functionality callback
     */
    showIframe(id, url, height = 0.5, popup = true) {
        this.checkId(id);

        var iframe = document.createElement("iframe");
        iframe.src = url;


        if (popup) {
            // container for the popup
            var popupdiv = document.createElement("dialog");
            popupdiv.className = "mdl-dialog";

            var close = document.createElement("button");
            close.style.position = "absolute";
            close.style.top = 0;
            close.style.left = 0;
            close.className = "mdl-button mdl-button--icon red-button";
            close.innerHTML = "<i class='material-icons'>close</i>";
            close.onclick = function () {
                popupdiv.close();
            }

            popupdiv.append(close);
            popupdiv.appendChild(iframe);
            popupdiv.close();
            document.body.appendChild(popupdiv);

            // callback to show the popup upon data input 1
            var callback = function show(activate) {
                if (activate && !popupdiv.open) {
                    popupdiv.showModal();
                }

            }
            this.callbacks[id] = callback;

        } else {
            // embed iframe in card-media section
            var media = this.getMediaContainer(id);
            var frameheight = height * document.documentElement.clientHeight;
            media.style.height = parseInt(frameheight) + "px";
            media.append(iframe);
        }

    }

    /**
     * This chart follows the scheme of: https://apexcharts.com/react-chart-demos/line-charts/realtime/
     * Individual adjustments can be made by setting properties(chart, xaxis, dataLabels, stroke, series or color) in the config.
     * @param id The instance ID.
     * @param startData This data will be shown at the beginning
     * @param config https://apexcharts.com/react-chart-demos/line-charts/realtime/
     */
    showLineChart(id, startData = {}, config = {}) {
        var data = [];
        //draw initial data
        for (var i = 0; i < startData.length; i++) {
            var x = startData.x;
            var y = startData.y;
            data.push({
                x,
                y
            });
        }

        this.checkId(id);
        if (typeof ApexCharts !== "function") {
            this.loadDependency(domAdapter.PLOT_LIBRARY, () => {
                this.showLineChart.apply(this, arguments)
            });
            return
        }
        var media_card = this.cards[id].querySelector(".card-media");

        //default options for a flowing LineChart
        var options = {
            chart: {
                type: 'line',
                animations: {
                    enabled: true,
                    easing: 'linear',
                    dynamicAnimation: {
                        speed: 1000
                    }
                }
            },
            series: [{
                name: "",
                data: data

            },],
            xaxis: {
                tickAmount: 10,
                range: 10,
                tickPlacement: 'on',
                floating: false
            },


            dataLabels: {
                enabled: false
            },

            stroke: {
                curve: 'smooth'
            }
        }
        //set custom properties
        if (config.hasOwnProperty("chart")) {
            options.chart = config.chart;
        }
        if (config.hasOwnProperty("xaxis")) {
            options.xaxis = config.xaxis;
        }
        if (config.hasOwnProperty("dataLabels")) {
            options.dataLabels = config.dataLabels;
        }
        if (config.hasOwnProperty("stroke")) {
            options.stroke = config.stroke;
        }
        if (config.hasOwnProperty("series")) {
            options.series = config.series;
        }

        if (config.hasOwnProperty("colors")) {
            options.colors = config.colors;
        }
        var chart = new ApexCharts(media_card, options);

        //receiving new data this function updates the chart respectively
        var update = function (newData) {

            for (var i = 0; i < data.length - 10; i++) {

                data[i].x = newData.x - 11;
                data[i].y = data[i + 1].y;

            }
            let x = newData.x;
            let y = newData.y;
            data.push({
                x,
                y
            });

            chart.updateSeries([{
                data: data
            }]);

        }
        chart.render();
        this.charts[id] = chart;
        this.callbacks[id] = update;
    }
    
    /**
     * Functionality to show a bar chart
     * @param {string} id The ID of the callee
     * @param {Array<String>} labels The labels for the different bars
     * @param {*} config Additonal configuration options such as colors or initial values
     */
    showBarChart(id, labels, config) {
        this.checkId(id);
        if (typeof ApexCharts !== "function") {
            this.loadDependency(domAdapter.PLOT_LIBRARY, () => {
                this.showBarChart.apply(this, arguments)
            });
            return
        }

        // get the media container for the id
        var media_card = this.cards[id].querySelector(".card-media");
        var data;


        // initiate values
        if (!config.hasOwnProperty("init")) {
            data = new Array(labels.length).fill(0);
        } else {
            var init = config.init;
            if (init.length !== labels.length) {
                throw Error("Non equal amount of init values and labels");
            }
            data = init;
        }

        // configure apex charts
        var options = {
            chart: {
                type: 'bar',
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    //columnWidth: '30%',
                }
            },
            xaxis: {
                categories: labels
            },
            series: [{
                data: data
            }, ],
        };

        if (config.hasOwnProperty("colors")) {
            options.colors = config.colors;
        }
        var chart = new ApexCharts(media_card, options);

        // Update replacing the data at the specified index
        var update = function (input) {

            data[input.index] = input.value;
            chart.updateSeries([{
                data: data
            }]);
        }

        chart.render();
        this.charts[id] = chart;
        this.callbacks[id] = update;
    }

    /**
     * Create function for card containers ("https://getmdl.io/components/index.html#cards-section")
     * @param {string} title Title of the card
     * @param {string} description Description for the card
     * @param {string} id ID of the card's creating minion
     * @param {boolean} showText Whether to show or hide the description at the start
     */
    createCard(title, description, id, showText = false) {
        var newcard = document.createElement("div");
        newcard.id = "card_" + id;
        newcard.className = "mdl-card mdl-shadow--6dp mdl-cell mdl-cell--left mdl-cell--top mdl-cell--6-col";

        var media = document.createElement("div");
        media.className = "card-media";
        newcard.appendChild(media);

        this.addCardTitle(newcard, title, id);
        this.addCardText(newcard, description, showText);
        this.active_cards += 1;
        return newcard
    }

    /**
     * Function for collapsing/ expanding card
     * @param {string} id ID of the card
     */
    cardAction(id) {
        var card = this.cards[id];
        // expand or collapse the card by toggling the css class,  insert it after a certain timeout
        if (card.classList.contains("collapsed-card")) {
            this.card_grid.insertBefore(card, this.card_grid.childNodes[this.active_cards]);
            setTimeout(() => $("#card_" + id).toggleClass("collapsed-card"), 100);
            this.active_cards += 1;
        } else {
            $("#card_" + id).toggleClass("collapsed-card");
            var card_grid = this.card_grid;
            setTimeout(() => card_grid.insertBefore(card, null), 600);
            this.active_cards -= 1;
        }

    }


    /**
     * Hide/show the cards description
     * @param {string} id ID of the card
     */
    cardDescription(id) {
        var card = this.cards[id];

        var hidden = card.querySelector(".mdl-card__supporting-text.show-description");
        var button = card.querySelector(".expand-button");

        if (hidden) {
            hidden.className = "mdl-card__supporting-text";
            button.checked = true;
            button.className = "mdl-button expand-button mdl-button--icon";
        } else {
            var description = card.querySelector(".mdl-card__supporting-text");
            description.className = "mdl-card__supporting-text show-description";
            button.className += " rot";
        }
    }

    /**
     * Utility function to create the header row for a card
     * @param {HTMLElement} div The card div
     * @param {string} title Card title
     * @param {string} id Card ID
     * @param {boolean} offerInteraction Show minimization and expand buttons
     * @param {Object} icon Icon, not supported yet
     */
    addCardTitle(div, title, id, offerInteraction = true, icon = null) {
        var mdl_title = document.createElement("div");
        mdl_title.className = "mdl-card__title";

        // create the minimize and expand buttons if specified
        if (offerInteraction) {
            var expand = document.createElement("button");
            expand.className = "mdl-button expand-button mdl-button--icon";
            expand.innerHTML = "<i class='material-icons'>expand_more</i>";
            expand.id = id + "_expand";
            expand.onclick = () => {
                this.cardDescription(id);
            }

            var minimize = document.createElement("button");
            minimize.className = "mdl-button expand-button mdl-button--icon";
            minimize.innerHTML = "<i class='material-icons'>remove</i>";
            minimize.onclick = function () {
                this.cardAction(id);
            }.bind(this);

            var interaction_container = document.createElement("div");
            interaction_container.className = "interaction-button-container";
            interaction_container.appendChild(expand);
            interaction_container.appendChild(minimize);
            mdl_title.appendChild(interaction_container);
        }

        if (icon) {

        } else {
            this.addIcon(mdl_title, title, div)
        }
        var inside_title = document.createElement("h2");
        inside_title.innerText = title;
        inside_title.className = "mdl-card__title-text";
        mdl_title.appendChild(inside_title);


        div.appendChild(mdl_title);
    }

    /**
     * Utitlity to add an image to the media section of a card
     * @param {string} id ID of the card
     * @param {string} url URL of the image to add
     */
    addCardImage(id, url) {
        this.checkId(id);
        var media = this.getMediaContainer(id);

        var img = document.createElement("img");
        img.style.width = "100%";
        img.src = url;
        media.appendChild(img);
    }

    /**
     * Utility to add the description to a card
     * @param {HTMLElement} div The card div
     * @param {string} text The description
     * @param {boolean} show Show it on default after creation
     */
    addCardText(div, text, show = false) {

        var textdiv = document.createElement("div");
        textdiv.className = "mdl-card__supporting-text";
        textdiv.innerText = text;
        if (show) {
            textdiv.className += " show-description";
            var expand = div.querySelector(".expand-button");
            if (expand) {
                expand.className += " rot";
            }
        }
        div.appendChild(textdiv);
    }

    /**
     * Utility to add clickable actions on a card
     * @param {HTMLElement} div The card
     * @param {string} text The prompt for the text
     * @param {function} callback Callback for when the action is taken
     */
    addCardAction(div, text, callback) {
        var actions = div.querySelector(".mdl-card__actions");
        // if no div is present create it
        if (!actions) {
            actions = document.createElement("div");
            actions.className = "mdl-card__actions mdl-card--border";
        }
        var button = document.createElement("a");
        button.className = "mdl-button action-button mdl-js-button mdl-js-ripple-effect";
        button.innerText = text;
        button.onclick = callback;

        actions.appendChild(button);
        div.appendChild(actions);
    }

    /**
     * 
     * @param {string} id ID of the callee
     * @param {string} type Type of setting requested
     * @param {string} text Prompt describing the setting
     * @param {function} callback Callback when setting is changed
     */
    addSetting(id, type, text, callback) {
        switch (type) {
            // for binary settings a switch is created and added to the (hidden) menu
            // accessible through the button in the top left of the service container
            case "binary": {
                // use of label and input elements styled with mdl
                var label = document.createElement("label");
                label.className = "mdl-switch mdl-js-switch mdl-js-ripple-effect";
                label.htmlFor = id + type + text;

                var input = document.createElement("input");
                input.type = "checkbox";
                input.id = id + type + text;
                input.className = "mdl-switch__input";
                input.checked = true;
                input.onchange = function () {
                    callback(input.checked);
                }

                var description = document.createElement("span");
                description.className = "mdl-switch__label";
                description.innerText = text;

                label.appendChild(input);
                label.appendChild(description);
                this.settings.appendChild(label);
                componentHandler.upgradeElement(label);

                break;
            }
            default:
                throw new InvalidArgumentError("Invalid setting type: " + type);
        }
    }

    /**
     * Utility function to add an icon to a card and some hover functionality
     * @param {HTMLElement} div Div where the icon is to be added
     * @param {*} text Name of the minion which requests this icon
     * @param {*} card Div of the card on which this icon is placed
     */
    addIcon(div, text, card) {
        var icon = document.createElement("button");
        icon.className = "mdl-button mdl-js-button mdl-button--fab card-icon";
        icon.style.background = "red";
        icon.innerText = text[0];
        var expanded = div.querySelector(".expand-button");
        if (expanded) {
            expanded = expanded.classList;
            // add eventlisteners that to show/hide the card description
            icon.onmouseover = function () {
                if (!expanded.contains("rot")) {
                    card.querySelector(".mdl-card__supporting-text").className += " show-description";
                }
            }
            icon.onmouseleave = function () {
                if (!expanded.contains("rot")) {
                    card.querySelector(".mdl-card__supporting-text").className = "mdl-card__supporting-text";
                }
            }
        }
        div.appendChild(icon);
    }

    /**
     * Utility function to create a graph representation of the minions in a service and the data flow
     * @param {HTMLElement} div Div of the container for this graph
     * @param {*} conf configuration that describes minion structure
     */
    makeServiceGraph(div, conf) {
        if (typeof vis !== "object") {
            $("head").append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.css">');
            this.loadDependency(domAdapter.GRAPH_LIBRARY, () => {
                this.makeServiceGraph.apply(this, arguments)
            });
            return
        }

        var graph = div.querySelector(".card-media");

        var nodes = [];
        var edges = [];
        conf.configuration.forEach(function (minion) {
            // each minion is assigned a group based on their type for color coding
            var group = minion.type === "P" ? 0 : minion.type === "T" ? 1 : 2;

            // a node is created and for all its targetIDs an edge is added
            var minion_node = {
                id: minion.instanceId,
                label: minion.name,
                group: group
            };
            minion.targetMinionIds.forEach(function (id) {
                var edge = {
                    from: minion.instanceId,
                    to: id,
                    arrows: "to"
                }
                edges.push(edge);
            })
            nodes.push(minion_node);
        })
        nodes = new vis.DataSet(nodes);

        // create an array with edges
        edges = new vis.DataSet(edges);
        var height = 0.4 * document.documentElement.clientHeight;
        // create a network
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            nodes: {
                shape: "dot",
                size: 40,
                borderWidth: 3
            },
            height: parseInt(height) + "px",
        };
        var network = new vis.Network(graph, data, options);

    }


    /**
     * Utility function to load dependencies through appending scripts in the head
     * Once they are loaded the given callback is used so the callee can resume execution
     * @param {string} src URL of the dependency
     * @param {function} callback Callback that is called after the dependency has been loaded
     */
    loadDependency(src, callback) {
        // if the dependency is currently being loaded add it to the promises
        if (this.promises.hasOwnProperty("src")) {
            this.promises[src].then(callback)
        
        // else created a new promise that triggers the callback on resolve
        } else {
            this.promises[src] = new Promise(function (resolve, reject) {
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.onload = resolve;
                script.onerror = reject;
                script.src = src;
                document.body.append(script);
            });
            this.promises[src].then(callback);
        }
    }

    /**
     * utility to load stylesheets dynamically
     * @param {Array<String>} List of stylesheet URLs to be loaded
     */
    async loadStylesheets(urls) {
        var promises = [];
        for (let i = 0; i < urls.length; i++) {
            promises.push(new Promise((resolve, reject) => {
                var head = document.getElementsByTagName('head')[0];
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = urls[i];
                link.onload = resolve;
                link.onerror = reject;
                head.appendChild(link);
            }));
        }
        return await Promise.all(promises);

    }

    /**
     * Check whether this known to the adapter and thus valid
     * @param {string} id ID to be checked
     */
    checkId(id) {
        if (!this.cards.hasOwnProperty(id)) {
            throw new InvalidIdError("Invalid id:" + id);
        }
    }

    /**
     * Utility function to get the card media div
     * @param {string} id ID of the card to search
     */
    getMediaContainer(id) {
        return this.cards[id].querySelector(".card-media")
    }
}

module.exports.uiAdapter = uiAdapter;
module.exports.domAdapter = domAdapter;