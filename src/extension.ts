import * as vscode from 'vscode';

// Track the last cursor position and activity timestamp
let lastCursorPosition: vscode.Position | null = null;
let lastActivityTimestamp = Date.now();
let isWaitingForResponse = false;

export function activate(context: vscode.ExtensionContext) {
	// Track cursor position changes
	const cursorTracker = vscode.window.onDidChangeTextEditorSelection((event: vscode.TextEditorSelectionChangeEvent) => {
		const editor = event.textEditor;
		if (!editor) return;

		const currentPosition = editor.selection.active;

		// If cursor hasn't moved but selection changed, might be AI focusing
		if (lastCursorPosition?.line === currentPosition.line &&
			lastCursorPosition?.character === currentPosition.character) {
			const timeSinceLastActivity = Date.now() - lastActivityTimestamp;

			// If we were waiting for a response and there's cursor activity
			if (isWaitingForResponse && timeSinceLastActivity > 500) {
				isWaitingForResponse = false;
				showNotification(editor, currentPosition);
			}
		}

		lastCursorPosition = currentPosition;
		lastActivityTimestamp = Date.now();
	});

	// Track text document changes
	const changeTracker = vscode.workspace.onDidChangeTextDocument((event: vscode.TextDocumentChangeEvent) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor || event.document !== editor.document) return;

		// Set waiting state when document changes
		if (event.contentChanges.length > 0) {
			isWaitingForResponse = true;
			lastActivityTimestamp = Date.now();
		}
	});

	// Track when editor becomes active
	const activeEditorTracker = vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
		if (editor) {
			lastCursorPosition = editor.selection.active;
			lastActivityTimestamp = Date.now();
		}
	});

	context.subscriptions.push(cursorTracker, changeTracker, activeEditorTracker);
}

async function showNotification(editor: vscode.TextEditor, position: vscode.Position) {
	const result = await vscode.window.showInformationMessage(
		'Cursor needs your attention',
		'Go to it'
	);

	if (result === 'Go to it') {
		// Create a range around the cursor position
		const range = new vscode.Range(position, position);

		// Reveal the range in the editor
		editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

		// Move cursor and focus editor
		editor.selection = new vscode.Selection(position, position);
		await vscode.window.showTextDocument(editor.document, {
			selection: range,
			preserveFocus: false
		});
	}
}

export function deactivate() { } 