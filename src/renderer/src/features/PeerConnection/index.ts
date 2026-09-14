import { prepare as prepareMessage } from '../../utils/message';
import { connectSocket } from '../../../../common/connectSocket';
import handleCreatePeer from './handleCreatePeer';
import handleSocket from './handleSocket';
import { handleRecieveEncryptedMessage } from '../../utils/handleRecieveEncryptedMessage';
import handleSelfDestroy from './handleSelfDestroy';
import NullUser from './NullUser';
import NullSimplePeer from './NullSimplePeer';
import getAppLanguage from '../../../../common/getAppLanguage';

import { Device } from '../../../../common/Device';
import { LocalPeerUser } from '../../../../common/LocalPeerUser';
import type { SendEncryptedMessagePayload } from '../../../../common/SendEncryptedMessagePayload';
import { Socket } from 'socket.io-client';

export interface PartnerPeerUser {
	username: string;
}

export default class PeerConnection {
	sharingSessionID: string;
	roomID: string;
	socket: Socket;
	user: LocalPeerUser;
	partner: PartnerPeerUser;
	peer = NullSimplePeer;
	desktopCapturerSourceID: string;
	isSocketRoomLocked: boolean;
	partnerDeviceDetails = {
		id: '',
		sharingSessionID: '',
		deviceOS: '',
		deviceType: '',
		deviceIP: '',
		deviceBrowser: '',
		deviceScreenWidth: 0,
		deviceScreenHeight: 0,
	} as Device;
	signalsDataToCallUser: string[];
	isCallStarted: boolean;
	onDeviceConnectedCallback: (device: Device) => void;
	beforeunloadHandler: (() => void) | null = null;

	constructor(
		roomID: string,
		sharingSessionID: string,
		user: LocalPeerUser,
		port: string,
	) {
		this.sharingSessionID = sharingSessionID;
		this.isSocketRoomLocked = false;
		this.roomID = encodeURI(roomID);
		this.socket = connectSocket(port, this.roomID);
		this.user = user;
		this.partner = NullUser;
		this.desktopCapturerSourceID = '';
		this.signalsDataToCallUser = [];
		this.isCallStarted = false;
		this.onDeviceConnectedCallback = () => {
			// noop until UI layer registers callback
		};

		handleSocket(this);

		this.beforeunloadHandler = () => {
			this.socket.emit('USER_DISCONNECT');
		};
		window.addEventListener('beforeunload', this.beforeunloadHandler);
	}

	notifyClientWithNewLanguage(): void {
		setTimeout(async () => {
			this.sendEncryptedMessage({
				type: 'APP_LANGUAGE',
				payload: {
					value: await getAppLanguage(),
				},
			});
		}, 1000);
	}

	async setDesktopCapturerSourceID(id: string): Promise<void> {
		this.desktopCapturerSourceID = id;
		if (import.meta.env.MODE === 'test') return;

		await this.createPeer();
	}

	setOnDeviceConnectedCallback(callback: (device: Device) => void): void {
		this.onDeviceConnectedCallback = callback;
	}

	async denyConnectionForPartner(): Promise<void> {
		await this.sendEncryptedMessage({
			type: 'DENY_TO_CONNECT',
			payload: {},
		});
		this.disconnectPartner();
	}

	sendUserAllowedToConnect(): void {
		this.sendEncryptedMessage({
			type: 'ALLOWED_TO_CONNECT',
			payload: {},
		});
	}

	async disconnectByHostMachineUser(deviceId: string): Promise<void> {
		if (this.partnerDeviceDetails.id !== deviceId) {
			return;
		}
		await this.sendEncryptedMessage({
			type: 'DISCONNECT_BY_HOST_MACHINE_USER',
			payload: {},
		});
		this.disconnectPartner();
		this.selfDestroy();
	}

	disconnectPartner(): void {
		this.socket.emit('DISCONNECT_SOCKET_BY_DEVICE_IP', {
			ip: this.partnerDeviceDetails.deviceIP,
		});

		this.partnerDeviceDetails = {} as Device;
	}

	selfDestroy(): void {
		handleSelfDestroy(this);
	}

	emitUserEnter(): void {
		this.socket.emit('USER_ENTER', {
			username: this.user.username,
		});
	}

	async sendEncryptedMessage(
		payload: SendEncryptedMessagePayload,
	): Promise<void> {
		if (!this.socket) return;
		if (!this.user) return;
		if (!this.partner) return;
		if (!this.partner.username) return;
		const msg = await prepareMessage(payload, this.user);
		this.socket.emit('MESSAGE', msg.toSend);
	}

	receiveEncryptedMessage(payload: ReceiveEncryptedMessagePayload): void {
		if (!this.user) return;
		handleRecieveEncryptedMessage(this, payload);
	}

	callPeer(): void {
		if (import.meta.env.MODE === 'test') return;
		if (this.isCallStarted) return;
		this.isCallStarted = true;

		this.signalsDataToCallUser.forEach((data: string) => {
			this.sendEncryptedMessage({
				type: 'CALL_USER',
				payload: {
					signalData: data,
				},
			});
		});
	}

	createPeer(): Promise<void> {
		return handleCreatePeer(this);
	}

	toggleLockRoom(isConnected: boolean): void {
		this.socket.emit('TOGGLE_LOCK_ROOM');
		this.isSocketRoomLocked = isConnected;
	}
}
