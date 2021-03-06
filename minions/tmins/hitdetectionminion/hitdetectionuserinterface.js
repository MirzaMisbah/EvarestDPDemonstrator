(function (_divId, _dataChannels) {

    var thirdPartyScripts = [];
    var objectCounter = 0;

    var divElement = document.createElement('h6');
    var divText = document.createTextNode('No data transfered yet, please choose running Gyroscope and LinearAcceleration as input channels.');
    divElement.appendChild(divText);
    divElement.setAttribute('style', 'text-align : center; padding-top: 40px');
    var rightInputs = true;
    var updateUI = null;

    var channels = [];
    _dataChannels.forEach(function (channel) {
        if (channel){
            var newChannel = channel;
            if (!newChannel.channel) {
                newChannel = {channel : newChannel};
            }
            channels.push(newChannel);
        }

    });
    _dataChannels = channels;

    var showModelParams = function () {
        var div = document.createElement('div');

        div.innerHTML=`
        <style>
            .tucana_hit_table {
                border: 1px solid black;
                text-align: center;
                border-collapse: collapse;
                padding: 10px;
                margin-top: 20px;
            }
            
            .layout {
                table-layout: fixed;
            }
            
            .cell-width {
                width : 20%;
                font-size: 16px;
                font-size: 2vw;
            }
          
        </style>
        <table class="tucana_hit_table layout"  style="width: 100%">
            <tbody>
                <tr>
                    <th class="tucana_hit_table cell-width">Model Architecture</th>
                    <th class="tucana_hit_table cell-width">Layer count</th>
                    <th class="tucana_hit_table cell-width">Neuron count</th>
                    <th class="tucana_hit_table cell-width">Activation function</th>
                    <th class="tucana_hit_table cell-width">Backend used</th>
                </tr>
                <tr>
                    <td class="tucana_hit_table cell-width">MLP (Multilayer Perceptron)</td>
                    <td class="tucana_hit_table cell-width" >1</td>
                    <td class="tucana_hit_table cell-width">32</td>
                    <td class="tucana_hit_table cell-width">ReLU</td>
                    <td class="tucana_hit_table cell-width">Keras.js</td>
                </tr>
            </tbody>
        </table>

        <!--Visualization of the multi - layer perceptron -->
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="30vh" viewBox="0 0 719 469" version="1.1">
            <defs>
            <clipPath id="clip1">
              <path d="M 500 375 L 594.761719 375 L 594.761719 469 L 500 469 Z M 500 375 "/>
            </clipPath>
            </defs>
            <g id="surface1" style="width: 100%;">
            <path style="fill-rule:nonzero;fill:rgb(74.901961%,74.901961%,74.901961%);fill-opacity:1;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M -23.364011 -0.001625 C -23.364011 2.752666 -25.594818 4.98233 -28.348747 4.98233 C -31.098243 4.98233 -33.329049 2.752666 -33.329049 -0.001625 C -33.329049 -2.751485 -31.098243 -4.982035 -28.348747 -4.982035 C -25.594818 -4.982035 -23.364011 -2.751485 -23.364011 -0.001625 Z M -23.364011 -0.001625 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(74.901961%,74.901961%,74.901961%);fill-opacity:1;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M -9.191828 42.521509 C -9.191828 45.272256 -11.422634 47.50192 -14.17213 47.50192 C -16.926059 47.50192 -19.153319 45.272256 -19.153319 42.521509 C -19.153319 39.768104 -16.926059 37.537554 -14.17213 37.537554 C -11.422634 37.537554 -9.191828 39.768104 -9.191828 42.521509 Z M -9.191828 42.521509 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(100%,50.196078%,50.196078%);fill-opacity:1;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 4.979469 -0.001625 C 4.979469 2.752666 2.749549 4.98233 -0.000833102 4.98233 C -2.750329 4.98233 -4.981136 2.752666 -4.981136 -0.001625 C -4.981136 -2.751485 -2.750329 -4.982035 -0.000833102 -4.982035 C 2.749549 -4.982035 4.979469 -2.751485 4.979469 -0.001625 Z M 4.979469 -0.001625 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(100%,50.196078%,50.196078%);fill-opacity:1;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 33.327383 -0.001625 C 33.327383 2.752666 31.096576 4.98233 28.347081 4.98233 C 25.596698 4.98233 23.366778 2.752666 23.366778 -0.001625 C 23.366778 -2.751485 25.596698 -4.982035 28.347081 -4.982035 C 31.096576 -4.982035 33.327383 -2.751485 33.327383 -0.001625 Z M 33.327383 -0.001625 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(100%,50.196078%,50.196078%);fill-opacity:1;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 61.675297 -0.001625 C 61.675297 2.752666 59.44449 4.98233 56.694994 4.98233 C 53.941065 4.98233 51.713805 2.752666 51.713805 -0.001625 C 51.713805 -2.751485 53.941065 -4.982035 56.694994 -4.982035 C 59.44449 -4.982035 61.675297 -2.751485 61.675297 -0.001625 Z M 61.675297 -0.001625 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style=" stroke:none;fill-rule:nonzero;fill:rgb(100%,50.196078%,50.196078%);fill-opacity:1;" d="M 569.289062 422.675781 C 569.289062 410.535156 559.464844 400.707031 547.347656 400.707031 C 535.214844 400.707031 525.390625 410.535156 525.390625 422.675781 C 525.390625 434.796875 535.214844 444.628906 547.347656 444.628906 C 559.464844 444.628906 569.289062 434.796875 569.289062 422.675781 Z M 569.289062 422.675781 "/>
            <g clip-path="url(#clip1)" clip-rule="nonzero">
            <path style="fill:none;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 90.022324 -0.001625 C 90.022324 2.752666 87.792404 4.98233 85.042022 4.98233 C 82.288092 4.98233 80.058172 2.752666 80.058172 -0.001625 C 80.058172 -2.751485 82.288092 -4.982035 85.042022 -4.982035 C 87.792404 -4.982035 90.022324 -2.751485 90.022324 -0.001625 Z M 90.022324 -0.001625 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            </g>
            <path style="fill-rule:nonzero;fill:rgb(100%,50.196078%,50.196078%);fill-opacity:1;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 118.370238 -0.001625 C 118.370238 2.752666 116.140318 4.98233 113.386389 4.98233 C 110.636006 4.98233 108.4052 2.752666 108.4052 -0.001625 C 108.4052 -2.751485 110.636006 -4.982035 113.386389 -4.982035 C 116.140318 -4.982035 118.370238 -2.751485 118.370238 -0.001625 Z M 118.370238 -0.001625 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(50.196078%,100%,50.196078%);fill-opacity:1;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 19.1552 42.521509 C 19.1552 45.272256 16.92528 47.50192 14.174897 47.50192 C 11.420968 47.50192 9.191048 45.272256 9.191048 42.521509 C 9.191048 39.768104 11.420968 37.537554 14.174897 37.537554 C 16.92528 37.537554 19.1552 39.768104 19.1552 42.521509 Z M 19.1552 42.521509 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(50.196078%,100%,50.196078%);fill-opacity:1;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 47.503113 42.521509 C 47.503113 45.272256 45.272307 47.50192 42.519264 47.50192 C 39.768882 47.50192 37.538075 45.272256 37.538075 42.521509 C 37.538075 39.768104 39.768882 37.537554 42.519264 37.537554 C 45.272307 37.537554 47.503113 39.768104 47.503113 42.521509 Z M 47.503113 42.521509 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(50.196078%,100%,50.196078%);fill-opacity:1;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 75.846594 42.521509 C 75.846594 45.272256 73.616674 47.50192 70.866291 47.50192 C 68.116796 47.50192 65.885989 45.272256 65.885989 42.521509 C 65.885989 39.768104 68.116796 37.537554 70.866291 37.537554 C 73.616674 37.537554 75.846594 39.768104 75.846594 42.521509 Z M 75.846594 42.521509 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(50.196078%,50.196078%,100%);fill-opacity:1;stroke-width:0.3985;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 47.503113 85.041099 C 47.503113 87.790959 45.272307 90.021509 42.519264 90.021509 C 39.768882 90.021509 37.538075 87.790959 37.538075 85.041099 C 37.538075 82.287694 39.768882 80.060688 42.519264 80.060688 C 45.272307 80.060688 47.503113 82.287694 47.503113 85.041099 Z M 47.503113 85.041099 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 35.995307 80.146649 L -10.027937 45.627619 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.602515 0.001357 C 1.407004 0.0509839 0.540598 0.341429 -0.00168537 0.661071 L -0.00227685 -0.660308 C 0.541102 -0.344665 1.407732 -0.0509865 1.602515 0.001357 Z M 1.602515 0.001357 " transform="matrix(3.541472,-2.657608,-2.656247,-3.543286,331.273655,69.384759)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 37.991152 78.248422 L 17.053844 46.841705 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.601454 0.000327667 C 1.407587 0.0538139 0.541178 0.342055 0.000714814 0.660609 L 0.00149513 -0.659388 C 0.538878 -0.342578 1.405894 -0.0503637 1.601454 0.000327667 Z M 1.601454 0.000327667 " transform="matrix(2.451208,-3.678829,-3.676945,-2.452464,340.060082,77.763374)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 42.519264 76.900521 L 42.519264 47.701313 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.605474 0.000935744 C 1.40608 0.0523613 0.542927 0.344955 -0.000309478 0.661489 L -0.000309478 -0.662277 C 0.542927 -0.342197 1.40608 -0.0531498 1.605474 0.000935744 Z M 1.605474 0.000935744 " transform="matrix(0,-4.407895,-4.405637,0,360.011935,83.697855)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 47.050036 78.248422 L 67.983798 46.841705 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.602985 0.00196858 C 1.407425 0.0526599 0.540409 0.344874 0.0030259 0.661685 L 0.00028433 -0.661254 C 0.540748 -0.3427 1.409118 -0.0515177 1.602985 0.00196858 Z M 1.602985 0.00196858 " transform="matrix(-2.451208,-3.678829,-3.676945,2.452464,379.963833,77.763374)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 11.597411 34.791239 L 1.640353 4.920297 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.60462 0.000308082 C 1.405828 0.0535561 0.539814 0.344705 -0.00171054 0.661852 L -0.000667092 -0.662703 C 0.542719 -0.341521 1.407523 -0.049518 1.60462 0.000308082 Z M 1.60462 0.000308082 " transform="matrix(1.39456,-4.185825,-4.183681,-1.395275,223.775269,269.314743)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 16.749723 34.791239 L 26.706782 4.920297 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.604785 0.000187053 C 1.407688 0.0500131 0.542884 0.342016 -0.000502047 0.663198 L -0.0015455 -0.661357 C 0.539979 -0.344209 1.405993 -0.053061 1.604785 0.000187053 Z M 1.604785 0.000187053 " transform="matrix(-1.39456,-4.185825,-4.183681,1.395275,246.477033,269.314743)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 19.929243 36.763907 L 53.030478 3.662787 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.601493 0.000632309 C 1.405317 0.0526082 0.54103 0.342604 -0.000445363 0.663393 L -0.000167493 -0.662299 C 0.540849 -0.341867 1.405916 -0.052068 1.601493 0.000632309 Z M 1.601493 0.000632309 " transform="matrix(-3.115226,-3.116778,-3.115182,3.116822,260.483171,260.614528)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 21.171437 38.322722 L 80.577748 2.678226 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.605199 -0.000221467 C 1.404673 0.0530893 0.541621 0.345513 0.000288609 0.66354 L 0.00209497 -0.661309 C 0.539933 -0.342752 1.40784 -0.0504233 1.605199 -0.000221467 Z M 1.605199 -0.000221467 " transform="matrix(-3.777834,-2.267774,-2.266612,3.77977,265.962109,253.754345)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 21.6786 39.302853 L 108.612675 2.045483 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.603475 0.00200867 C 1.404101 0.0520888 0.542677 0.343236 -0.00040411 0.661243 L -0.00203516 -0.661086 C 0.540115 -0.344148 1.406636 -0.0525555 1.603475 0.00200867 Z M 1.603475 0.00200867 " transform="matrix(-4.061909,-1.741736,-1.740844,4.063991,268.188542,249.421385)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 8.417004 36.763907 L -24.68423 3.662787 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.60111 -0.000426956 C 1.405533 0.0522761 0.540471 0.342088 -0.00054169 0.662527 L 0.00229493 -0.660032 C 0.540641 -0.342383 1.404933 -0.0524001 1.60111 -0.000426956 Z M 1.60111 -0.000426956 " transform="matrix(3.115182,-3.116822,-3.115226,-3.116778,209.768735,260.614043)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 36.764918 36.763907 L 3.663684 3.662787 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.601897 -0.00121453 C 1.405694 0.0521155 0.541258 0.3413 -0.00038109 0.662367 L 0.0030825 -0.660819 C 0.541429 -0.343171 1.40572 -0.0531877 1.601897 -0.00121453 Z M 1.601897 -0.00121453 " transform="matrix(3.115182,-3.116822,-3.115226,-3.116778,334.654453,260.614043)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 39.944438 34.791239 L 29.98738 4.920297 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.604965 -0.000728535 C 1.406173 0.0525195 0.540159 0.343668 -0.001365 0.660815 L -0.00172208 -0.659538 C 0.543065 -0.342557 1.407589 -0.0497143 1.604965 -0.000728535 Z M 1.604965 -0.000728535 " transform="matrix(1.39456,-4.185825,-4.183681,-1.395275,348.661075,269.314743)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 45.09675 34.791239 L 55.053809 4.920297 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.604439 -0.000849564 C 1.408463 0.0523378 0.542539 0.340979 -0.000847586 0.662161 L -0.00189104 -0.662393 C 0.539913 -0.344406 1.407048 -0.049896 1.604439 -0.000849564 Z M 1.604439 -0.000849564 " transform="matrix(-1.39456,-4.185825,-4.183681,1.395275,371.362839,269.314743)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 48.276271 36.763907 L 81.378392 3.662787 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.600706 -0.000155252 C 1.405156 0.0524476 0.540242 0.341816 -0.00123294 0.662605 L 0.00155281 -0.660579 C 0.540062 -0.342655 1.407637 -0.0503477 1.600706 -0.000155252 Z M 1.600706 -0.000155252 " transform="matrix(-3.115226,-3.116778,-3.115182,3.116822,385.368889,260.614528)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 49.518465 38.322722 L 108.924775 2.678226 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.604261 -0.000784191 C 1.403735 0.0525266 0.540683 0.34495 -0.000649302 0.662977 L 0.00115706 -0.661871 C 0.538995 -0.343315 1.406902 -0.050986 1.604261 -0.000784191 Z M 1.604261 -0.000784191 " transform="matrix(-3.777834,-2.267774,-2.266612,3.77977,390.847915,253.754345)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 35.522724 38.322722 L -23.883587 2.678226 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.605688 -0.000072475 C 1.40833 0.0501294 0.540423 0.342458 -0.00121663 0.663296 L 0.0000182272 -0.663378 C 0.542111 -0.345807 1.405163 -0.0533833 1.605688 -0.000072475 Z M 1.605688 -0.000072475 " transform="matrix(3.777834,-2.267774,-2.266612,-3.77977,329.175999,253.754345)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 63.866204 38.322722 L 4.459894 2.678226 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.602833 0.00164048 C 1.405475 0.0518423 0.540609 0.342347 -0.000270141 0.662728 L -0.0020765 -0.662121 C 0.539256 -0.344094 1.406109 -0.0539511 1.602833 0.00164048 Z M 1.602833 0.00164048 " transform="matrix(3.777834,-2.267774,-2.266612,-3.77977,454.061761,253.754345)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 65.112832 36.763907 L 32.010711 3.662787 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.602044 -0.00136099 C 1.406467 0.0513421 0.538897 0.343661 0.000392329 0.661593 L 0.00072111 -0.658458 C 0.542202 -0.343944 1.406494 -0.0539611 1.602044 -0.00136099 Z M 1.602044 -0.00136099 " transform="matrix(3.115182,-3.116822,-3.115226,-3.116778,459.540259,260.614043)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 68.292352 34.791239 L 58.335293 4.920297 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.603916 0.00241749 C 1.406525 0.0514639 0.540511 0.342612 -0.00101315 0.65976 L -0.00137023 -0.660593 C 0.543136 -0.342773 1.407941 -0.0507698 1.603916 0.00241749 Z M 1.603916 0.00241749 " transform="matrix(1.39456,-4.185825,-4.183681,-1.395275,473.546793,269.314743)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 73.444664 34.791239 L 83.401723 4.920297 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.604367 -0.00106482 C 1.408392 0.0521225 0.543587 0.344125 -0.00119944 0.661106 L -0.000842363 -0.659247 C 0.540682 -0.3421 1.406696 -0.0509515 1.604367 -0.00106482 Z M 1.604367 -0.00106482 " transform="matrix(-1.39456,-4.185825,-4.183681,1.395275,496.248557,269.314743)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 76.624184 36.763907 L 109.726305 3.662787 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.603067 0.00220613 C 1.404383 0.0516742 0.542603 0.344177 -0.0013794 0.662459 L 0.00140635 -0.660725 C 0.539288 -0.343428 1.40749 -0.0504942 1.603067 0.00220613 Z M 1.603067 0.00220613 " transform="matrix(-3.115226,-3.116778,-3.115182,3.116822,510.254695,260.614528)"/>
            <path style="fill:none;stroke-width:0.79701;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 63.362588 39.302853 L -23.5706 2.045483 " transform="matrix(4.405637,0,0,-4.407895,172.683358,422.668618)"/>
            <path style="fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;stroke-width:0.65752;stroke-linecap:butt;stroke-linejoin:miter;stroke:rgb(0%,0%,0%);stroke-opacity:1;stroke-miterlimit:10;" d="M 1.600957 -0.000929448 C 1.40818 0.0518937 0.54166 0.343486 -0.00049107 0.660424 L 0.000327527 -0.661557 C 0.540158 -0.342157 1.405645 -0.0527505 1.600957 -0.000929448 Z M 1.600957 -0.000929448 " transform="matrix(4.061909,-1.741736,-1.740844,-4.063991,451.835284,249.421385)"/>
            </g>
            </svg>`

        return div;
    };


    var increaseCount = function (dataValue) {
        objectCounter ++;
    };

    var startMinion = function () {
        document.getElementById(_divId).appendChild(divElement);


        _dataChannels.forEach(function (dataChannel) {
            if (dataChannel.channel && (dataChannel.channel.creator === 'Gyroscope' || dataChannel.channel.creator === 'LinearAccelerationSensor')) {
                dataChannel.channel.addEventListener('add', increaseCount, 'Hit visualization');
            } else {
               rightInputs = false;
            }
        });

        // var spinner = document.createElement('spinner');
        // var spinnerImage = document.createElement('img');
        // spinner.setAttribute('class', 'subMinion-spinner');
        // spinnerImage.setAttribute('src', '../assets/loading.svg');
        // spinnerImage.setAttribute('alt', 'Loading spinner');
        // spinner.appendChild(spinnerImage);
        // document.getElementById(_divId).appendChild(spinner);

        if (rightInputs) {
            var progressBar = document.createElement('div');
            var progress = document.createElement('div');
            progressBar.setAttribute('style', 'width: 100%; background-color: grey;');
            progress.setAttribute('style', 'width : 0%; height: 30px; background-color: green;');

            progressBar.appendChild(progress);
            document.getElementById(_divId).appendChild(progressBar);
            document.getElementById(_divId).appendChild(showModelParams());


            var timestampNow = Date.now();
            updateUI = setInterval(function () {
                var currentTimestamp = Date.now();
                var difference = currentTimestamp - timestampNow;
                if (difference > 1000) {
                    timestampNow = currentTimestamp;
                }
                var newDivText = document.createTextNode('Computing result: ' + Math.min(Math.round((difference/1000)*100), 100) + '%');
                divElement.replaceChild(newDivText, divText);
                divText = newDivText;
                progress.style.width = Math.min(Math.round((difference/1000)*100) , 100)+ '%';
            }, 100);
        } else {

        }

    };



    function clearDiv() {
        if (updateUI)
            clearInterval(updateUI);
        var div = document.getElementById(_divId);
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        div.style.width = '100%';
        if (_dataChannels) {
            _dataChannels.forEach(function (dataChannel) {
                if (dataChannel.channel)
                    dataChannel.channel.removeEventListener('Hit visualization');
            });
        }
    }

    function checkStarted () {
        var isTrueSet = (document.getElementById(_divId).getAttribute('data-active').toLowerCase() === 'true');
        return isTrueSet;
    }

    var loadJS = function(lib, done, location=document.querySelector('body')){
        //url is URL of external file, implementationCode is the code
        //to be called from the file, location is the location to
        //insert the <script> element
        var scriptTag = document.createElement('script');
        scriptTag.src = lib;

        scriptTag.onload = function (success) {
            d3 = window.d3;
            done(success);
        };
        scriptTag.onreadystatechange = function (success) {
            d3 = window.d3;
            done(success);
        };

        location.appendChild(scriptTag);
    };
    if (!checkStarted()) {
        clearDiv();
    } else {
        clearDiv();
        startMinion();
    }
});