import { session } from 'electron';
import { downloadChromeExtension } from 'electron-devtools-installer/dist/downloadChromeExtension';

const REACT_DEVELOPER_TOOLS_ID = 'fmkadmapgofadopljbjfkapdkoienihi';

export default async function installExtensions(): Promise<void> {
	try {
		const extensions = session.defaultSession.extensions;
		const installedExtension = extensions
			.getAllExtensions()
			.find(({ id }) => id === REACT_DEVELOPER_TOOLS_ID);
		const react =
			installedExtension ||
			(await extensions.loadExtension(
				await downloadChromeExtension(REACT_DEVELOPER_TOOLS_ID),
			));

		console.log(`Added Extensions: ${react.name}`);
	} catch (err) {
		console.log('An error occurred: ', err);
	}
}
