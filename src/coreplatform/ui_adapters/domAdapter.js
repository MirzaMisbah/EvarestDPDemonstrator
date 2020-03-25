require("./uiAdapter");

class domAdapter extends uiAdapter {

    constructor(visualizationSpace) {
        super();
        this.visualizationSpace = visualizationSpace;
    }

    showService(config) {

        // the container for the service
        var container = document.createElement("div");
        container.className = "service-container";
        var instance_number = 1;
        while(document.querySelector("#container-"+config.serviceName+instance_number)){
            instance_number+=1;
        }
        this.id = "container-" + config.serviceName + instance_number;
        container.id = this.id;

        // create the header
        var topbar = document.createElement("div");
        topbar.className = "service-topbar mdl-color--accent"

        var endbutton = document.createElement("button");
        endbutton.className = "mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect";
        endbutton.innerHTML = "<i class='material-icons'>cancel</i>";
        endbutton.onclick = this.clearUI.bind(this);
        topbar.appendChild(endbutton);

        var header = document.createElement("h3");
        header.className = "service-header";
        header.innerText = config.serviceName; 
        topbar.appendChild(header);


        var buttonbar = document.createElement("span");
        buttonbar.className = "button-bar";
        topbar.appendChild(buttonbar);
        container.append(topbar);

        // make the grid
        var card_grid = document.createElement("div");
        card_grid.className = "mdl-grid";
        this.card_grid = card_grid;
        container.appendChild(card_grid);

        // init state keeping variables
        this.card_count = 0;
        this.cards = {};
        this.active_cards = [];
        this.callbacks = {};
        this.charts = {};

        // create the description card
        var descriptionCard = this.createCard(config.descriptionTitle, config.descriptionText, "descriptionMinion");
        this.makeServiceGraph(descriptionCard, config);
        

        this.cards.descriptionMinion = descriptionCard;
        this.showCard("descriptionMinion");


        config.minionList.forEach(function (minion) {
            var minion_button = document.createElement("button");
            minion_button.onclick = function(){
                this.cardAction(minion.id);
            }.bind(this);
            minion_button.className = "mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored";
            minion_button.innerText = minion.name;
            buttonbar.appendChild(minion_button);

            var description;
            var type = minion.type;
            if (minion.hasOwnProperty("description")) {
                description = minion.description;
            } else {
                switch (type) {
                    case "P":
                        description = "This minion collects data";
                        break;
                    case "T":
                        description = "This minion analyzes data";
                        break;
                    case "C":
                        description = "This minion visualizes results";
                        break;
                }
            }

            var card = this.createCard(minion.name, description, minion.id);
            this.cards[minion.id] = card;
            if (minion.hasOwnProperty("default_show")) {
                if (minion.default_show) {
                    this.showCard(minion.id);
                }
            }
        }.bind(this))

        this.visualizationSpace.appendChild(container);
        this.showBarChart("result",["heartbeat"],{colors:["#00c853"], init:[10]});
    }

    sendNotification(message, source) {

    }

    addData(data, source) {
        if(this.callbacks.hasOwnProperty(source)){
            this.callbacks[source](data);
        }
    }

    requestInput(type, callback) {

    }

    /**
     * Clear everything UI related 
     */
    clearUI() {
        document.getElementById(this.id).remove();
        delete this.cards
        delete this.charts
        delete this.active_cards
    }

    verifyCompatibility(config) {
        return 2;
    }

    showBarChart(id, labels, config) {
        if(!this.cards.hasOwnProperty(id)){
            throw new Error("invalid minion id");
        }
        var init = config.init;
        var data = []; 
        if(init.length !== labels.length) {
            labels.forEach(function(label){
                data.push({
                    x : label,
                    y : 0
                });
            })
        } else {
            data = labels.map(function(label,index){
                return {x:label, y:init[index]}
            })
        }

        var options = {
            chart: {
                height: 350,
                type: 'bar',
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth:'30%',
                }
            },
            xaxis:{
                categories:labels
            },
            series:[{
                data: data
            },],            
        };

        if(config.hasOwnProperty("colors")){
            options.colors = config.colors;
        }

        var update = function(input){
            var update_label = data[input.index].label;
            data[input.index][update_label] = input.value; 
            chart.updateSeries([{data:data}]);
        }

        var chart = new ApexCharts(this.cards[id].querySelector(".card-media"), options);
        chart.render();
        this.charts[id] = chart;
        this.callbacks[id] = update;

    }

    // create a new card for the service
    createCard(title, description, id) {
        var newcard = document.createElement("div");

        var minimize = document.createElement("div");
        minimize.className = "mdl-card__menu";

        var button = document.createElement("button");
        button.className = "mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect";
        button.innerHTML = "<i class='material-icons'>remove</i>";
        button.onclick = function(){
            this.cardAction(id);
        }.bind(this);
        minimize.append(button);
        newcard.append(minimize);
        this.addCardTitle(newcard, title);

        var media = document.createElement("div");
        media.className = "card-media";
        newcard.appendChild(media);
        this.addCardText(newcard, description);

        return newcard
    }


    cardAction(id){
        if(this.active_cards.includes(id)){
            this.hideCard(id);
        } else {
            this.showCard(id);
        }
    }

    //show the card
    showCard(id) {
        var card = this.cards[id];
        if (this.card_count == 4) {
            this.card_grid.removeChild(this.card_grid.childNodes[0]);
            this.active_cards.shift();
            this.active_cards.push(id);

            this.assignCellWidth(card);
            this.card_grid.appendChild(card);

        } else {
            this.active_cards.push(id);
            this.card_count += 1;
            this.active_cards.forEach(element => {
                this.assignCellWidth(this.cards[element]);
            });
            this.card_grid.appendChild(card);
        }
        componentHandler.upgradeElements(this.card_grid);

    }

    hideCard(id){
        var index = this.active_cards.indexOf(id);
        this.card_grid.removeChild(this.card_grid.childNodes[index]);
        this.active_cards.splice(index,1);
        console.log(index,this.active_cards);
        this.card_count -= 1;
        this.active_cards.forEach(element => {
            this.assignCellWidth(this.cards[element]);
        });
        componentHandler.upgradeElements(this.card_grid);
    }

    addCardTitle(div, title) {
        var mdl_title = document.createElement("div");
        mdl_title.class = "mdl-card__title";
        var inside_title = document.createElement("h2");
        inside_title.innerText = title;
        inside_title.className = "mdl-card__title-text";
        mdl_title.appendChild(inside_title);
        div.appendChild(mdl_title);
    }

    addCardImage(div, url) {
        var media = div.querySelector(".card-media")
        var img = document.createElement("img");
        img.src = url;
        media.appendChild(img);
        div.appendChild(media);
    }

    addCardText(div, text) {
        var textdiv = document.createElement("div");
        textdiv.className = "mdl-card__supporting-text";
        textdiv.innerText = text;
        div.appendChild(textdiv);
    }

    makeServiceGraph(div, conf) {
        var graph = div.querySelector(".card-media")
        var nodes = [];
        var edges = []
        conf.minionList.forEach(function(minion){
            var group = minion.type === "P" ? 0 : minion.type === "T" ? 1 : 2;
            var minion_node = {
                id : minion.id,
                label : minion.name,
                group : group
            };
            minion.feedList.forEach(function(id){
                var edge = {
                    from : minion.id,
                    to : id,
                    arrows : "to"
                }
                edges.push(edge);
            })
            nodes.push(minion_node);
        })
        nodes = new vis.DataSet(nodes);

        // create an array with edges
        edges = new vis.DataSet(edges);

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
            }
        };
        var network = new vis.Network(graph, data, options);
    }

    // based on current state we assign the number of columns
    assignCellWidth(div) {
        var width = Math.floor(12 / this.card_count);
        div.className = "mdl-card mdl-shadow--6dp mdl-cell mdl-cell--" + width + "-col";
    }
}

export default domAdapter;