import { useEffect, useState } from 'react';
import { Grid } from 'react-flexbox-grid';
import './index.css';
import PeerConnection from '../../features/PeerConnection';
import ErrorDialog from '../../components/ErrorDialog';
import {
	ErrorMessage,
	type ErrorMessageType,
} from '../../components/ErrorDialog/ErrorMessageEnum';
import ConnectionPropmpts from '../../containers/ConnectionPrompts';
import SnapshotView from '../../containers/SnapshotView';
import { DUMMY_MY_DEVICE_DETAILS } from '../../constants/appConstants';
import handleNoConnectionTimeout from './handleNoConnectionTimeout';
import handleCreatePeerConnection from './handleCreatePeerConnection';
import handleDisplayingLoadingSharingIconLoop from './handleDisplayingLoadingSharingIconLoop';
import { ScreenSharingSource } from '../../features/PeerConnection/ScreenSharingSourceEnum';
import ConnectionIcon from './ConnectionIconEnum';
import { LoadingSharingIconEnum } from './LoadingSharingIconEnum';

function MainView() {
	const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);

	const [promptStep, setPromptStep] = useState(1);
	const [dialogErrorMessage, setDialogErrorMessage] =
		useState<ErrorMessageType>(ErrorMessage.UNKNOWN_ERROR);
	const [connectionIconType, setConnectionIconType] =
		useState<ConnectionIconType>(ConnectionIcon.FEED);
	const [myDeviceDetails, setMyDeviceDetails] = useState<DeviceDetails>(
		DUMMY_MY_DEVICE_DETAILS,
	);

	const [, setScreenSharingSourceType] =
		useState<ScreenSharingSourceType>(ScreenSharingSource.SCREEN);
	const [isSnapshotReady, setSnapshotReady] = useState(false);
	const [isShownTextPrompt, setIsShownTextPrompt] = useState(false);
	const [isShownLoadingSharingIcon, setIsShownLoadingSharingIcon] =
		useState(false);
	const [loadingSharingIconType, setLoadingSharingIconType] =
		useState<LoadingSharingIconType>(LoadingSharingIconEnum.DESKTOP);
	const [peer, setPeer] = useState<undefined | PeerConnection>();
	const [connectionRoomId, setConnectionRoomId] = useState<string>('');

	useEffect(() => {
		let cancelled = false;
		let retryTimer: ReturnType<typeof setTimeout> | undefined;

		const resolveCurrentRoom = async (): Promise<void> => {
			try {
				const response = await fetch('/api/current-room', {
					cache: 'no-store',
				});
				if (!response.ok) {
					throw new Error(`room is not ready: ${response.status}`);
				}

				const data = (await response.json()) as { roomId?: string };
				if (!cancelled && data.roomId) {
					setConnectionRoomId(data.roomId);
					return;
				}
			} catch (error) {
				console.log('Waiting for an available sharing session', error);
			}

			if (!cancelled) {
				retryTimer = setTimeout(() => {
					void resolveCurrentRoom();
				}, 1000);
			}
		};

		void resolveCurrentRoom();

		return () => {
			cancelled = true;
			if (retryTimer) {
				clearTimeout(retryTimer);
			}
		};
	}, []);

	useEffect(handleNoConnectionTimeout(myDeviceDetails, setIsErrorDialogOpen), [
		myDeviceDetails,
	]);

	useEffect(
		handleCreatePeerConnection({
			peer,
			connectionRoomId,
			setMyDeviceDetails,
			setConnectionIconType,
			setIsShownTextPrompt,
			setPromptStep,
			setScreenSharingSourceType,
			setDialogErrorMessage,
			setIsErrorDialogOpen,
			setSnapshotReady,
			setPeer,
		}),
		[connectionRoomId],
	);

	useEffect(
		handleDisplayingLoadingSharingIconLoop({
			promptStep,
			isSnapshotReady,
			setIsShownLoadingSharingIcon,
			loadingSharingIconType,
			isShownLoadingSharingIcon,
			setLoadingSharingIconType,
		}),
		[promptStep, isSnapshotReady],
	);

	return (
		<Grid>
			{isSnapshotReady ? (
				<SnapshotView />
			) : (
				<ConnectionPropmpts
					myDeviceDetails={myDeviceDetails}
					isShownTextPrompt={isShownTextPrompt}
					promptStep={promptStep}
					connectionIconType={connectionIconType}
					spinnerIconType={loadingSharingIconType}
					isShownSpinnerIcon={isShownLoadingSharingIcon}
				/>
			)}
			<ErrorDialog
				errorMessage={dialogErrorMessage}
				isOpen={isErrorDialogOpen}
				setIsOpen={setIsErrorDialogOpen}
			/>
		</Grid>
	);
}

export default MainView;
