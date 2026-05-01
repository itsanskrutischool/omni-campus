---
description: Generate knowledge graph from code, docs, papers, and images
---

# /graphify - Knowledge Graph Generation

Turn any folder of files into a navigable knowledge graph with community detection, an honest audit trail, and three outputs: interactive HTML, GraphRAG-ready JSON, and a plain-language GRAPH_REPORT.md.

## Usage

```
/graphify                                             # full pipeline on current directory
/graphify <path>                                      # full pipeline on specific path
/graphify <path> --mode deep                          # thorough extraction, richer INFERRED edges
/graphify <path> --update                             # incremental - re-extract only new/changed files
/graphify <path> --directed                            # build directed graph (preserves edge direction)
/graphify <path> --cluster-only                       # rerun clustering on existing graph
/graphify <path> --no-viz                             # skip visualization, just report + JSON
/graphify <path> --svg                                # also export graph.svg (embeds in Notion, GitHub)
/graphify <path> --graphml                            # export graph.graphml (Gephi, yEd)
/graphify <path> --neo4j                              # generate cypher.txt for Neo4j
/graphify <path> --neo4j-push bolt://localhost:7687   # push directly to Neo4j
/graphify <path> --obsidian                           # build Obsidian vault
/graphify <path> --obsidian-dir ~/vaults/my-project    # write vault to custom path
/graphify <path> --wiki                               # build agent-crawlable wiki
/graphify <path> --mcp                                # start MCP stdio server
/graphify <path> --watch                              # watch folder, auto-rebuild on changes
/graphify add <url>                                   # fetch URL, save to ./raw, update graph
/graphify query "<question>"                          # BFS traversal - broad context
/graphify query "<question>" --dfs                    # DFS - trace specific path
/graphify path "AuthModule" "Database"                # shortest path between two concepts
/graphify explain "SwinTransformer"                   # plain-language explanation of a node
```

## What graphify is for

graphify is built around Andrej Karpathy's /raw folder workflow: drop anything into a folder - papers, tweets, screenshots, code, notes - and get a structured knowledge graph that shows you what you didn't know was connected.

Three things it does that your AI assistant alone cannot:
1. **Persistent graph** - relationships are stored in `graphify-out/graph.json` and survive across sessions
2. **Honest audit trail** - every edge is tagged EXTRACTED, INFERRED, or AMBIGUOUS
3. **Cross-document surprise** - community detection finds connections between concepts in different files

Use it for:
- A codebase you're new to (understand architecture before touching anything)
- A reading list (papers + tweets + notes → one navigable graph)
- A research corpus (citation graph + concept graph in one)
- Your personal /raw folder (drop everything in, let it grow, query it)

## Execution Steps

If no path was given, use `.` (current directory).

### Step 1 - Ensure graphify is installed

```powershell
python -c "import graphify" 2>$null
if ($LASTEXITCODE -ne 0) { pip install graphifyy -q 2>&1 | Select-Object -Last 3 }
python -c "import sys; open('.graphify_python', 'w').write(sys.executable)"
```

### Step 2 - Detect files

```powershell
python -c "
import json
from graphify.detect import detect
from pathlib import Path
result = detect(Path('INPUT_PATH'))
print(json.dumps(result))
" > .graphify_detect.json
```

Replace INPUT_PATH with the actual path. Present summary:
```
Corpus: X files · ~Y words
  code:     N files
  docs:     N files
  papers:   N files
  images:   N files
```

### Step 3 - Extract entities and relationships

**Run Part A (AST) and Part B (semantic) in parallel.**

#### Part A - Structural extraction for code files

```powershell
python -c "
import sys, json
from graphify.extract import collect_files, extract
from pathlib import Path

code_files = []
detect = json.loads(Path('.graphify_detect.json').read_text())
for f in detect.get('files', {}).get('code', []):
    code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])

if code_files:
    result = extract(code_files)
    Path('.graphify_ast.json').write_text(json.dumps(result, indent=2))
    print(f'AST: {len(result[\"nodes\"])} nodes, {len(result[\"edges\"])} edges')
else:
    Path('.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}))
    print('No code files - skipping AST extraction')
"
```

#### Part B - Semantic extraction

For docs, papers, and images - use AI to extract concepts and relationships. Split files into chunks of 20-25 each and process in parallel.

### Step 4 - Build graph, cluster, analyze, generate outputs

```powershell
New-Item -ItemType Directory -Force -Path graphify-out | Out-Null
python -c "
import sys, json
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from pathlib import Path

extraction = json.loads(Path('.graphify_extract.json').read_text())
detection  = json.loads(Path('.graphify_detect.json').read_text())

G = build_from_json(extraction)
communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: 'Community ' + str(cid) for cid in communities}
questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, 'INPUT_PATH', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report)
to_json(G, communities, 'graphify-out/graph.json')

print(f'Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities')
"
```

### Step 5 - Generate HTML visualization

```powershell
python -c "
import sys, json
from graphify.build import build_from_json
from graphify.export import to_html
from pathlib import Path

extraction = json.loads(Path('.graphify_extract.json').read_text())
analysis   = json.loads(Path('.graphify_analysis.json').read_text())
labels_raw = json.loads(Path('.graphify_labels.json').read_text()) if Path('.graphify_labels.json').exists() else {}

G = build_from_json(extraction)
communities = {int(k): v for k, v in analysis['communities'].items()}
labels = {int(k): v for k, v in labels_raw.items()}

if G.number_of_nodes() > 5000:
    print(f'Graph has {G.number_of_nodes()} nodes - too large for HTML viz')
else:
    to_html(G, communities, 'graphify-out/graph.html', community_labels=labels or None)
    print('graph.html written - open in any browser, no server needed')
"
```

### Step 6 - Clean up and report

```powershell
Remove-Item -ErrorAction SilentlyContinue .graphify_detect.json, .graphify_extract.json, .graphify_ast.json, .graphify_semantic.json, .graphify_analysis.json, .graphify_labels.json
```

Tell the user:
```
Graph complete. Outputs in PATH_TO_DIR/graphify-out/

  graph.html            - interactive graph, open in browser
  GRAPH_REPORT.md       - audit report
  graph.json            - raw graph data
```

Then paste from GRAPH_REPORT.md:
- God Nodes
- Surprising Connections
- Suggested Questions
