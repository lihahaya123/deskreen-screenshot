import {
	ErrorMessage,
	type ErrorMessageType,
} from '../../components/ErrorDialog/ErrorMessageEnum';

export default (
	peerConnection: PeerConnection,
	errorMessage: ErrorMessageType,
) => {
	const isDisconnectError = errorMessage === ErrorMessage.DISCONNECTED;
	if (peerConnection.isPeerConnected && !isDisconnectError) {
		// Avoid flashing an error after the peer is ready, except on disconnect.
		return;
	}
	if (
		peerConnection.UIHandler.errorDialogMessage ===
			ErrorMessage.UNKNOWN_ERROR ||
		isDisconnectError
	) {
		peerConnection.UIHandler.setDialogErrorMessageCallback(errorMessage);
		peerConnection.UIHandler.setIsErrorDialogOpen(true);
		peerConnection.UIHandler.errorDialogMessage = errorMessage;
	}
};
