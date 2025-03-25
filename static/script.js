
let treeData = {};  // Para almacenar los datos del árbol generado
let searchResult = {}; // Para almacenar los resultados de la búsqueda

function generateTree() {
    // Obtener los valores de los inputs
    const totalNodes = document.getElementById("totalNodes").value;
    const rootNode = document.getElementById("rootNode").value;
    const goalNode = document.getElementById("goalNode").value;
    const numParents = document.getElementById("numParents").value;
    const numChildren = document.getElementById("numChildren").value;
    const branches = document.getElementById("branches").value;
    const amplitude = document.getElementById("amplitude").value;
    const depth = document.getElementById("depth").value;

    // Validar que todos los campos no estén vacíos
    if (!totalNodes || !rootNode || !goalNode || !numParents || !numChildren || !branches || !amplitude || !depth) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Validar que los campos con números contengan solo valores numéricos
    const numericFields = [totalNodes, numParents, numChildren, branches, amplitude, depth];
    if (numericFields.some(field => isNaN(field))) {
        alert("Por favor, ingresa solo valores numéricos en los campos correspondientes.");
        return;
    }

    // Crear un objeto con los datos para dibujar el árbol
    treeData = {
        nodes: Array.from({ length: totalNodes }, (_, i) => ({
            id: i,
            label: String.fromCharCode(65 + i), // Genera letras A, B, C... para los nodos
            parent: i === 0 ? null : Math.floor((i - 1) / 2), // Crear una estructura jerárquica
            children: []
        }))
    };

    // Crear la estructura de hijos
    treeData.nodes.forEach((node, index) => {
        if (node.parent !== null) {
            treeData.nodes[node.parent].children.push(node.id);
        }
    });

    drawTree(treeData);
}

function drawTree(treeData) {
    d3.select("#tree-container").select("svg").remove();

    const width = 800, height = 500;
    const svg = d3.select("#tree-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(40,40)");

    const root = d3.stratify()
        .id(d => d.id)
        .parentId(d => (d.parent === null ? null : d.parent))(treeData.nodes);

    const treeLayout = d3.tree().size([width - 100, height - 100]);
    treeLayout(root);

    // Dibujar líneas entre nodos
    svg.selectAll("line")
        .data(root.links())
        .enter()
        .append("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
        .attr("stroke", "black");

    // Dibujar nodos
    svg.selectAll("circle")
        .data(root.descendants())
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 20)
        .attr("stroke", "black")
        .attr("fill", "white");

    // Etiquetas de los nodos (Letras aleatorias)
    svg.selectAll("text")
        .data(root.descendants())
        .enter()
        .append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y + 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(d => d.data.label);
}

function depthSearch() {
    const goalNode = document.getElementById("goalNode").value;
    if (!goalNode) {
        alert("Por favor, ingresa un nodo meta para la búsqueda.");
        return;
    }

    const visited = new Set();
    const stack = [0]; // Empezamos desde el nodo raíz (índice 0)
    let found = false;
    let path = [];

    while (stack.length > 0) {
        const current = stack.pop();
        if (visited.has(current)) continue;

        visited.add(current);
        path.push(treeData.nodes[current].label);

        if (treeData.nodes[current].label === goalNode) {
            found = true;
            break;
        }

        // Agregar los hijos al stack
        treeData.nodes[current].children.forEach(childId => stack.push(childId));
    }

    if (found) {
        alert("Nodo encontrado: " + path.join(" -> "));
        searchResult = { method: "Profundidad", path };
    } else {
        alert("Nodo no encontrado.");
    }
}

function breadthSearch() {
    const goalNode = document.getElementById("goalNode").value;
    if (!goalNode) {
        alert("Por favor, ingresa un nodo meta para la búsqueda.");
        return;
    }

    const visited = new Set();
    const queue = [0]; // Empezamos desde el nodo raíz (índice 0)
    let found = false;
    let path = [];

    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;

        visited.add(current);
        path.push(treeData.nodes[current].label);

        if (treeData.nodes[current].label === goalNode) {
            found = true;
            break;
        }

        // Agregar los hijos al queue
        treeData.nodes[current].children.forEach(childId => queue.push(childId));
    }

    if (found) {
        alert("Nodo encontrado: " + path.join(" -> "));
        searchResult = { method: "Amplitud", path };
    } else {
        alert("Nodo no encontrado.");
    }
}

function showSummary() {
    if (searchResult.path) {
        const summary = `
            Método de búsqueda: ${searchResult.method}<br>
            Camino encontrado: ${searchResult.path.join(" -> ")}
        `;
        document.getElementById("info").innerHTML = summary;
    } else {
        alert("No se ha realizado ninguna búsqueda aún.");
    }
}
