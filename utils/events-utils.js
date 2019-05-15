export function triggerMethodOn(context, ...args) {
	if (context.triggerMethod) {
		return context.triggerMethod(...args);
	} else {
		return context.trigger(...args);
	}
}

export async function triggerMethodOnAsync(context, ...args) {
	if (context.triggerMethodAsync) {
		return await context.triggerMethodAsync(...args);
	} else {
		return await context.triggerAsync(...args);
	}
}
