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
    // Clear any previous tree and reset container
    d3.select("#tree-container").select("svg").remove();
    
    // Configure container for proper scrolling - no need to set these in JS as they're now in CSS
    // Let's just ensure the container is empty before we begin
    const container = d3.select("#tree-container");
    
    // Calculate required dimensions based on node count
    const nodeCount = treeData.nodes.length;
    const maxDepth = Math.ceil(Math.log2(nodeCount + 1));
    
    // Calculate expanded dimensions to ensure no clipping
    // Width grows with node count, height grows with depth
    const width = Math.max(2000, nodeCount * 140); // More generous width
    const height = Math.max(800, maxDepth * 250); // Height based on tree depth
    
    // Create SVG with ample dimensions
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // Create a group for the entire tree
    const g = svg.append("g")
        .attr("transform", `translate(${width * 0.05}, 80)`); // Start from 5% of width for more space
    
    // Create stratified data structure for tree layout
    const root = d3.stratify()
        .id(d => d.id)
        .parentId(d => (d.parent === null ? null : d.parent))
        (treeData.nodes);
    
    // Create tree layout with improved spacing
    const treeLayout = d3.tree()
        .size([width * 0.9, height - 160]) // Use 90% of width for better spread
        .separation((a, b) => {
            // Dynamic separation based on depth and number of siblings
            const baseSeparation = a.parent === b.parent ? 3.5 : 6;
            // Add extra space for deeper levels where nodes might cluster
            const depthFactor = Math.max(1, 3 - a.depth * 0.2);
            return baseSeparation * depthFactor;
        });
    
    treeLayout(root);
    
    // Group nodes by level for animation
    const maxTreeDepth = Math.max(...root.descendants().map(d => d.depth));
    const nodesByLevel = [];
    for (let i = 0; i <= maxTreeDepth; i++) {
        nodesByLevel.push(root.descendants().filter(d => d.depth === i));
    }
    
    // Create containers for elements
    const linksGroup = g.append("g").attr("class", "links");
    const nodesGroup = g.append("g").attr("class", "nodes");
    const textsGroup = g.append("g").attr("class", "texts");
    
    // Show loading message
    d3.select("#tree-container")
        .append("div")
        .attr("id", "loading-message")
        .style("position", "absolute")
        .style("top", "50%")
        .style("left", "50%")
        .style("transform", "translate(-50%, -50%)")
        .style("background-color", "rgba(255,255,255,0.8)")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .text("Construyendo árbol...");
        
    // Continue with your existing animation code...
    function animateLevel(level) {
        if (level > maxTreeDepth) {
            // Remove loading message when animation completes
            d3.select("#loading-message").remove();
            return;
        }
        
        const currentNodes = nodesByLevel[level];
        const parentLinks = level > 0 ? 
            root.links().filter(link => link.target.depth === level) : [];
            
        // Animate links first
        if (level > 0) {
            parentLinks.forEach(link => {
                linksGroup.append("line")
                    .attr("x1", link.source.x)
                    .attr("y1", link.source.y)
                    .attr("x2", link.source.x)
                    .attr("y2", link.source.y)
                    .attr("stroke", "#666")
                    .attr("stroke-width", 2)
                    .attr("class", "line-default") // Add class for styling
                    .transition()
                    .duration(500)
                    .attr("x2", link.target.x)
                    .attr("y2", link.target.y);
            });
        }
        
        // Then animate nodes
        setTimeout(() => {
            currentNodes.forEach(node => {
                // Add node circles with grow animation and proper class
                nodesGroup.append("circle")
                    .attr("cx", node.parent ? node.parent.x : node.x)
                    .attr("cy", node.parent ? node.parent.y : node.y)
                    .attr("r", 0)
                    .attr("class", "node-default") // Add class for styling
                    .attr("data-id", node.data.id) // Store node ID for search animations
                    .datum(node) // Store the node data for later reference
                    .transition()
                    .duration(600)
                    .attr("cx", node.x)
                    .attr("cy", node.y)
                    .attr("r", 22);
                
                // Add text labels with fade-in
                textsGroup.append("text")
                    .attr("x", node.x)
                    .attr("y", node.y + 5)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "14px")
                    .attr("font-weight", "bold")
                    .text(node.data.label)
                    .attr("opacity", 0)
                    .transition()
                    .duration(300)
                    .delay(400)
                    .attr("opacity", 1);
            });
            
            // Progress to next level after delay
            setTimeout(() => {
                animateLevel(level + 1);
            }, 800);
        }, level > 0 ? 500 : 100);
    }
    
    // Start animation from root level
    animateLevel(0);
    
    // After drawing is complete, scroll to center on the root node
    setTimeout(() => {
        const rootNode = nodesByLevel[0][0];
        const rootX = rootNode.x;
        const rootY = rootNode.y;
        
        // Scroll to center the root node in the view
        const container = document.getElementById("tree-container");
        container.scrollLeft = rootX - container.clientWidth / 2;
        container.scrollTop = rootY / 2;
    }, (maxTreeDepth + 1) * 800); // Wait for the animation to complete
}

// Global variable for animation control
let currentAnimation = null;
const ANIMATION_SPEED = 600; // Fixed animation speed

function depthSearch() {
    resetTreeHighlighting();
    const goalNode = document.getElementById("goalNode").value;
    if (!goalNode) {
        alert("Por favor, ingresa un nodo meta para la búsqueda.");
        return;
    }

    // Get accurate DOM mappings
    const { nodeMap, links } = mapNodesToDom();

    // Perform DFS but store steps for animation
    const stepsTaken = performDFS(goalNode);
    animateSearch(stepsTaken, nodeMap, links, "Profundidad");

    return true;
}

function performDFS(goalNode) {
    const visited = new Set();
    const stack = [0];
    const steps = [];
    let found = false;
    let path = [];

    while (stack.length > 0 && !found) {
        const current = stack[stack.length - 1]; // Peek at the next node
        
        if (visited.has(current)) {
            stack.pop(); // Actually remove it since it's already visited
            continue;
        }
        
        // Record this step (current node and stack state)
        steps.push({
            type: 'visit',
            node: current,
            stack: [...stack],
            visited: new Set(visited)
        });
        
        visited.add(current);
        path.push(current);
        
        if (treeData.nodes[current].label === goalNode) {
            steps.push({
                type: 'found',
                node: current,
                path: [...path]
            });
            found = true;
            break;
        }
        
        // Get children and add to stack
        const children = [...treeData.nodes[current].children];
        children.reverse(); // Reverse so they get popped in original order
        
        for (const child of children) {
            if (!visited.has(child)) {
                steps.push({
                    type: 'consider',
                    node: current,
                    child: child,
                    stack: [...stack, child]
                });
                stack.push(child);
            }
        }
        
        // If there were no children to add, backtrack
        if (stack[stack.length - 1] === current) {
            stack.pop();
            steps.push({
                type: 'backtrack',
                node: current,
                stack: [...stack]
            });
        }
    }
    
    if (!found) {
        steps.push({
            type: 'notfound'
        });
    }
    
    return steps;
}

function breadthSearch() {
    resetTreeHighlighting();
    const goalNode = document.getElementById("goalNode").value;
    if (!goalNode) {
        alert("Por favor, ingresa un nodo meta para la búsqueda.");
        return;
    }
    
    // Get accurate DOM mappings
    const { nodeMap, links } = mapNodesToDom();

    const stepsTaken = performBFS(goalNode);
    animateSearch(stepsTaken, nodeMap, links, "Amplitud");
    
    return true;
}

function performBFS(goalNode) {
    const visited = new Set();
    const queue = [0];
    const steps = [];
    let found = false;
    const parentMap = {}; // To reconstruct path
    
    while (queue.length > 0 && !found) {
        const current = queue.shift();
        
        if (visited.has(current)) {
            continue;
        }
        
        steps.push({
            type: 'visit',
            node: current,
            queue: [...queue],
            visited: new Set(visited)
        });
        
        visited.add(current);
        
        if (treeData.nodes[current].label === goalNode) {
            // Reconstruct path
            let path = [current];
            let node = current;
            while (parentMap[node] !== undefined) {
                node = parentMap[node];
                path.unshift(node);
            }
            
            steps.push({
                type: 'found',
                node: current,
                path: path
            });
            
            found = true;
            break;
        }
        
        // Add all children to queue
        for (const child of treeData.nodes[current].children) {
            if (!visited.has(child) && !queue.includes(child)) {
                parentMap[child] = current;
                steps.push({
                    type: 'consider',
                    node: current,
                    child: child,
                    queue: [...queue, child]
                });
                queue.push(child);
            }
        }
    }
    
    if (!found) {
        steps.push({
            type: 'notfound'
        });
    }
    
    return steps;
}

function animateSearch(steps, nodeMap, links, method) {
    let i = 0;
    let finalPath = [];
    
    // Clear any existing animations
    if (currentAnimation) clearInterval(currentAnimation);
    
    function nextStep() {
        if (i >= steps.length) {
            // Search is complete
            if (finalPath.length > 0) {
                const pathLabels = finalPath.map(nodeId => treeData.nodes[nodeId].label);
                showSearchComplete(pathLabels, method);
            }
            return;
        }
        
        const step = steps[i];
        
        switch(step.type) {
            case 'visit':
                // Reset previous current node without transitions
                d3.selectAll("circle.node-current")
                    .attr("class", "node-visited");
                
                // Highlight current node
                if (nodeMap[step.node]) {
                    d3.select(nodeMap[step.node])
                        .attr("class", "node-current");
                }
                
                // Mark visited nodes (only ones not already marked)
                step.visited.forEach(nodeId => {
                    if (nodeId !== step.node && nodeMap[nodeId] && 
                        !d3.select(nodeMap[nodeId]).classed("node-visited")) {
                        d3.select(nodeMap[nodeId])
                            .attr("class", "node-visited");
                    }
                });
                break;
                
            case 'consider':
                // Highlight the edge connecting current to child (only if not already highlighted)
                if (links[step.node] && links[step.node][step.child] && 
                    !d3.select(links[step.node][step.child]).classed("line-active")) {
                    d3.select(links[step.node][step.child])
                        .attr("class", "line-active");
                }
                break;
                
            case 'backtrack':
                if (nodeMap[step.node]) {
                    d3.select(nodeMap[step.node])
                        .attr("class", "node-visited");
                }
                break;
                
            case 'found':
                finalPath = step.path;
                
                // Reset all nodes to visited first
                d3.selectAll("circle.node-current, circle.node-path")
                    .attr("class", "node-visited");
                
                // Highlight the path to the goal
                step.path.forEach(nodeId => {
                    if (nodeMap[nodeId]) {
                        d3.select(nodeMap[nodeId])
                            .attr("class", "node-path");
                    }
                });
                
                // Highlight the goal node specially
                if (nodeMap[step.node]) {
                    d3.select(nodeMap[step.node])
                        .attr("class", "node-goal");
                }
                
                // Highlight the path edges
                for (let j = 0; j < step.path.length - 1; j++) {
                    const parent = step.path[j];
                    const child = step.path[j + 1];
                    if (links[parent] && links[parent][child]) {
                        d3.select(links[parent][child])
                            .attr("class", "line-path");
                    }
                }
                break;
                
            case 'notfound':
                alert("Nodo no encontrado.");
                break;
        }
        
        i++;
    }
    
    // Use setInterval for the animation
    currentAnimation = setInterval(() => {
        nextStep();
        if (i >= steps.length) {
            clearInterval(currentAnimation);
        }
    }, ANIMATION_SPEED);
}

function resetTreeHighlighting() {
    // Clear any existing animations
    if (currentAnimation) clearInterval(currentAnimation);
    
    // Reset all nodes and edges to default state
    d3.selectAll("circle")
        .classed("node-default", true)
        .classed("node-current", false)
        .classed("node-visited", false)
        .classed("node-path", false)
        .classed("node-goal", false);
        
    d3.selectAll("line")
        .classed("line-default", true)
        .classed("line-active", false)
        .classed("line-path", false);
}

// Updated styles function - removing control panel styles
function addStyles() {
    if (!document.getElementById('search-animation-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'search-animation-styles';
        styleEl.textContent = `
            .node-default { fill: white; stroke: #333; stroke-width: 2; }
            .node-current { fill: #ff9900; stroke: #333; stroke-width: 3; animation: pulse 1s infinite; }
            .node-visited { fill: #e0e0e0; stroke: #333; }
            .node-path { fill: #5cb85c; stroke: #333; stroke-width: 3; }
            .node-goal { fill: #5bc0de; stroke: #333; stroke-width: 3; }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            .line-default { stroke: #999; stroke-width: 1.5; }
            .line-active { stroke: #ff9900; stroke-width: 3; transition: all 0.3s ease-in; }
            .line-path { stroke: #5cb85c; stroke-width: 3; }
        `;
        document.head.appendChild(styleEl);
    }
}

// Call this function at the beginning of your script or in window.onload
addStyles();

// Updated node mapping function for search animations
function mapNodesToDom() {
    const nodeMap = {};
    d3.selectAll("circle").each(function() {
        const node = d3.select(this);
        const nodeId = node.attr("data-id");
        nodeMap[nodeId] = this;
    });
    
    const links = {};
    d3.selectAll("line").each(function() {
        const line = d3.select(this);
        const source = line.attr("x1") + "," + line.attr("y1");
        const target = line.attr("x2") + "," + line.attr("y2");
        
        // Try to find nodes at these coordinates
        let sourceNode = null, targetNode = null;
        d3.selectAll("circle").each(function() {
            const node = d3.select(this);
            const x = node.attr("cx");
            const y = node.attr("cy");
            
            if (x + "," + y === source) sourceNode = node.attr("data-id");
            if (x + "," + y === target) targetNode = node.attr("data-id");
        });
        
        if (sourceNode && targetNode) {
            if (!links[sourceNode]) links[sourceNode] = {};
            links[sourceNode][targetNode] = this;
        }
    });
    
    return { nodeMap, links };
}

// Cierra la ventana emergente
function closeModal() {
    document.getElementById("searchModal").style.display = "none";
}
