function generateTree() {
    const totalNodes = document.getElementById("totalNodes").value;

    fetch(`/generate_tree?total_nodes=${totalNodes}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("info").innerHTML = `
                <p><strong>Número total de nodos:</strong> ${data.total_nodes}</p>
                <p><strong>Nodo raíz:</strong> ${data.root}</p>
                <p><strong>Nodo meta:</strong> ${data.goal_node}</p>
                <p><strong>Número de nodos padres:</strong> ${data.num_parents}</p>
                <p><strong>Número de nodos hijos:</strong> ${data.num_children}</p>
                <p><strong>Número de ramas:</strong> ${data.branches}</p>
                <p><strong>Amplitud del árbol:</strong> ${data.amplitude}</p>
                <p><strong>Profundidad del árbol:</strong> ${data.depth}</p>
            `;

            drawTree(data);
        });
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
        .parentId(d => (d.id === 0 ? null : Math.floor((d.id - 1) / 2)))
        (treeData.nodes);

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
