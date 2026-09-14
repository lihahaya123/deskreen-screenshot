import { IpcEvents } from '../common/IpcEvents.enum';
import { getDeskreenGlobal } from '../main/helpers/getDeskreenGlobal';
import { deskreenApp } from '../main';
import { Device } from '../common/Device';
import SharingSessionStatusEnum from '../features/SharingSessionService/SharingSessionStatusEnum';

export function onDeviceConnectedCallback(device: Device): void {
	const deskreenGlobal = getDeskreenGlobal();
	const { connectedDevicesService, sharingSessionService, roomIDService } =
		deskreenGlobal;
	if (!connectedDevicesService.isSlotAvailable()) {
		const waitingSession =
			sharingSessionService.waitingForConnectionSharingSession;
		waitingSession?.denyConnectionForPartner();
		waitingSession?.setStatus(SharingSessionStatusEnum.NOT_CONNECTED);
		sharingSessionService.waitingForConnectionSharingSession = null;
		connectedDevicesService.resetPendingConnectionDevice();
		return;
	}

	const trustedSourceID =
		connectedDevicesService.getTrustedReconnectSourceID(device.id);
	if (trustedSourceID) {
		const waitingSession =
			sharingSessionService.waitingForConnectionSharingSession;
		if (waitingSession) {
			void (async () => {
				try {
					waitingSession.setDeviceID(device.id);
					await waitingSession.setDesktopCapturerSourceID(trustedSourceID);
					connectedDevicesService.addDevice(device);
					roomIDService.unmarkRoomIDAsTaken(waitingSession.roomID);
					waitingSession.setStatus(SharingSessionStatusEnum.CONNECTED);
					waitingSession.callPeer();
					waitingSession.setStatus(SharingSessionStatusEnum.SHARING);
					sharingSessionService.waitingForConnectionSharingSession = null;
					connectedDevicesService.resetPendingConnectionDevice();
				} catch (error) {
					console.error('Failed to automatically reconnect trusted device', error);
					connectedDevicesService.forgetTrustedDevice(device.id);
					connectedDevicesService.setPendingConnectionDevice(device);
					deskreenApp.mainWindow?.webContents.send(
						IpcEvents.SetPendingConnectionDevice,
						device,
					);
				}
			})();
			return;
		}
	}
	connectedDevicesService.setPendingConnectionDevice(device);
	deskreenApp.mainWindow?.webContents.send(
		IpcEvents.SetPendingConnectionDevice,
		device,
	);
}
