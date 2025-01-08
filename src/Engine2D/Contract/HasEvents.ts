import type { NodeEvent } from "../Core/NodeEvent";

export type NodeEventListener<TEvent extends NodeEvent = NodeEvent> = (event: TEvent) => void;
export type NodeEvents = { [key: string]: NodeEvent };

export interface HasEvents<TNodeEvents extends NodeEvents> {
	addListener(type: keyof TNodeEvents, callback: NodeEventListener): void;
	removeListener(type: keyof TNodeEvents, callback: NodeEventListener): void;
	dispatchEvent<Type extends keyof TNodeEvents>(event: TNodeEvents[Type]): void;
}
