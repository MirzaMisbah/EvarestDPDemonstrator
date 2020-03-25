class MapMinion extends tucana.minion.Pmin {

    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = "map";
        this.created = false;
        this.data = [];

        mapboxgl.accessToken = 'pk.eyJ1IjoibGVvbjIiLCJhIjoiY2s2a3QxbzlrMDQzYjNubGlwMm9hdjhqZyJ9.ZKRMndgZlAMS-nIOLq0C5w';
    }


    async activate() {
        await this.initialize();
        this.running = true;

        window.addEventListener('mapLoaded', this.showMap.bind(this), false);

    }


    async notify(newData) {

    }

    async showMap() {
        const _this = this;

        await _this.readData('Electronics Store').then(function (res) {
            if (res.response.res != null) {
                _this.elecData = res.response.res.object;
            }
        });


        var lagePlanDiv = document.getElementById("lagePlan");
        var divHeight = $(window).height() * 0.7;
        lagePlanDiv.style.height = divHeight + "px";


        var map = new mapboxgl.Map({

            container: 'lagePlan',// container id specified in the HTML
            center: {lng: 6.989287, lat: 49.239768},// initial position in lngLat format
            zoom: 17.4,// initial zoom
            bearing: 12,
            style: 'mapbox://styles/mapbox/streets-v9'

        });


        map.on('load', function () {

            map.addSource('OG', {

                "type": 'image',
                "url": './images/EuropaGalerie_OG.png',

                "coordinates": [
                    [6.986193, 49.240547],//Top left corner
                    [6.992337, 49.240807],//Top right corner
                    [6.992237, 49.238833],//Bottom right corner
                    [6.986293, 49.238433] //Bottom left corner
                ]

            });
            map.addLayer({
                "id": "OG_overlay",
                "source": "OG",
                "type": "raster",

                "paint": {"raster-opacity": 1}
            });

            /*
            map.addSource('EG1', {
                "type": 'image',
                "url": './images/EuropaGalerie_EG1.png',

                "coordinates": [
                    [6.986193, 49.240547],//Top left corner
                    [6.992337, 49.240807],//Top right corner
                    [6.992237, 49.238833],//Bottom right corner
                    [6.986293, 49.238433] //Bottom left corner
                ]
            });*/


            /*
            map.addLayer({
                "id": "EG1_overlay",
                "source": "EG1",
                "type": "raster",
                "layout": {'visibility': 'none'}
            });
            */



            class MyCustomControl {


                onAdd(map) {
                    this.map = map;
                    var controlDiv = document.createElement("form");
                    //controlDiv.appendChild(this.container);
                    controlDiv.className = 'my-custom-control';

                    this.ogButton = document.createElement('button');
                    this.ogButton.textContent = 'OG';
                    this.ogButton.addEventListener("click", () => console.log("hallo"));

                    this.e1Button = document.createElement('button');
                    this.e1Button.textContent = 'EG 1';

                    this.e2Button = document.createElement('button');
                    this.e2Button.textContent = 'EG 2';

                    controlDiv.appendChild(this.ogButton);
                    controlDiv.appendChild(this.e1Button);
                    controlDiv.appendChild(this.e2Button);
                    return controlDiv;
                }

                onRemove() {
                    this.container.parentNode.removeChild(this.container);
                    this.map = undefined;
                }
            }

            const myCustomControl = new MyCustomControl();
            //map.addControl(myCustomControl, 'top-left');

        });

        this.setMarker("Electronics Store", "./images/elect.jpg", {lng: 6.988487, lat: 49.239968}, map);
        this.setMarker("Foodies", "./images/food.jpg", {lng: 6.989987, lat: 49.239638}, map);

    }

    async setMarker(name, imgPath, coordinates, map) {

        const _this = this;

        var database;

        await this.readData(name).then(function (res) {
            if (res.response.res != null) {
                database = res.response.res.object;
            }

        });

        var html = "";
        for (var key in database) {
            if (key === "Name") {
                continue;
            }
            html += '<p>' + key + ' ' + database[key] + '€' + '</p>';
            html += '<img src=' + imgPath + ' height="42" width="62">'

        }
        if (html === "") {
            return;
        }
        function popup(){

        }

        html+= "<p><button onClick=\"centeredPopup(\'del_status.html\', 'myWindow', '500', '500', 'yes')\" class='qr-button'>QR</button></p>";


        var elecMarker = new mapboxgl.Marker();
        elecMarker.setLngLat(coordinates).addTo(map);
        var popup = new mapboxgl.Popup({maxHeight: 100, keepInView: true})
            .setHTML('<strong>' + name + '</strong>' + html);

        popup.setMaxWidth(100);
        elecMarker.setPopup(popup);
        elecMarker.getElement().addEventListener('mouseenter', function () {
            this.style.cursor = "pointer";
        });
        elecMarker.togglePopup();

    }

    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    }


    terminate() {
        this.running = false;
    }
}