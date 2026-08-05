export interface ActionsHandler {
	actions(): Record<string, () => void>;
}