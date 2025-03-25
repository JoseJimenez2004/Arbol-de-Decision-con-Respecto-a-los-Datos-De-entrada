from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
import networkx as nx
import random
import string

app = FastAPI()
templates = Jinja2Templates(directory="templates")

def generate_label(index):
    """Genera etiquetas con un patrón que va desde A-Z, luego AA, AB, etc."""
    result = []
    while index >= 0:
        result.append(chr(index % 26 + 65))  # A-Z son 65-90 en ASCII
        index = index // 26 - 1
    return ''.join(reversed(result))

def generate_tree(total_nodes, labels=None):
    """Genera un árbol binario con etiquetas personalizadas o generadas automáticamente"""
    G = nx.DiGraph()
    labels_dict = {}

    # Si no se proporcionan etiquetas, genera etiquetas con el patrón especificado
    if labels is None:
        labels = {i: generate_label(i) for i in range(total_nodes)}

    for i in range(total_nodes):
        labels_dict[i] = labels[i]
        G.add_node(i, label=labels_dict[i])

    for i in range(1, total_nodes):
        parent = (i - 1) // 2
        G.add_edge(parent, i)

    return G, labels_dict

@app.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/generate_tree")
async def get_tree_data(total_nodes: int = 10, labels: str = None):
    # Si se pasa una lista de etiquetas, la convierte en una lista de etiquetas
    if labels:
        labels = labels.split(",")  # Espera una cadena separada por comas para los labels
        if len(labels) != total_nodes:
            return {"error": "El número de etiquetas no coincide con el número total de nodos"}
    
    # Genera el árbol con las etiquetas proporcionadas o aleatorias
    tree, labels_dict = generate_tree(total_nodes, labels)

    tree_data = {
        "nodes": [{"id": node, "label": labels_dict[node]} for node in tree.nodes],
        "links": [{"source": u, "target": v} for u, v in tree.edges],
        "total_nodes": total_nodes,
        "root": 0,
        "goal_node": total_nodes - 1,
        "num_parents": len([n for n in tree.nodes if tree.in_degree(n) > 0]),
        "num_children": len([n for n in tree.nodes if tree.out_degree(n) > 0]),
        "branches": len(tree.edges),
        "amplitude": max(tree.out_degree(n) for n in tree.nodes),
        "depth": nx.dag_longest_path_length(tree)
    }

    return tree_data
