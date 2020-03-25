/** @jsx React.DOM */
var ListItem = React.createClass({
    onClickCheckbox: function (event) {
        this.props.checkedCallback(this.props.index, event.target.checked)
    },
    onClickDelete: function () {
        this.props.deleteCallback(this.props.index)
    },
    render: function () {
        return (
            <li className="list-group-item">
                {this.props.label}
                <a className="close" href="#" onClick={this.onClickDelete}>&times;</a>
            </li>
        )
    }
});
var List = React.createClass({
    render: function () {
        return (
            <ul id="shopList" className="list-group">
                {this.props.listData.map(function (item, index) {
                    return (
                        <ListItem checked={item.checked} label={item.label} checkedCallback={this.props.checkedCallback}
                                  index={index} deleteCallback={this.props.deleteCallback}/>
                    )
                }, this)}
            </ul>
        )
    }
})

var List = React.createClass({
    render: function () {

        return (
            <ul id="shopList" className="list-group">
                {this.props.listData.map(function (item, index) {
                    return (
                        <ListItem checked={item.checked} label={item.label} checkedCallback={this.props.checkedCallback}
                                  index={index} deleteCallback={this.props.deleteCallback}/>
                    )
                }, this)}
            </ul>
        )
    }
})

var StoreItem = React.createClass({
    onClickCheckbox: function (event) {
        this.props.checkedCallback(this.props.index, event.target.checked)
    },
    onClickDelete: function () {

        this.props.deleteCallback(this.props.index)
    },
    render: function () {
        return (
            <tr className="list-group-item">
                {this.props.label}
                <input type="checkbox" className="mdc-checkbox__native-control" id="checkbox-1"/>
            </tr>
        )
    }
});
var StoreList = React.createClass({
    render: function () {
        return (
            <table id="ItemList" className="list-group">
                {this.props.listData.map(function (item, index) {
                    return (
                        <StoreItem checked={item.checked} label={item.label}
                                   checkedCallback={this.props.checkedCallback}
                                   index={index} deleteCallback={this.props.deleteCallback}/>
                    )
                }, this)}
            </table>
        )
    }
})


var ItemInput = React.createClass({
    getInitialState: function () {
        return {value: ''}
    },
    handleChange: function (event) {
        this.setState({value: event.target.value})
    },
    handleClick: function () {
        if (this.state.value != "") {
            this.props.addItemCallback(this.state.value)
            this.state.value = ""
        }
    },

    render: function () {
        return (
            <div>
                <input type="text" value={this.state.value} onChange={this.handleChange}/>
                <button onClick={this.handleClick}>Add Item</button>
            </div>
        )
    }
})
var App = React.createClass({
    getInitialState: function () {
        if (this.state != null) {
            if (this.state.listData != null) {
                return ({listData: this.state.listData})
            }
        }
        return ({listData: []})
    },
    addItem: function (value) {
        var item = {label: value, checked: false}
        this.setState({listData: this.state.listData.concat([item])})
    },
    componentDidMount: function () {
        //this.addItem(' ')
        //this.toggleItem(2, true)
    },
    toggleItem: function (index, checked) {
        var listData = this.state.listData;
        var listItem = listData[index];
        listItem.checked = checked;
        this.forceUpdate();
    },
    deleteItem: function (index) {
        var listData = this.state.listData;
        var listItem = listData[index];
        listData = listData.slice(0, index).concat(listData.slice(index + 1));
        this.setState({listData: listData})
    },
    emptyListItem: function () {
        //this.setState({listData: []})
    },
    render: function () {
        return (
            <div>
                <ItemInput addItemCallback={this.addItem} emptyItemCallback={this.emptyListItem}/>
                <List listData={this.state.listData} checkedCallback={this.toggleItem}
                      deleteCallback={this.deleteItem}/>

            </div>
        )
    }
})

var App2 = React.createClass({
    getInitialState: function (newData) {


        return ({listData: []})

    },

    deleteItem: function (index) {
        var listData = this.state.listData;
        var listItem = listData[index];
        listData = listData.slice(0, index).concat(listData.slice(index + 1));
        this.setState({listData: listData})
    },
    render: function () {


        return (

            <div id="StoreList">
                <StoreList listData={this.state.listData} checkedCallback={this.toggleItem}
                           deleteCallback={this.deleteItem}/>
            </div>


        )

    }
})

var App3 = React.createClass({
    getInitialState: function (newData) {

        return ({listData: []})

    },

    deleteItem: function (index) {
        var listData = this.state.listData;
        var listItem = listData[index];
        listData = listData.slice(0, index).concat(listData.slice(index + 1));
        this.setState({listData: listData})
    },
    render: function () {


        return (

            <div id="StoreList">
                <StoreList listData={this.state.listData} checkedCallback={this.toggleItem}
                           deleteCallback={this.deleteItem}/>
            </div>
        )

    }
})


var TabbedArea = React.createClass({

    getInitialState: function () {
        return {
            activeIndex: this.props.activeIndex || 0
        };
    },

    render: function () {
        var self = this;
        var cx = React.addons.classSet;
        var tabNodes = _.map(this.props.children, function (child, index) {
            var className = cx({'active': self.state.activeIndex === index});
            return (
                <li onClick={self._handleClick.bind(null, index)}>
                    <a className={className} href="#">{child.props.display}</a>
                </li>
            );
        });

        var contentNodes = _.map(this.props.children, function (child, index) {
            if (self.state.activeIndex === index) {
                return (
                    <div className="TabPane">
                        {child.props.children}
                    </div>
                );
            }
        });

        return (
            <div id="tabA" className="TabbedArea">
                <ul className="Tab clearfix">
                    {tabNodes}
                </ul>
                <section>
                    {contentNodes}
                </section>
            </div>
        );
    },

    _handleClick: function (index) {
        this.setState({
            activeIndex: index
        });
    }
});

var TabPane = React.createClass({
    render: function () {
        var active = this.props.active || false;
        if (active) {
            return this.props.children;
        } else {
            return null;
        }
    }
});


var MapTab = React.createClass({


    render: function () {

        return (


            <div id="lagePlan"></div>
        )
    },

    componentDidMount: function () {

        var mapLoadEvent = new CustomEvent('mapLoaded');
        window.dispatchEvent(mapLoadEvent);



    }
})



React.renderComponent(
    <TabbedArea>
        <TabPane display="Shopping List">
            <h1 id="t1">Add Items and Search!</h1>
            <App/>
            <div id="items"> 
            </div>
        </TabPane>
        <TabPane display="Store Map">

            <MapTab/>


        </TabPane>
        <TabPane display="Get Delivery">
        <div id="del1">

            </div>
            <div id="del">
                <p id="t3">Buy itmes to select delivery options</p>
            </div>
        </TabPane>
    </TabbedArea>,
    document.getElementById("root"));

