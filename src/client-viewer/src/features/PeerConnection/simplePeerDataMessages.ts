export function prepareDataMessageToGetSharingSourceType() {
	return JSON.stringify({
		type: 'get_sharing_source_type',
		payload: {},
	});
}
