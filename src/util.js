export function logError(error, additionalMessage = null) {
  const prefix = additionalMessage ? `${additionalMessage}: ` : '';
  console.error(`${prefix}${error.message}${error.stack.join("\n")}`);
}