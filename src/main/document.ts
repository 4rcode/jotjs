let current = document;

/**
 *
 * @returns
 */
export function getDocument(): Document {
  return current;
}

/**
 *
 * @param document
 */
export function setDocument(document: Document): void {
  current = document;
}
