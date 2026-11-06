export interface LayoutState {
	navMenuOpen: boolean;
}

const initialLayoutState: LayoutState = {
	navMenuOpen: false
};

export const layoutState = $state(initialLayoutState);

export function layoutState$$setNavMenuOpen(navMenuOpen: boolean): void {
	layoutState.navMenuOpen = navMenuOpen;
}

export function layoutState$$toggleNavMenu(): void {
	debugger;
	layoutState.navMenuOpen = !layoutState.navMenuOpen;
}
