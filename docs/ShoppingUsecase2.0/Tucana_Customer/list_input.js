/** @jsx React.DOM */
var ListItem = React.createClass({
    onClickCheckbox: function(event) {
      this.props.checkedCallback(this.props.index, event.target.checked)
    },
    onClickDelete: function() {
      this.props.deleteCallback(this.props.index)
    },
    render: function() {
      return (
        <li className="list-group-item">
        {this.props.label}
        <a className="close" href="#" onClick={this.onClickDelete}>&times;</a>
        </li>
      )
    }
  });
  var List = React.createClass({
    render: function() {
      return (
        <ul className="list-group">
          {this.props.listData.map(function(item, index) {
           return (
            <ListItem  checked={item.checked} label={item.label} checkedCallback={this.props.checkedCallback} index={index} deleteCallback={this.props.deleteCallback} />
           )
          }, this)}
        </ul>
      )
    }
  })
  var ItemInput = React.createClass({
    getInitialState: function() {
      return {value: ''}
    },
    handleChange: function(event) {
      this.setState({value: event.target.value})
    },
    handleClick: function() {
      this.props.addItemCallback(this.state.value)
    },
    render: function() {
      return (
        <div>
          <input type="text" value={this.state.value} onChange={this.handleChange} />
          <button onClick={this.handleClick}>Add Item</button>
          <button onClick={this.handleClick}>Find Offers</button>
        </div>
      )
    }
  })
  var App = React.createClass({
    getInitialState: function() {
      return ({listData: [{label: "Milk", checked: true},{label: "Cereal", checked: false},{label: "Cookies", checked: false}]})
    },
    addItem: function(value) {
      var item = {label: value, checked: false}
      this.setState({listData: this.state.listData.concat([item])})
    },
    componentDidMount: function() {
      this.addItem("Coffee")
      this.toggleItem(2, true)
    },
    toggleItem: function(index, checked) {
      var listData = this.state.listData;
      var listItem = listData[index];
      listItem.checked = checked;
      this.forceUpdate();
    },
    deleteItem: function(index) {
      var listData = this.state.listData;
      var listItem = listData[index];
      listData = listData.slice(0, index).concat(listData.slice(index + 1));
      this.setState({listData: listData})
    },
    render: function() {
      return (
        <div>
          <ItemInput addItemCallback={this.addItem} />
          <List listData={this.state.listData} checkedCallback={this.toggleItem} deleteCallback={this.deleteItem} />
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
        if(self.state.activeIndex === index) {
          return (
            <div className="TabPane">
              {child.props.children}
            </div>
          );
        }
      });
  
      return (
        <div className="TabbedArea">
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
  
  React.renderComponent(
    <TabbedArea>
      <TabPane display="Shopping List">
        <h1 id = "t1">Add Items and Search!</h1>
    <App/>
      </TabPane>
      <TabPane display="Tab 2">
        <div>Contents of Tab 2.</div>
      </TabPane>
      <TabPane display="Tab 3">
        <div>Tab 3 Contents.</div>
      </TabPane>
    </TabbedArea>,
    document.getElementById("root"));
  
   