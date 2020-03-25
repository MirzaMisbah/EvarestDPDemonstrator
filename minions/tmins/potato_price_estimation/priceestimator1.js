function priceEstimator1(){
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
this.transform__pipeline=function(X){
    X = this.transform__pipeline__selectslice(X)
    X = this.transform__pipeline__flattenshape(X)
    X = this.transform__pipeline__imputer(X)
    X = this.transform__pipeline__standardscaler(X)
    return X
}
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
this.standardScalerCode=function(X, mean_, scale_){
    var result = []
    for(var i=0; i<X.length; i++){
        var x = X[i]
        var new_x = []
        for(var j=0; j< x.length; j++){
            var xv = x[j]
            if(mean_ != null){
                xv = xv - mean_[j]
            }
            if(scale_ != null){
                xv = xv / scale_[j]
            }
            new_x.push(xv)
        }
        result.push(new_x)
    }
    return result
    }
this.transform__pipeline__selectslice=function(X){
    var start = 1
    var stop = -1
    var axis = -1
    X = this.selectSliceCode(X, start, stop, axis)
    return X
}
this.flattenShapeCode=function(X){
    var result = []
    
    // test number of axes
    var axes = 0
    var Xv = X
    
    while(Xv instanceof Array){
        axes += 1
        Xv = Xv[0]
    }
    
    var myfunc = function(arr, axis=0){
        if(axis==axes-1){
            return arr
        }
        
        var result = []
        for(var i=0; i<arr.length; i++){
            result.push(myfunc(arr[i], axis+1))
        }
        
        // flatten up to first dimension
        if(axis > 0){
            result = [].concat.apply([], result)
        }
        return result
    }

    return myfunc(X)
}
this.selectSliceCode=function(X, start, stop, axis){
    // fix starting behavior
    if(start == null){
        start = 0
    }
    
    // test number of axes
    var axes = 0
    var Xv = X
    
    while(Xv instanceof Array){
        axes += 1
        Xv = Xv[0]
    }
    
    var make_array = function(x, pos_axis=0){
        var neg_axis = pos_axis - axes 
        if((pos_axis == axis) || (neg_axis == axis)){
            var x_new = null
            
            if(stop == null && start == null){
                x_new = x
            }else{
                // Make slice
                if(stop == null){
                    x_new = x.slice(start) // takes all elements until the last one
                }else{
                    x_new = x.slice(start, stop)
                }
            }
            
            return x_new
        }
        var result = []
        var clevel = pos_axis+1
        for(var i=0; i<x.length; i++){
            result.push(make_array(x[i], clevel))
        }
        return result
    }
    
    return make_array(X)
}
this.postprocess=function(X){
    X = this.outputSquisherCode(X)
    return X
}
this.transform=function(X){
    X = this.transform__pipeline(X)
    return X
}
this.transform__pipeline__standardscaler=function(X){
    var mean_ = [12.180550458715587, 12.326972477064219, 12.024770642201826, 12.169908256880738, 63.8531598513011, 797.7294990723565, 2834.1231617647063, 12.198715596330267, 12.345137614678897, 12.04256880733944, 12.187706422018353, 63.93308550185874, 799.7289424860855, 2847.1029411764703, 12.216513761467882, 12.36293577981651, 12.059449541284394, 12.205137614678902, 64.1189591078067, 804.1602968460112, 2859.7205882352937, 12.231926605504578, 12.37853211009174, 12.074311926605496, 12.220000000000006, 64.27509293680296, 807.8144712430427, 2872.3216911764703, 12.247339449541276, 12.396146788990825, 12.089174311926598, 12.237614678899087, 64.410780669145, 811.022077922078, 2884.8805147058824, 12.26422018348623, 12.41394495412844, 12.106055045871553, 12.253944954128446, 64.51301115241634, 813.7042671614103, 2897.5643382352937, 12.280550458715586, 12.429908256880735, 12.12128440366972, 12.269724770642206, 64.6561338289963, 817.2000000000003, 2910.2426470588234, 12.294678899082557, 12.444403669724771, 12.135412844036692, 12.283669724770649, 64.7267657992565, 819.0361781076069, 2923.0606617647063, 12.309357798165127, 12.458715596330276, 12.149908256880728, 12.29761467889909, 64.7291280148423, 820.4153703703706, 2935.8106617647063, 12.3234862385321, 12.473577981651378, 12.164036697247703, 12.311926605504592, 64.75510204081634, 821.0461111111115, 2948.551470588235, 12.337981651376136, 12.488990825688074, 12.178348623853209, 12.326972477064226, 64.95547309833023, 825.9011111111113, 2961.3143382352937, 12.35302752293577, 12.505137614678898, 12.193944954128439, 12.343119266055053, 65.14100185528758, 830.4970370370373, 2974.233455882353, 12.368807339449534, 12.521284403669725, 12.209357798165135, 12.35853211009175, 65.21706864564008, 832.3916666666669, 2987.0643382352937, 12.38422018348623, 12.53651376146789, 12.224403669724769, 12.37339449541285, 65.22634508348793, 832.6653703703706, 2999.854779411765, 12.398899082568798, 12.552293577981652, 12.239082568807337, 12.38899082568808, 65.39888682745824, 836.9533333333335, 3012.645220588235, 12.414495412844028, 12.56770642201835, 12.254495412844031, 12.404403669724777, 65.53988868274583, 840.6220370370372, 3025.4338235294117, 12.431376146788981, 12.58495412844037, 12.272110091743114, 12.422568807339454, 65.62152133580706, 842.7990740740744, 3038.3621323529414, 12.448073394495404, 12.60165137614679, 12.287889908256878, 12.43871559633028, 65.71428571428572, 845.1598148148149, 3051.172794117647, 12.465137614678891, 12.61908256880734, 12.304403669724767, 12.455229357798169, 65.81447124304269, 847.768703703704, 3063.96875, 12.482018348623843, 12.63651376146789, 12.320917431192658, 12.47266055045872, 65.86456400742115, 849.1194444444448, 3076.7555147058824]
    var scale_ = [5.76418455205992, 5.808979683433673, 5.726522167952861, 5.770791130062896, 70.41975587622068, 1115.0151625586598, 2132.1582969394262, 5.785135825150936, 5.829313713942461, 5.7470490878139024, 5.790715066210055, 70.37896880236691, 1114.7012533735094, 2136.9223046736047, 5.804922203707389, 5.849113679074647, 5.765667738227503, 5.810409136959325, 70.35543296662514, 1116.516592587671, 2140.8591731210486, 5.8234143767885485, 5.867428179503307, 5.7836403835463335, 5.827872288652525, 70.31117319231379, 1117.192273569399, 2144.6774632739794, 5.841807349182057, 5.889639777813067, 5.8015192772017805, 5.850711381365635, 70.2619243524564, 1117.4336970559357, 2148.3356857756153, 5.862991110248989, 5.912095208844141, 5.821568567330102, 5.870228731043463, 70.22606234785118, 1117.6418362302318, 2152.149776406924, 5.882949056829585, 5.931579688941393, 5.8399467606152875, 5.889921489596156, 70.18966944504255, 1118.4070150125835, 2155.8780939351223, 5.90036456171264, 5.950154640067806, 5.857874263297708, 5.907706778197166, 70.1551993086847, 1118.167219859328, 2159.808319306002, 5.918740610405635, 5.968283311787133, 5.876421943152875, 5.925405866032781, 70.155220469075, 1118.6213817675628, 2163.5442394699066, 5.936458552008838, 5.98689080491484, 5.894649279396838, 5.943481893817471, 70.13444066814633, 1118.2668243918688, 2167.1815724571507, 5.955033917098353, 6.006729245543999, 5.91338468001822, 5.96314575940135, 70.11224200914762, 1120.5674913041094, 2170.7736004264834, 5.9745941483731375, 6.02793582432354, 5.933826220209765, 5.984134482073163, 70.08332241321911, 1122.5018195651537, 2174.5853779012295, 5.9955258126557505, 6.049024957583095, 5.954565325145907, 6.0043169218913, 70.03749458431923, 1122.0202479918398, 2178.165348163812, 6.0163728128398795, 6.069185725373439, 5.975206484657964, 6.024293969852332, 70.02967111527384, 1121.8487174355507, 2181.6005535569407, 6.036123572194867, 6.090612363275426, 5.995484163183204, 6.045921203733199, 69.98625342522098, 1123.1334987795233, 2184.955623393157, 6.05764290705787, 6.111933226649568, 6.0171759486297205, 6.067813933270683, 69.94944297990335, 1124.108441280181, 2188.227544487638, 6.080664719199774, 6.135096303178294, 6.040948353975782, 6.092123415784968, 69.90605478826309, 1123.8017371825706, 2191.7136095222395, 6.103988841276646, 6.157797848027896, 6.0629026980065, 6.114265632262538, 69.85528947681702, 1123.4399741668128, 2194.9127552648883, 6.126851356926291, 6.180796175263738, 6.085206822745043, 6.1359771653000035, 69.80738173848252, 1123.2971597175558, 2197.9943177914674, 6.14920055664977, 6.203660265534983, 6.107384842715869, 6.159471358557005, 69.77377748244541, 1122.8160171540464, 2201.0096801005325]
    X = this.standardScalerCode(X, mean_, scale_)
    return X
}
this.transform__pipeline__flattenshape=function(X){
    X = this.flattenShapeCode(X)
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
this.imputerCode=function(X, statistics_){
    var result = []
    for(var i=0; i<X.length; i++){
        var x = X[i]
        var new_x = []
        for(var j=0; j< x.length; j++){
            var xv = x[j]
            if(isNaN(x[j])){
                new_x.push(statistics_[j])
            }else{
                new_x.push(x[j])
                
            }
        }
        result.push(new_x)
    }
    return result
    }
this.transform__pipeline__imputer=function(X){
    var statistics_ = [12.180550458715587, 12.326972477064219, 12.024770642201826, 12.169908256880738, 63.853159851301115, 797.7294990723566, 2834.123161764706, 12.198715596330267, 12.345137614678897, 12.04256880733944, 12.187706422018353, 63.933085501858734, 799.7289424860857, 2847.1029411764707, 12.216513761467882, 12.36293577981651, 12.059449541284394, 12.205137614678902, 64.11895910780669, 804.1602968460114, 2859.720588235294, 12.231926605504578, 12.37853211009174, 12.074311926605496, 12.220000000000006, 64.27509293680298, 807.8144712430429, 2872.3216911764707, 12.247339449541276, 12.396146788990825, 12.089174311926598, 12.237614678899087, 64.41078066914498, 811.0220779220782, 2884.8805147058824, 12.26422018348623, 12.41394495412844, 12.106055045871553, 12.253944954128446, 64.51301115241635, 813.7042671614103, 2897.564338235294, 12.280550458715586, 12.429908256880735, 12.12128440366972, 12.269724770642206, 64.65613382899629, 817.2000000000003, 2910.2426470588234, 12.294678899082557, 12.444403669724771, 12.135412844036692, 12.283669724770649, 64.72676579925651, 819.0361781076069, 2923.060661764706, 12.309357798165127, 12.458715596330276, 12.149908256880728, 12.29761467889909, 64.7291280148423, 820.4153703703705, 2935.810661764706, 12.3234862385321, 12.473577981651378, 12.164036697247703, 12.311926605504592, 64.75510204081633, 821.0461111111114, 2948.551470588235, 12.337981651376136, 12.488990825688074, 12.178348623853209, 12.326972477064226, 64.95547309833024, 825.9011111111114, 2961.314338235294, 12.35302752293577, 12.505137614678898, 12.193944954128439, 12.343119266055053, 65.14100185528757, 830.4970370370373, 2974.233455882353, 12.368807339449534, 12.521284403669725, 12.209357798165135, 12.35853211009175, 65.21706864564007, 832.3916666666669, 2987.064338235294, 12.38422018348623, 12.53651376146789, 12.224403669724769, 12.37339449541285, 65.22634508348794, 832.6653703703705, 2999.854779411765, 12.398899082568798, 12.552293577981652, 12.239082568807337, 12.38899082568808, 65.39888682745826, 836.9533333333335, 3012.645220588235, 12.414495412844028, 12.56770642201835, 12.254495412844031, 12.404403669724777, 65.53988868274583, 840.6220370370373, 3025.4338235294117, 12.431376146788981, 12.58495412844037, 12.272110091743114, 12.422568807339454, 65.62152133580705, 842.7990740740744, 3038.362132352941, 12.448073394495404, 12.60165137614679, 12.287889908256878, 12.43871559633028, 65.71428571428571, 845.159814814815, 3051.172794117647, 12.465137614678891, 12.61908256880734, 12.304403669724767, 12.455229357798169, 65.81447124304268, 847.7687037037039, 3063.96875, 12.482018348623843, 12.63651376146789, 12.320917431192658, 12.47266055045872, 65.86456400742115, 849.1194444444446, 3076.7555147058824]
    X = this.imputerCode(X, statistics_)
    return X
}
}
if (typeof self === 'object') {
 self.priceEstimator1=priceEstimator1
}