import * as vscode from 'vscode';

// Track the last known content length to detect insertions
let lastContentLength = 0;
// Store the last detected AI insertion range
let lastAIInsertionRange: vscode.Range | null = null;

export function activate(context: vscode.ExtensionContext) {
	// Register a text document change listener
	const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor || event.document !== editor.document) {
			return;
		}

		// Process each content change
		for (const change of event.contentChanges) {
			const currentLength = editor.document.getText().length;

			// Only process insertions (not deletions or replacements)
			if (currentLength > lastContentLength) {
				const insertedText = change.text;

				// Skip if the change is too small or empty
				if (!insertedText || insertedText.length < 3) {
					continue;
				}

				// Heuristics to detect AI-generated code
				const isLikelyAIGenerated = (
					// Check for common code structures
					insertedText.includes('function') ||
					insertedText.includes('class') ||
					// Check for multiple lines (at least 3)
					insertedText.split('\n').length > 3 ||
					// Check for code block markers
					insertedText.includes('```') ||
					// Check for common import patterns
					/import.*from/.test(insertedText)
				);

				if (isLikelyAIGenerated) {
					// Store the insertion range for later use
					lastAIInsertionRange = new vscode.Range(
						change.range.start,
						change.range.end
					);

					// Show notification with action button
					vscode.window.showInformationMessage(
						'AI likely finished writing code',
						'Go to it'
					).then(selection => {
						if (selection === 'Go to it' && lastAIInsertionRange) {
							// Reveal the range in the editor
							editor.revealRange(
								lastAIInsertionRange,
								vscode.TextEditorRevealType.InCenter
							);

							// Move cursor to the start of the insertion
							editor.selection = new vscode.Selection(
								lastAIInsertionRange.start,
								lastAIInsertionRange.start
							);
						}
					});
				}
			}

			// Update the last known content length
			lastContentLength = currentLength;
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {
	// Clean up if needed
	lastAIInsertionRange = null;
	lastContentLength = 0;
} 