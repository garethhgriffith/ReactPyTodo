import json
import os
import time
from flask import Flask, Response, request

app = Flask(__name__, static_url_path='', static_folder='public')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))

@app.route('/api/todo/list', methods=['GET', 'POST'])
def og_handler():
    # Open the json file for reading
    with open('todo.json', 'r') as f:
        todo = json.loads(f.read())

    if request.method == 'POST':
        # Grab the new incoming todo
        new_todo = request.form.to_dict()
        # Add an ID to the todo to make it unique
        new_todo['id'] = int(time.time() * 1000)
        # Append new todo object to the stored one
        todo.append(new_todo)
        # Write the updates to the json file
        with open('todo.json', 'w') as f:
            # Pretty print into the JSON file
            f.write(json.dumps(todo, indent=4, separators=(',', ': ')))

    return Response(
        # Send the JSON object back to be consumed by the view
        json.dumps(todo),
        status=200,
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )

@app.route('/api/todo/list', methods=['PUT'])
def sort_todo_handler():
    data = request.get_json()

    # Open the json file for reading
    with open('todo.json', 'r') as f:
        todo = json.loads(f.read())

    todo.pop(data['from'])
    todo.insert(data['to'], data['data'])
    # Write the updates to the json file
    with open('todo.json', 'w') as f:
        # Pretty print into the JSON file
        f.write(json.dumps(todo, indent=4, separators=(',', ': ')))

    return Response(
        # Send the JSON object back to be consumed by the view
        # json.dumps(todo),
        status = 200,
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )

@app.route('/api/todo/list/checkbox', methods=['PUT'])
def checkbox_handler():
    data = request.get_json()
    # print json.dumps(data, sort_keys=True, indent=4, separators=(',', ': '))
    # Open the json file for reading
    with open('todo.json', 'r') as f:
        todo = json.loads(f.read())
    #If we are not targeting a specific checkbox make them all checked
    if data['index'] == "":
        for index, item in enumerate(todo):
            todo[index]['checked'] = data['state']
    else:
        #Set the current state of the checkbox
        todo[data['index']]['checked'] = data['state']

    # print json.dumps(todo, sort_keys=True, indent=4, separators=(',', ': '))

    # Write the updates to the json file
    with open('todo.json', 'w') as f:
        # Pretty print into the JSON file
        f.write(json.dumps(todo, indent=4, separators=(',', ': ')))

    return Response(
        # Send the JSON object back to be consumed by the view
        json.dumps(todo),
        status = 200,
        mimetype='application/json',
        headers={
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        }
    )

if __name__ == '__main__':
    app.run(port=int(os.environ.get("PORT", 3000)), debug=True)
