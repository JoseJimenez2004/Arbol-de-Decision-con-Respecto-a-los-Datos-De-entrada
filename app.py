from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

# Función para generar el árbol de decisión
def generate_tree(nodes, edges):
    tree = {node: [] for node in nodes}
    
    for edge in edges:
        parent, child = edge.split('->')
        parent, child = parent.strip(), child.strip()
        if parent in tree and child in tree:
            tree[parent].append(child)
        else:
            return None  # Error si la relación no es válida

    return tree

# Función para calcular la profundidad
def calculate_depth(tree, node):
    if node not in tree or not tree[node]:
        return 1
    depths = [calculate_depth(tree, child) for child in tree[node]]
    return max(depths) + 1

# Función para calcular la amplitud
def calculate_width(tree, node):
    return len(tree[node]) if node in tree else 0

# Algoritmo de búsqueda por profundidad
def depth_first_search(tree, start_node):
    result = []
    visited = set()

    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        result.append(node)
        for child in tree[node]:
            dfs(child)

    dfs(start_node)
    return result

# Algoritmo de búsqueda por amplitud
def breadth_first_search(tree, start_node):
    result = []
    queue = [start_node]
    visited = set()

    while queue:
        node = queue.pop(0)
        if node in visited:
            continue
        visited.add(node)
        result.append(node)
        queue.extend(tree[node])

    return result

# Ruta principal para mostrar la interfaz
@app.route('/')
def index():
    return render_template('index.html')

# API para generar el árbol y devolver el resumen
@app.route('/generate_tree', methods=['POST'])
def generate_and_get_summary():
    data = request.json
    nodes = data.get('nodes', [])
    edges = data.get('edges', [])

    if not nodes or not edges:
        return jsonify({'error': 'Debe proporcionar nodos y relaciones válidas'}), 400

    tree = generate_tree(nodes, edges)
    if tree is None:
        return jsonify({'error': 'Las relaciones no son válidas'}), 400

    # Resumen del árbol
    root_node = nodes[0]
    depth = calculate_depth(tree, root_node)
    width = calculate_width(tree, root_node)
    num_nodes = len(tree)
    num_edges = sum(len(children) for children in tree.values())

    # Algoritmos de búsqueda
    depth_first = depth_first_search(tree, root_node)
    breadth_first = breadth_first_search(tree, root_node)

    summary = {
        'root_node': root_node,
        'depth': depth,
        'width': width,
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'depth_first': depth_first,
        'breadth_first': breadth_first
    }

    return jsonify(summary)

if __name__ == '__main__':
    app.run(debug=True)
