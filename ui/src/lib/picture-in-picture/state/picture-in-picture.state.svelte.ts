export interface PictureInPictureState {
	pictureInPicture: boolean;
}

const initialPictureInPictureState: PictureInPictureState = {
	pictureInPicture: false
};

export const pictureInPictureState = $state(initialPictureInPictureState);

export function pictureInPictureState$$setPictureInPicture(pictureInPicture: boolean): void {
	pictureInPictureState.pictureInPicture = pictureInPicture;
}
