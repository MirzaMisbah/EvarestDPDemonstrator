'use strict';

(function (root) {

    function VisualizationService (containerId, highchartsObject=null) {
        this._containerId = containerId;
        this._container = document.querySelector('#' + this._containerId);
        this._highchartsObject = highchartsObject;
        this._chartObject = {};
    }

    VisualizationService.prototype.createTimelineVisualization = function (titleDescription, dataType, valueSuffix, dataSeries) {
        if (this._highchartsObject){
            this._chartObject.timelineChart = this._highchartsObject.chart(this._containerId, {
                chart: {
                    type: 'line'
                },
                title: {
                    text: titleDescription
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: { // don't display the dummy year
                        second: '%H:%M:%S'
                    },
                    title: {
                        text: 'Time'
                    }
                },
                yAxis: {
                    title: {
                        text: dataType
                    }
                },
                tooltip: {
                    valueSuffix: valueSuffix
                },

                series: dataSeries
            });
            return this._chartObject;
        }
    };
    VisualizationService.prototype.setUTCUsage = function (setting) {
        if (this._highchartsObject) {
            this._highchartsObject.setOptions({
                global: {
                    useUTC: setting
                }
            });
        }
    };


    /**
     * Creates a data table in specified html object
     * @param dataTableId ID of the data table
     * @param header Array containing all the header strings of the table
     * @param rows  2 dimensional Array: containing all rows. each row is an array of values.
     * @param settings Attributes of the different table elements as a simple object containing for each object a key value pair
     * @returns {HTMLTableElement}
     */
    VisualizationService.prototype.createHTMLDataTable = function (dataTableId, header, rows, settings) {
        var table = document.createElement('table');
        if (settings.table) {
            this.setAttributes(table, settings.table);
        }
        var thead = document.createElement('thead');
        if (settings.thead) {
            this.setAttributes(thead, settings.thead);
        }
        var trHead = document.createElement('tr');
        if (settings.trHead) {
            this.setAttributes(trHead, settings.trHead);
        }
        thead.appendChild(trHead);
        table.appendChild(thead);
        for (var i = 0; i < header.length; i++) {
            var th = document.createElement('th');
            if (settings.th) {
                this.setAttributes(th, settings.th);
            }
            th.appendChild(document.createTextNode(header[i]));
            trHead.appendChild(th);
        }
        var tbody = document.createElement('tbody');
        for (var i = 0; i < rows.length; i++) {
            var trBody = document.createElement('tr');
            if (settings.trBody) {
                this.setAttributes(trBody, settings.trBody);
            }
            for (var j = 0; j < rows[i].length; j++) {
                var td = document.createElement('td');
                if (settings.td) {
                    this.setAttributes(td, settings.td);
                }
                var tdText = document.createTextNode(rows[i][j]);
                td.appendChild(tdText);
                trBody.appendChild(td);
            }
            tbody.appendChild(trBody);
        }
        table.appendChild(tbody);
        document.querySelector('#' + dataTableId).innerHTML = '';
        document.querySelector('#' + dataTableId).appendChild(table);

        return table;
    };

    VisualizationService.prototype.setAttributes = function (node, attributes) {
        var keys = Object.keys(attributes);
        for (var i = 0; i < keys.length; i++) {
            node.setAttribute(keys[i], attributes[keys[i]])
        }
    };

    /**
     * Export the module for various environemnts
     */
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = VisualizationService;
    } else if (typeof exports !== 'undefined') {
        exports.VisualizationService = VisualizationService;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () {
            return VisualizationService;
        });
    } else {
        root.VisualizationService = VisualizationService;
    }

}(this));