import { context } from "@opentelemetry/api";
import { ZoneContextManager } from "@opentelemetry/context-zone";

/**
 * Initializes and enables the Zone-based context manager for OpenTelemetry.
 */
export const initContextManager = (): void => {
	const contextManager = new ZoneContextManager();
	contextManager.enable();
	context.setGlobalContextManager(contextManager);
};
