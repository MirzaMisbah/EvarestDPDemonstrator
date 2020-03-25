function nPotatoV2(){
this.predict=function(X, onpredict){
    var X = this.transform(X)
    var X_new = []
    var this_model = this.model
    var this_this = this
    
    var recurr = function(outputData){
        if(outputData != null){
            X_new.push(outputData['Output_1'])
        }
        
        if(X_new.length >= X.length){
            X_new = this_this.postprocess(X_new)
            onpredict(X_new, null)
        }else{
            var x = X[X_new.length]
            x = {"Input_1": new Float32Array(x)}
            this_model.predict(x).then(recurr).catch(err => {
                onpredict(null, err)
            })
        }
    }
    
    recurr(null)
}
this.load=function(config, onloaded){
    this.model = new KerasJS.Model({
        filepath: config['model'],
        gpu: false
    })
    this.config = config
    this.model.ready().then(()=>{
        onloaded()
    })
}
this.postprocess=function(X){
    X = this.outputSquisherCode(X)
    return X
}
this.outputSquisherCode=function(X){
            result = []

            for(var i=0; i<X.length; i++){
                var y = X[i];
                result.push(y[0])
            }
            return result
        }
this.transform=function(X){
    return X
}
}
if (typeof self === 'object') {
 self.nPotatoV2=nPotatoV2
}