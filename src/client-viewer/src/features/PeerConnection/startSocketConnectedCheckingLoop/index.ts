import PeerConnection from '..';
import { ErrorMessage } from '../../../components/ErrorDialog/ErrorMessageEnum';
import setAndShowErrorDialogMessage from '../setAndShowErrorDialogMessage';

export default (peerConnection: PeerConnection): NodeJS.Timeout => {
	let disconnectedStreak = 0;
	let pingTimeout: NodeJS.Timeout | null = null;

	const checkConnection = () => {
		const socket = peerConnection.socket;
		if (!socket) {
			disconnectedStreak++;
			handleDisconnection();
			return;
		}
		const isSocketConnected = !!socket.connected;

		if (isSocketConnected) {
			// perform explicit ping/pong check to verify server is alive
			try {
				if (pingTimeout) {
					clearTimeout(pingTimeout);
				}

				const timeout = setTimeout(() => {
					// ping timeout - server didn't respond
					disconnectedStreak++;
					handleDisconnection();
				}, 3000);

				pingTimeout = timeout;

				socket.emit('PING', (response: string) => {
					if (pingTimeout) {
						clearTimeout(pingTimeout);
						pingTimeout = null;
					}

					if (response === 'PONG') {
						disconnectedStreak = 0;
					} else {
						disconnectedStreak++;
						handleDisconnection();
					}
				});
			} catch {
				// socket error during ping
				disconnectedStreak++;
				handleDisconnection();
			}
		} else {
			// socket is not connected
			disconnectedStreak++;
			handleDisconnection();
		}
	};

	const handleDisconnection = () => {
		if (disconnectedStreak >= 3) {
			if (peerConnection.isPeerConnected) {
				peerConnection.stopPeer();
			}
			setAndShowErrorDialogMessage(peerConnection, ErrorMessage.DISCONNECTED);
		}
	};

	return setInterval(checkConnection, 5000);
};
