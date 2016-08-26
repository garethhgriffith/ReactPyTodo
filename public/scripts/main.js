/*

*/
var TodoForm = React.createClass({
  getInitialState: function() {
    return {text: '', checked: ''};
  },

  handleTextChange: function(e) {
    // e.target.value grabs the value of the input field in real time
    // Build the text key | value inside of the this Object
    this.setState({text: e.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    // On submit grab the text from the field and clean off the whitespace from the ends
    var text = this.state.text.trim();
    var checked = "";
    if(!text) {
      return;
    }
    // Add the new item as a property of TodoForm
    this.props.onCommentSubmit({text: text, checked: checked});
    this.setState({text: '', checked: ''});
  },

  render: function() {
    return (
      <div className="todo-form">
        <form className="form-inline" onSubmit={this.handleSubmit}>
          <input
            type="text"
            className="form-control"
            placeholder="What needs to be done"
            //Resets the placeholder after submit
            value={this.state.text}
            // Pass the text from the form to handleTextChange
            onChange={this.handleTextChange}
          />
          <button type="submit" className="btn btn-default">Add Todo</button>
        </form>
      </div>
    );
  }
});









/*
  Grab all of the todo items from Todo and build the list
*/
var placeholder = document.createElement("li");
placeholder.className = "placeholder";

var TodoList = React.createClass({

  getInitialState: function() {
    return {data: this.props.data};
  },

  componentWillMount() {
    this.setState({data: this.props.data});
  },

  componentWillReceiveProps(newProps) {
    this.setState({data: newProps.data});
  },

  dragStart: function(e) {
    this.dragged = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires dataTransfer data to be set
    e.dataTransfer.setData("text/html", e.currentTarget);
  },

  dragEnd: function(e) {
    this.dragged.style.display = "block";
    this.dragged.parentNode.removeChild(placeholder);
    // Update data
    var data = this.state.data;
    var from = Number(this.dragged.dataset.id);
    var to = Number(this.over.dataset.id);
    if(from < to) to--;
    if(this.nodePlacement == "after") to++;
    //Grab the locations that need to be updated and the data that needs to move
    //Update the data on the server side
    var toFrom = {"from": from, "to": to};
    var listUpdateObj = React.addons.update(toFrom, {$merge: {"data": data[from]}});
    this.props.updateList(listUpdateObj);
    //Update the list and state
    data.splice(to, 0, data.splice(from, 1)[0]);
    this.setState({data: data});
  },

  dragOver: function(e) {
    e.preventDefault();
    this.dragged.style.display = "none";
    // console.log(e.target.className);
    if(e.target.className == "placeholder") return;
    this.over = e.target;
    // Inside the dragOver method
    var relY = e.clientY - this.over.offsetTop;
    var height = this.over.offsetHeight / 2;
    var parent = e.target.parentNode;

    if(relY > height) {
      this.nodePlacement = "after";
      parent.insertBefore(placeholder, e.target.nextElementSibling);
    }
    else if(relY < height) {
      this.nodePlacement = "before"
      parent.insertBefore(placeholder, e.target);
    }
  },

  handleCheckboxChange: function(index, e) {
    var data = React.addons.update(this.state.data,{
     [index]:{
       checked: {$set: e.target.checked}
     }
    });
    this.setState({ data: data })
    this.props.updateCheckbox({"index": index, "state": e.target.checked});
  },

  render: function() {
    // this.props.data is an array of all of the objects built from the JSON
    // this.setState({ data: _extends({}, this.state.data, { name: 'barfoo' }) });
    // var text = "string";
    // this.setState({text: this.state.data[0].text});
    // console.log("List Results: ", this.state.data);
      return (
        <ul id="todo-list-ul" className="todo-list" onDragOver={this.dragOver}>
            {
              this.state.data.map((result, i) => {
                // console.log("In render: ", result.text);
                return (
                  <li
                    data-id={i}
                    key={i}
                    draggable="true"
                    onDragEnd={this.dragEnd}
                    onDragStart={this.dragStart}
                  >
                    <input
                      type="checkbox"
                      id="todoItem"
                      checked={result.checked}
                      onChange={this.handleCheckboxChange.bind(this, i)}
                    />
                    <label htmlFor="todoItem">{result.text}</label>

                  </li>
                )
              }, this)
            }
        </ul>
      );
    }
  });







/*

*/
var TodoFooter = React.createClass ({
  getInitialState: function() {
    return {data: this.props.data};
  },

  componentWillMount() {
    this.setState({data: this.props.data});
  },

  componentWillReceiveProps(newProps) {
    this.setState({data: newProps.data});
  },

  getNumLeftTodo: function() {
    var size = this.state.data.filter(function(value) {
      console.log(value.checked);
      return value.checked !== true
    }).length;
    console.log(size);
    return (size + " items left");
  },

  checkAllTodos: function() {
    this.props.updateCheckbox({"index": "", "state": true});
  },

  render: function () {
    return (
      <div>
        <div className="todo-footer">{this.getNumLeftTodo()}</div>
        <div className="todo-footer-right" onClick={this.checkAllTodos}>Mark all as complete</div>
      </div>
    );
  }
});



/*

*/
var TodoBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },

  loadTodosFromServer: function() {
    $.ajax({
      url: this.props.url + "/list",
      dataType: 'json',
      type: 'GET',
      cache: false,
      success: function(dataResponse) {
        this.setState({data: dataResponse});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleTodoSubmit: function(todo) {
    $.ajax({
      url: this.props.url + "/list",
      dataType: 'json',
      type: 'POST',
      data: todo,
      success: function(dataResponse) {
        this.setState({data: dataResponse});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: comments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  handleListSorting: function(fromTo) {
    $.ajax({
      url: this.props.url + "/list",
      contentType: 'application/json;charset=UTF-8',
      type: 'PUT',
      data: JSON.stringify(fromTo, null, '\t')
    });
  },

  handleCheckbox: function(checkbox) {
    $.ajax({
      url: this.props.url + "/list/checkbox",
      contentType: 'application/json;charset=UTF-8',
      type: 'PUT',
      data: JSON.stringify(checkbox, null, '\t'),
      success: function(dataResponse) {
        this.setState({data: dataResponse});
        console.log("Handle Checkbox: ", this.state.data)
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadTodosFromServer();
  },

  render: function() {
    // console.log("Box Render: ", this.state);
    return (
      <div className="container" onDragStart={false} onDrop={false}>
        <div className="todo-container" onDragStart={false} onDrop={false}>
          <h2><strong>Todos</strong></h2>
          <TodoForm onCommentSubmit={this.handleTodoSubmit} />
          <TodoList data={this.state.data} updateList={this.handleListSorting} updateCheckbox={this.handleCheckbox}/>
          <TodoFooter data={this.state.data} updateCheckbox={this.handleCheckbox}/>
        </div>
      </div>
    );
  }
});


ReactDOM.render(
  <TodoBox url="/api/todo"/>,
  //Removing 2 sec polling
  // <TodoBox url="/api/comments" pollInterval={2000}/>,
  // <MyComponent/>,
  document.getElementById('content')
);
