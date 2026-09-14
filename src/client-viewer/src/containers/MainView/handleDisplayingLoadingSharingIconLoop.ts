import { LoadingSharingIconEnum } from './LoadingSharingIconEnum';

export default (params: handleDisplayingLoadingSharingIconLoopParams) => {
	const {
		promptStep,
		isSnapshotReady,
		setIsShownLoadingSharingIcon,
		loadingSharingIconType,
		isShownLoadingSharingIcon,
		setLoadingSharingIconType,
	} = params;
	return () => {
		let interval: NodeJS.Timeout;
		if (promptStep === 3 && !isSnapshotReady) {
			setIsShownLoadingSharingIcon(true);

			let currentIcon = loadingSharingIconType;
			let isShownIcon = isShownLoadingSharingIcon;
			let isShownWithFadingUIEffect = false;
			interval = setInterval(() => {
				isShownIcon = !isShownIcon;
				setIsShownLoadingSharingIcon(isShownIcon);
				if (isShownWithFadingUIEffect) {
					currentIcon =
						currentIcon === LoadingSharingIconEnum.DESKTOP
							? LoadingSharingIconEnum.APPLICATION
							: LoadingSharingIconEnum.DESKTOP;
					setLoadingSharingIconType(currentIcon);
					isShownWithFadingUIEffect = false;
				} else {
					isShownWithFadingUIEffect = true;
				}
			}, 1500);
		}

		return () => {
			clearInterval(interval);
		};
	};
};
