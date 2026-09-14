import {
	prepareDataMessageToGetSharingSourceType,
} from './simplePeerDataMessages';
import { ErrorMessage } from '../../components/ErrorDialog/ErrorMessageEnum';
import PeerConnectionPeerIsNullError from './errors/PeerConnectionPeerIsNullError';
import { ScreenSharingSource } from './ScreenSharingSourceEnum';

export function getSharingShourceType(peerConnection: PeerConnection) {
	try {
		peerConnection.peer?.send(prepareDataMessageToGetSharingSourceType());
	} catch (e) {
		console.log(e);
	}
}

export default (peerConnection: PeerConnection) => {
	if (peerConnection.peer === null) {
		throw new PeerConnectionPeerIsNullError();
	}
	peerConnection.peer.on('connect', () => {
		peerConnection.setSnapshotReadyCallback(true);
		peerConnection.isStreamStarted = true;
		getSharingShourceType(peerConnection);

		try {
			peerConnection.UIHandler.setIsErrorDialogOpen(false);
			peerConnection.UIHandler.errorDialogMessage = ErrorMessage.UNKNOWN_ERROR;
		} catch (_) {
			// ignore
		}
	});

	peerConnection.peer.on('signal', (data) => {
		// fired when webrtc done preparation to start call on peerConnection machine
		peerConnection.sendEncryptedMessage({
			type: 'CALL_ACCEPTED',
			payload: {
				signalData: data,
			},
		});
	});

	peerConnection.peer.on('data', (data) => {
		const dataJSON = JSON.parse(data);

		if (dataJSON.type === 'screen_sharing_source_type') {
			peerConnection.screenSharingSourceType = dataJSON.payload.value;
			if (
				peerConnection.screenSharingSourceType === ScreenSharingSource.SCREEN ||
				peerConnection.screenSharingSourceType === ScreenSharingSource.WINDOW
			) {
				peerConnection.UIHandler.setScreenSharingSourceTypeCallback(
					peerConnection.screenSharingSourceType,
				);
			}
		}
	});
};
