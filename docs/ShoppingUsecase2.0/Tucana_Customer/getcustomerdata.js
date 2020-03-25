class TestDataGenerator extends tucana.minion.Pmin {
    constructor(dataAccessService, minionController, id, uiAdapter = null, dependencies = []) {
        super(dataAccessService, minionController, id, uiAdapter, dependencies);
        this.dataId = 'Stores';
        this.created = false;
        this.data = [];

    }

    savelist(newData) {
        if (this.created) {
            this.updateData(this.dataId, newData)
        } else {
            this.saveData(this.dataId, newData);
            this.created = true;
        }
    }


    
    async activate() {
        await this.initialize();
        this.running = true;
        this.active = true;
        var div = document.getElementById("root");
        div.style.display = "inline-block"
        $(".service-sidebar").empty(); 
        document.getElementById("card_peercommunicator").style.display = 'none';
        document.getElementById("card_descriptionMinion").style.display = 'none'; 
        document.getElementById("card_peercommdelivery").style.display = 'none';
        //document.getElementById("card_dealminion1").style.display = 'none';
        
        div.style.position= "relative";
        div.style.width ="100%";
        div.style.height = "66.67vh";



    }

    notify(newData) {
         console.log(newData);
         var message;
         
         if(newData == null){  
            message= "No store available! Refresh and try again";          
        }
        else{
            message= newData.length + " stores found for your shopping!"
            this.savelist(newData);
        }
          
            var snackbarContainer = document.querySelector('#tucana-snackbar');
            var data = {
                message:message,
                timeout: 3000
            };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
            
         
         //this.minionController.notify(this, newData.getObject().pop());
    }

    terminate() {
        this.running = false;
    }
}