document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('dropZone');
    const landingState = document.getElementById('landingState');
    const notebookContainer = document.getElementById('notebookContainer');

    // Event Listeners
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    // Drag and Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.name.endsWith('.ipynb')) {
            alert('Please select a valid .ipynb file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const notebookData = JSON.parse(e.target.result);
                renderNotebook(notebookData);
            } catch (err) {
                console.error('Parsing error:', err);
                alert('Error reading notebook: ' + err.message);
            }
        };
        reader.onerror = () => alert('Error reading file');
        reader.readAsText(file);
    }

    function renderNotebook(notebook) {
        // Clear previous
        notebookContainer.innerHTML = '';

        if (!notebook.cells || !Array.isArray(notebook.cells)) {
            alert('Invalid notebook format');
            return;
        }

        // Add PDF Download Action Header
        const actionHeader = document.createElement('div');
        actionHeader.className = 'notebook-action-header';
        actionHeader.innerHTML = `
            <div class="success-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Notebook Loaded Successfully
            </div>
            <button onclick="window.print()" class="btn-primary download-pdf-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download as PDF
            </button>
        `;
        notebookContainer.appendChild(actionHeader);

        notebook.cells.forEach((cell, index) => {
            const cellEl = createCell(cell);
            notebookContainer.appendChild(cellEl);
        });

        // Toggle UI
        landingState.classList.add('hidden');
        notebookContainer.classList.remove('hidden');

        // Syntax Highlighting
        Prism.highlightAll();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function createCell(cell) {
        const cellDiv = document.createElement('div');
        cellDiv.className = `cell cell-${cell.cell_type}`;

        // Source cleaning
        const source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');

        if (cell.cell_type === 'markdown') {
            const content = document.createElement('div');
            content.className = 'cell-markdown';
            const html = marked.parse(source);
            content.innerHTML = DOMPurify.sanitize(html);
            cellDiv.appendChild(content);
        }
        else if (cell.cell_type === 'code') {
            // Code block
            const codeBlock = document.createElement('div');
            codeBlock.className = 'cell-code';

            const prompt = document.createElement('div');
            prompt.className = 'cell-prompt';
            prompt.textContent = `In [${cell.execution_count || ' '}]:`;

            const container = document.createElement('div');
            container.className = 'code-container';
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.className = 'language-python';
            code.textContent = source;

            pre.appendChild(code);
            container.appendChild(pre);
            codeBlock.appendChild(prompt);
            codeBlock.appendChild(container);
            cellDiv.appendChild(codeBlock);

            // Outputs
            if (cell.outputs && Array.isArray(cell.outputs)) {
                cell.outputs.forEach(output => {
                    const outputEl = createOutput(output, cell.execution_count);
                    if (outputEl) cellDiv.appendChild(outputEl);
                });
            }
        }

        return cellDiv;
    }

    function createOutput(output, executionCount) {
        const wrapper = document.createElement('div');
        wrapper.className = 'cell-output';

        const prompt = document.createElement('div');
        prompt.className = 'cell-prompt cell-prompt-out';
        // Only show 'Out' for execute_result, similar to Jupyter
        if (output.output_type === 'execute_result' && executionCount) {
            prompt.textContent = `Out [${executionCount}]:`;
        }
        wrapper.appendChild(prompt);

        const dataContainer = document.createElement('div');
        dataContainer.className = 'output-data-container';

        if (output.output_type === 'stream') {
            const text = Array.isArray(output.text) ? output.text.join('') : output.text;
            const div = document.createElement('div');
            div.className = 'output-data-text';
            div.textContent = text;
            dataContainer.appendChild(div);
        }
        else if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
            const data = output.data;
            if (!data) return null;

            if (data['image/png']) {
                appendImage(data['image/png'], 'png', dataContainer);
            } else if (data['image/jpeg']) {
                appendImage(data['image/jpeg'], 'jpeg', dataContainer);
            } else if (data['text/html']) {
                const div = document.createElement('div');
                div.className = 'output-data-html';
                const html = Array.isArray(data['text/html']) ? data['text/html'].join('') : data['text/html'];
                div.innerHTML = DOMPurify.sanitize(html);
                dataContainer.appendChild(div);
            } else if (data['text/plain']) {
                const div = document.createElement('div');
                div.className = 'output-data-text';
                const text = Array.isArray(data['text/plain']) ? data['text/plain'].join('') : data['text/plain'];
                div.textContent = text;
                dataContainer.appendChild(div);
            }
        }
        else if (output.output_type === 'error') {
            const div = document.createElement('div');
            div.className = 'output-data-text error';
            div.style.color = '#bf616a';
            div.textContent = output.traceback ? output.traceback.join('\n') : output.ename;
            dataContainer.appendChild(div);
        }

        wrapper.appendChild(dataContainer);
        return dataContainer.childElementCount > 0 ? wrapper : null;
    }

    function appendImage(base64Data, type, container) {
        const div = document.createElement('div');
        div.className = 'output-data-image';
        const img = document.createElement('img');
        // Handle both string and array of strings
        const cleanData = Array.isArray(base64Data) ? base64Data.join('') : base64Data;
        img.src = `data:image/${type};base64,${cleanData.trim()}`;
        div.appendChild(img);
        container.appendChild(div);
    }
});
