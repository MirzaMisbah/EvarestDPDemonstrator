class Pmin extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'Pmin';
        this.created = false;
        this.data = [];
        console.log('I am in Pmin')

    }

    async activate() {
        this.initialize();
        this.running = true;
        const _this = this;
        if(localStorage.getItem("role")){
            if(localStorage.getItem("producer")  == "true"){_this.userType = 'producer'}
            else if(localStorage.getItem("provider") == "true"){_this.userType = 'provider'}
            else {_this.userType = 'guest'}
        }
        else{_this.userType = 'guest'}
        
        _this.result = {
            userId: localStorage.getItem("id"),
            userType: _this.userType
        };

        

        

        
        /*this.printFile("C:/Users/7seas/Desktop/EVAREST-HMI.json")
        fetch("C:/Users/7seas/Desktop/EVAREST-HMI.json")
        .then(response => response.json())
        .then(jsonResponse => console.log(jsonResponse))
        var tData = JSON.parse("C:/Users/7seas/Desktop/EVAREST-HMI.json");
        console.log(tData);
        */


        /**
        * Pushing data    
        */
        _this.data.push(_this.result);

        /**
         * Updating data, into data stream    
         */
        if (_this.created) {
            await _this.updateData(_this.dataId, _this.data)
        }

        /**
         * Savinging data, if it is first data stream    
         */
        else {
            await _this.saveData(_this.dataId, _this.data);
            _this.created = true;
            /*const reader = this.JSONReader((result) => {
                _this.result = result;
                console.log(result)
                console.log(_this.result)
            });
            console.log(reader);
    
            this.read((result) => {
                console.log(result); 
            });
            this.activate();
            location.reload();*/
        }
        _this.minionController.notify(_this, JSON.parse(JSON.stringify(_this.result)));
        console.log(_this.result)
        /**
         * Notifying the next minion     
         */
        //console.log(_this.dataAccessService.getLocalID());
        //console.log((_this, JSON.parse(JSON.stringify(_this.readData(_this.dataAccessService.getLocalID())))));
        await _this.readData("Received").then(function (res) {
            if (res.response.res != null) {
                _this.data = res.response.res.object;
                console.log(res.response.res.object);
                console.log("line 79")
            }
        });
    }

    JSONReader(completed = null) {
        this.onCompleted = completed;
        this.result = undefined;
	    this.input = document.createElement('input');
        this.input.type = 'file';
        this.input.accept = 'text/json|application/json';
        this.input.addEventListener('change', this.onChange.bind(this), false);
        this.input.style.display = 'none';
        document.body.appendChild(this.input);
        this.input.click();
    }
 
    destroy() {
        this.input.removeEventListener('change', this.onChange.bind(this), false);
        document.body.removeChild(this.input);    
    }
 
    onChange(event) {
	if (event.target.files.length > 0) {
            this.readJSON(event.target.files[0]);
        }
    }
 
    readJSON(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target.readyState === 2) {
                this.result = JSON.parse(reader.result);
                if (typeof this.onCompleted === 'function') {
                    this.onCompleted(this.result);
                }
		this.destroy();
            }
        };
        reader.readAsText(file);
    }
 
    read(callback = null) {
        return new JSONReader(callback);
    }
    
    
    printFile(file) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    var allText = rawFile.responseText;
                    alert(allText);
                }
            }
        }
        rawFile.send(null);
    }

    notify(newData) {}

    terminate() {
        this.running = false;
    }
}

