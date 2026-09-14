import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Callout, Card, H3 } from '@blueprintjs/core';
import { VIEWER_ID_STORAGE_KEY } from '../../features/PeerConnection';

function getScreenshotError(status: number): string {
	if (status === 403) return '当前浏览器尚未获得截图权限。';
	if (status === 409) return '电脑端尚未选择要截图的屏幕。';
	if (status === 404) return '已选择的屏幕当前不可用。';
	return `获取当前画面失败（${status}）。`;
}

function SnapshotView() {
	const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [updatedAt, setUpdatedAt] = useState('');
	const screenshotUrlRef = useRef<string | null>(null);

	useEffect(() => {
		return () => {
			if (screenshotUrlRef.current) {
				URL.revokeObjectURL(screenshotUrlRef.current);
			}
		};
	}, []);

	const requestScreenshot = useCallback(async () => {
		setIsLoading(true);
		setErrorMessage('');

		try {
			const viewerID = window.localStorage.getItem(VIEWER_ID_STORAGE_KEY) ?? '';
			const response = await fetch('/api/screenshot', {
				cache: 'no-store',
				headers: {
					'X-Deskreen-Viewer-Id': viewerID,
				},
			});

			if (!response.ok) {
				throw new Error(getScreenshotError(response.status));
			}

			const nextUrl = URL.createObjectURL(await response.blob());
			if (screenshotUrlRef.current) {
				URL.revokeObjectURL(screenshotUrlRef.current);
			}
			screenshotUrlRef.current = nextUrl;
			setScreenshotUrl(nextUrl);
			setUpdatedAt(new Date().toLocaleTimeString());
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : '获取当前画面失败。',
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundColor: '#101820',
				padding: '16px',
			}}
		>
			<Card
				elevation={4}
				style={{
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					gap: '12px',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						gap: '12px',
						flexWrap: 'wrap',
					}}
				>
					<div>
						<H3 style={{ margin: 0 }}>按需屏幕截图</H3>
						{updatedAt && <div>最后更新：{updatedAt}</div>}
					</div>
					<Button
						icon={'camera'}
						intent={'primary'}
						large
						loading={isLoading}
						onClick={() => void requestScreenshot()}
					>
						获取当前画面
					</Button>
				</div>

				{errorMessage && <Callout intent={'danger'}>{errorMessage}</Callout>}

				<div
					style={{
						flex: 1,
						minHeight: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#000',
						color: '#fff',
					}}
				>
					{screenshotUrl ? (
						<img
							src={screenshotUrl}
							alt={'当前屏幕画面'}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'contain',
							}}
						/>
					) : (
						<div style={{ textAlign: 'center', padding: '24px' }}>
							点击“获取当前画面”后才会从电脑传输一张截图。
						</div>
					)}
				</div>
			</Card>
		</div>
	);
}

export default SnapshotView;
