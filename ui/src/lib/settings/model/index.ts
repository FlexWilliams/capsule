export interface UserSettings {
	lightMode: boolean;
	transcriptionLanguage: string;
}

export const defaultUserSettings: UserSettings = {
	lightMode: true,
	transcriptionLanguage: 'auto'
};
