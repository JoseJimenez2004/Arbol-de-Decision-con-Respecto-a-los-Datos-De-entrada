document.getElementById('treeForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nodesInput = document.getElementById('nodesInput').value.trim();
    const edgesInput = document.getElementById('edgesInput').value.trim();
    const nodes = nodesInput.split(',').map(node => node.trim());
    const edges = edgesInput.split(',').map(edge => edge.trim());

    if (nodes.length < 1 || edges.length < 1) {
        document.getElementById('error').textContent = "Por favor ingrese nodos y relaciones válidas.";
        return;
    }

    const requestData = { nodes, edges };

    fetch('/generate_tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('error').textContent = data.error;
            return;
        }

        document.getElementById('error').textContent = "";

        displayTree(data);
        displaySummary(data);
        displaySearchAlgorithms(data);
    })
    .catch(error => console.error('Error:', error));
});

function displayTree(data) {
    let treeGraph = "<ul>";
    data.depth_first.forEach(node => {
        treeGraph += `<li>${node}</li>`;
    });
    treeGraph += "</ul>";
    document.getElementById('treeGraph').innerHTML = treeGraph;
}

function displaySummary(data) {
    const summary = `
        <h3>Resumen del Árbol</h3>
        <p>Nodo raíz: ${data.root_node}</p>
        <p>Profundidad del árbol: ${data.depth}</p>
        <p>Amplitud del árbol: ${data.width}</p>
        <p>Total de nodos: ${data.num_nodes}</p>
        <p>Total de ramas: ${data.num_edges}</p>
    `;
    document.getElementById('treeSummary').innerHTML = summary;
}

function displaySearchAlgorithms(data) {
    const searchSummary = `
        <h3>Algoritmos de Búsqueda</h3>
        <p>Búsqueda por profundidad: ${data.depth_first.join(' -> ')}</p>
        <p>Búsqueda por amplitud: ${data.breadth_first.join(' -> ')}</p>
    `;
    document.getElementById('treeSummary').innerHTML += searchSummary;
}
