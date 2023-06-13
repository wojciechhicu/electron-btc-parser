// Function to navigate to a different view
export function navigateTo(baseFilesPath: string) {
	const viewFrame = document.getElementById("content");
	if (viewFrame !== null) {
		Promise.all([
			fetch(`${baseFilesPath}.html`).then((response) =>
				response.text()
			),
			fetch(`${baseFilesPath}.css`).then((response) =>
				response.text()
			),
			fetch(`${baseFilesPath}.js`).then((response) =>
				response.text()
			)
		])
			.then(([html, css, js]) => {
				viewFrame.innerHTML = html;

				const styles = document.createElement("style");
				styles.textContent = css;
				viewFrame.appendChild(styles);

				const script = document.createElement("script");
				script.textContent = js;
				viewFrame.appendChild(script);
			})
			.catch((err) => {
				console.error(
					"Error while loading files: ",
					err
				);
			});
	} else {
		alert("Frame is null");
	}
}
